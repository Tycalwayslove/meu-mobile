"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import { defaultGlyph, imageElement, imageRoot, stateLayer } from "./Image.css";
import type { ImageProps, ImageState } from "./types";

function toCssLength(value: number | string | undefined) {
  if (typeof value !== "number") return value;
  return `${Number.isFinite(value) ? Math.max(0, value) : 0}px`;
}

function assignRef<T>(ref: ImageProps["imageRef"], value: T | null) {
  if (typeof ref === "function") ref(value as HTMLImageElement | null);
  else if (ref) ref.current = value as HTMLImageElement | null;
}

/**
 * Renders an image with explicit loading, loaded, and failure states.
 *
 * @public
 */
export function Image({
  alt,
  className,
  crossOrigin,
  decoding = "async",
  draggable = false,
  fallback,
  fit = "cover",
  height,
  imageRef,
  loading = "eager",
  onError,
  onLoad,
  placeholder,
  radius = "none",
  ref,
  referrerPolicy,
  sizes,
  src,
  srcSet,
  style,
  width,
  ...props
}: ImageProps) {
  const normalizedSrc = src ? src.trim() || undefined : undefined;
  const sourceKey = `${normalizedSrc || ""}\u0000${srcSet || ""}`;
  const hasSource = Boolean(normalizedSrc || srcSet);
  const internalImageRef = useRef<HTMLImageElement | null>(null);
  const [sourceState, setSourceState] = useState<{ key: string; state: ImageState }>(() => ({
    key: sourceKey,
    state: hasSource ? "loading" : "error"
  }));
  const state = sourceState.key === sourceKey ? sourceState.state : hasSource ? "loading" : "error";
  const baseStyle = style || {};
  const resolvedStyle: CSSProperties = {
    ...baseStyle,
    width: toCssLength(width) || baseStyle.width,
    height: toCssLength(height) || baseStyle.height
  };
  const classes = imageRoot({ radius });

  useEffect(() => {
    const image = internalImageRef.current;
    if (!image || !image.complete) return;
    const frame = window.requestAnimationFrame(() => {
      setSourceState({ key: sourceKey, state: image.naturalWidth > 0 ? "loaded" : "error" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [sourceKey]);

  const defaultState = <span className={defaultGlyph} aria-hidden="true" />;
  const stateContent =
    state === "error"
      ? fallback !== undefined
        ? fallback
        : defaultState
      : placeholder !== undefined
        ? placeholder
        : defaultState;

  return (
    <div
      {...props}
      ref={ref}
      className={className ? `${classes} ${className}` : classes}
      style={resolvedStyle}
      role={state === "error" && alt ? "img" : undefined}
      aria-label={state === "error" && alt ? alt : undefined}
      aria-hidden={state === "error" && !alt ? true : undefined}
      aria-busy={state === "loading" || undefined}
      data-meu-component="image"
      data-state={state}
    >
      {state === "error" ? (
        <span className={stateLayer({ overlay: false })}>{stateContent}</span>
      ) : null}
      {hasSource && state !== "error" ? (
        <>
          {state === "loading" ? (
            <span className={stateLayer({ overlay: true })} aria-hidden="true">
              {stateContent}
            </span>
          ) : null}
          <img
            ref={(node) => {
              internalImageRef.current = node;
              assignRef(imageRef, node);
            }}
            className={imageElement({ fixedHeight: height !== undefined })}
            src={normalizedSrc}
            srcSet={srcSet}
            sizes={sizes}
            alt={alt}
            crossOrigin={crossOrigin}
            decoding={decoding}
            draggable={draggable}
            loading={loading}
            referrerPolicy={referrerPolicy}
            data-pending={state === "loading" ? "true" : undefined}
            style={{ objectFit: fit }}
            onLoad={(event) => {
              setSourceState({ key: sourceKey, state: "loaded" });
              if (onLoad) onLoad(event);
            }}
            onError={(event) => {
              setSourceState({ key: sourceKey, state: "error" });
              if (onError) onError(event);
            }}
          />
        </>
      ) : null}
    </div>
  );
}
