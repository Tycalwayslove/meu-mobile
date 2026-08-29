"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import { defaultGlyph, imageElement, imageRoot, stateLayer } from "./Image.css";
import type { ImageProps, ImageState } from "./types";

function toCssLength(value: number | string | undefined) {
  if (typeof value !== "number") return value;
  return `${Number.isFinite(value) ? Math.max(0, value) : 0}px`;
}

function toNativeDimension(value: number | string | undefined) {
  if (typeof value !== "number") return undefined;
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function normalizeSource(value: string | undefined) {
  return value ? value.trim() || undefined : undefined;
}

function assignRef(ref: ImageProps["imageRef"], value: HTMLImageElement | null) {
  if (typeof ref === "function") return ref(value);
  if (ref) ref.current = value;
  return undefined;
}

type ImageSourceKind = "primary" | "fallback";
type SourceState = { key: string; source: ImageSourceKind; state: ImageState };

function initialSourceState(
  key: string,
  hasPrimarySource: boolean,
  hasFallbackSource: boolean
): SourceState {
  if (hasPrimarySource) return { key, source: "primary", state: "loading" };
  if (hasFallbackSource) return { key, source: "fallback", state: "loading" };
  return { key, source: "primary", state: "error" };
}

/**
 * Renders an image with explicit loading, loaded, and failure states.
 *
 * @public
 */
export function Image({
  alt,
  aspectRatio,
  className,
  crossOrigin,
  decoding = "async",
  draggable = false,
  fallback,
  fallbackSrc,
  fetchPriority,
  fit = "cover",
  height,
  imageRef,
  imageProps,
  intrinsicHeight,
  intrinsicWidth,
  loading = "eager",
  onError,
  onLoad,
  placeholder,
  position = "50% 50%",
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
  const normalizedSrc = normalizeSource(src);
  const normalizedSrcSet = normalizeSource(srcSet);
  const normalizedFallbackSrc = normalizeSource(fallbackSrc);
  const sourceKey = `${normalizedSrc || ""}\u0000${normalizedSrcSet || ""}\u0000${normalizedFallbackSrc || ""}`;
  const hasPrimarySource = Boolean(normalizedSrc || normalizedSrcSet);
  const hasFallbackSource = Boolean(normalizedFallbackSrc);
  const internalImageRef = useRef<HTMLImageElement | null>(null);
  const [sourceState, setSourceState] = useState<SourceState>(() =>
    initialSourceState(sourceKey, hasPrimarySource, hasFallbackSource)
  );
  if (sourceState.key !== sourceKey) {
    setSourceState(initialSourceState(sourceKey, hasPrimarySource, hasFallbackSource));
  }
  const currentSourceState =
    sourceState.key === sourceKey
      ? sourceState
      : initialSourceState(sourceKey, hasPrimarySource, hasFallbackSource);
  const { source: sourceKind, state } = currentSourceState;
  const renderedSrc = sourceKind === "fallback" ? normalizedFallbackSrc : normalizedSrc;
  const renderedSrcSet = sourceKind === "primary" ? normalizedSrcSet : undefined;
  const hasRenderedSource = Boolean(renderedSrc || renderedSrcSet);
  const baseStyle = style || {};
  const hasNumericRatio =
    typeof width === "number" &&
    Number.isFinite(width) &&
    width > 0 &&
    typeof height === "number" &&
    Number.isFinite(height) &&
    height > 0;
  const inferredAspectRatio = hasNumericRatio ? `${width} / ${height}` : undefined;
  const resolvedStyle: CSSProperties = {
    ...baseStyle,
    width: toCssLength(width) || baseStyle.width,
    height: hasNumericRatio ? undefined : toCssLength(height) || baseStyle.height,
    aspectRatio:
      aspectRatio !== undefined
        ? aspectRatio
        : baseStyle.aspectRatio !== undefined
          ? baseStyle.aspectRatio
          : inferredAspectRatio
  };
  const classes = imageRoot({ radius });
  const fixedHeight = Boolean(
    resolvedStyle.height !== undefined || resolvedStyle.aspectRatio !== undefined
  );
  const elementClasses = imageElement({ fixedHeight });
  const imageClasses =
    imageProps && imageProps.className
      ? `${elementClasses} ${imageProps.className}`
      : elementClasses;
  const nativeImageStyle = imageProps && imageProps.style ? imageProps.style : {};
  const setImageRef = useCallback(
    (node: HTMLImageElement | null) => {
      internalImageRef.current = node;
      const cleanup = assignRef(imageRef, node);
      if (!node) return undefined;
      return () => {
        internalImageRef.current = null;
        if (typeof cleanup === "function") cleanup();
        else assignRef(imageRef, null);
      };
    },
    [imageRef]
  );

  useEffect(() => {
    const image = internalImageRef.current;
    if (!image || !image.complete) return;
    const frame = window.requestAnimationFrame(() => {
      if (image.naturalWidth > 0) {
        setSourceState({ key: sourceKey, source: sourceKind, state: "loaded" });
      } else if (sourceKind === "primary" && hasFallbackSource) {
        setSourceState({ key: sourceKey, source: "fallback", state: "loading" });
      } else {
        setSourceState({ key: sourceKey, source: sourceKind, state: "error" });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [hasFallbackSource, sourceKey, sourceKind]);

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
      data-source={sourceKind}
      data-state={state}
    >
      {state === "error" ? (
        <span className={stateLayer({ overlay: false })}>{stateContent}</span>
      ) : null}
      {hasRenderedSource && state !== "error" ? (
        <>
          {state === "loading" ? (
            <span className={stateLayer({ overlay: true })} aria-hidden="true">
              {stateContent}
            </span>
          ) : null}
          <img
            {...imageProps}
            ref={setImageRef}
            className={imageClasses}
            src={renderedSrc}
            srcSet={renderedSrcSet}
            sizes={sourceKind === "primary" ? sizes : undefined}
            alt={alt}
            aria-hidden={alt ? undefined : true}
            aria-label={undefined}
            aria-labelledby={undefined}
            role={undefined}
            crossOrigin={crossOrigin}
            decoding={decoding}
            draggable={draggable}
            fetchPriority={fetchPriority}
            width={toNativeDimension(intrinsicWidth !== undefined ? intrinsicWidth : width)}
            height={toNativeDimension(intrinsicHeight !== undefined ? intrinsicHeight : height)}
            loading={loading}
            referrerPolicy={referrerPolicy}
            data-pending={state === "loading" ? "true" : undefined}
            style={{ ...nativeImageStyle, objectFit: fit, objectPosition: position }}
            onLoad={(event) => {
              setSourceState({ key: sourceKey, source: sourceKind, state: "loaded" });
              if (onLoad) onLoad(event);
            }}
            onError={(event) => {
              if (sourceKind === "primary" && hasFallbackSource) {
                setSourceState({ key: sourceKey, source: "fallback", state: "loading" });
              } else {
                setSourceState({ key: sourceKey, source: sourceKind, state: "error" });
              }
              if (onError) onError(event);
            }}
          />
        </>
      ) : null}
    </div>
  );
}
