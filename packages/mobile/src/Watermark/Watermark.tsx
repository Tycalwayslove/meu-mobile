"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ReactEventHandler } from "react";

import { overlay, root } from "./Watermark.css";
import { clampWatermarkOpacity, createWatermarkPattern } from "./pattern";
import type { WatermarkProps } from "./types";

const useSafeLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function classNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

/**
 * Renders a repeated text or image watermark over protected content.
 *
 * @public
 */
export function Watermark({
  children,
  className,
  content,
  crossOrigin,
  font,
  gap,
  height,
  image,
  offset,
  onImageError,
  onImageLoad,
  onRemove,
  opacity,
  ref,
  rotate,
  style,
  tamperProtection = true,
  width,
  zIndex = 9,
  ...props
}: WatermarkProps) {
  const generatedId = useId();
  const patternId = `meu-watermark-${generatedId.replace(/:/g, "")}`;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<SVGSVGElement | null>(null);
  const [imageFailedFor, setImageFailedFor] = useState<string | null>(null);
  const imageAttemptRef = useRef<{
    source: string | undefined;
    status: "idle" | "loaded" | "failed";
  }>({ source: image, status: "idle" });
  const pattern = useMemo(
    () => createWatermarkPattern({ content, font, gap, height, offset, rotate, width }),
    [content, font, gap, height, offset, rotate, width]
  );
  const showImage = Boolean(image) && imageFailedFor !== image;
  const showText = !showImage && pattern.lines.some((line) => line.length > 0);
  const resolvedOpacity = clampWatermarkOpacity(opacity);
  const resolvedZIndex = Number.isFinite(zIndex) ? zIndex : 9;
  const rowY = pattern.rotatedHeight / 2;
  const secondRowY = rowY + pattern.rotatedHeight + pattern.gapY;
  const firstX = pattern.tileWidth / 2;
  const secondX = firstX + pattern.tileWidth / 2;

  const setRootRef = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") {
        const cleanup = ref(node);
        if (!node) return;
        return () => {
          if (rootRef.current === node) rootRef.current = null;
          if (typeof cleanup === "function") cleanup();
          else ref(null);
        };
      }
      if (ref) ref.current = node;
      if (!node) return;
      return () => {
        if (rootRef.current === node) rootRef.current = null;
        if (ref && ref.current === node) ref.current = null;
      };
    },
    [ref]
  );

  useEffect(() => {
    imageAttemptRef.current = { source: image, status: "idle" };
    setImageFailedFor(null);
  }, [image]);

  useSafeLayoutEffect(() => {
    const container = rootRef.current;
    const watermark = overlayRef.current;
    if (!tamperProtection || !container || !watermark || typeof MutationObserver === "undefined") {
      return;
    }
    let active = true;
    const observe = (observer: MutationObserver) => {
      if (!active) return;
      observer.observe(container, { childList: true });
      observer.observe(watermark, {
        attributeOldValue: true,
        attributes: true,
        characterData: true,
        characterDataOldValue: true,
        childList: true,
        subtree: true
      });
    };
    const observer = new MutationObserver((records) => {
      observer.disconnect();
      let tampered = false;
      const addedOverlayNodes = new Set<Node>();
      for (const record of records) {
        if (record.target !== container && record.type === "childList") {
          for (const added of Array.from(record.addedNodes)) addedOverlayNodes.add(added);
        }
      }
      const transientNodes = Array.from(addedOverlayNodes).filter(
        (node) => node !== watermark && !watermark.contains(node)
      );
      const isTransient = (node: Node) =>
        transientNodes.some((transient) => transient === node || transient.contains(node));
      try {
        for (const record of Array.from(records).reverse()) {
          if (record.target === container) {
            if (Array.from(record.removedNodes).includes(watermark)) {
              container.appendChild(watermark);
              tampered = true;
            }
            continue;
          }
          if (record.type === "attributes" && record.attributeName) {
            const target = record.target as Element;
            if (isTransient(target)) continue;
            if (record.oldValue === null) target.removeAttribute(record.attributeName);
            else target.setAttribute(record.attributeName, record.oldValue);
            tampered = true;
          }
          if (record.type === "characterData" && record.oldValue !== null) {
            if (isTransient(record.target)) continue;
            record.target.nodeValue = record.oldValue;
            tampered = true;
          }
          if (record.type === "childList") {
            if (isTransient(record.target)) continue;
            for (const added of Array.from(record.addedNodes)) {
              if (added.parentNode === record.target) record.target.removeChild(added);
            }
            const reference =
              record.nextSibling && record.nextSibling.parentNode === record.target
                ? record.nextSibling
                : null;
            for (const removed of Array.from(record.removedNodes)) {
              if (isTransient(removed)) continue;
              record.target.insertBefore(removed, reference);
            }
            tampered = true;
          }
        }
      } finally {
        if (
          active &&
          rootRef.current === container &&
          overlayRef.current === watermark &&
          watermark.parentNode === container
        ) {
          observe(observer);
        }
      }
      if (tampered && onRemove) onRemove();
    });
    observe(observer);
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [
    content,
    crossOrigin,
    font,
    gap,
    height,
    image,
    imageFailedFor,
    offset,
    onRemove,
    opacity,
    rotate,
    tamperProtection,
    width,
    zIndex
  ]);

  const handleImageLoad: ReactEventHandler<SVGImageElement> = (event) => {
    if (!image) return;
    const attempt = imageAttemptRef.current;
    if (attempt.source !== image) {
      imageAttemptRef.current = { source: image, status: "idle" };
    } else if (attempt.status !== "idle") {
      return;
    }
    imageAttemptRef.current.status = "loaded";
    if (onImageLoad) onImageLoad(event);
  };

  const handleImageError: ReactEventHandler<SVGImageElement> = (event) => {
    if (!image) return;
    const attempt = imageAttemptRef.current;
    if (attempt.source !== image) {
      imageAttemptRef.current = { source: image, status: "idle" };
    } else if (attempt.status !== "idle") {
      return;
    }
    imageAttemptRef.current.status = "failed";
    setImageFailedFor(image);
    if (onImageError) onImageError(event);
  };

  const renderMark = (x: number, y: number, key: string) => (
    <g key={key} transform={`translate(${x} ${y}) rotate(${pattern.rotate})`}>
      {showImage ? (
        <image
          href={image}
          xlinkHref={image}
          x={-pattern.markWidth / 2}
          y={-pattern.markHeight / 2}
          width={pattern.markWidth}
          height={pattern.markHeight}
          preserveAspectRatio="xMidYMid meet"
          {...(crossOrigin ? { crossOrigin } : {})}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      ) : showText ? (
        pattern.lines.map((line, index) => {
          const lineOffset =
            (index - (pattern.lines.length - 1) / 2) * pattern.lineHeight +
            pattern.font.fontSize * 0.34;
          return (
            <text
              key={`${key}-${index}`}
              x={0}
              y={lineOffset}
              fill={pattern.font.color}
              fontFamily={pattern.font.fontFamily}
              fontSize={pattern.font.fontSize}
              fontStyle={pattern.font.fontStyle}
              fontWeight={pattern.font.fontWeight}
              textAnchor="middle"
            >
              {line}
            </text>
          );
        })
      ) : null}
    </g>
  );

  return (
    <div
      {...props}
      ref={setRootRef}
      className={classNames(root, className)}
      style={style}
      data-meu-component="watermark"
    >
      {children}
      <svg
        ref={overlayRef}
        aria-hidden="true"
        className={overlay}
        focusable="false"
        style={{ opacity: resolvedOpacity, zIndex: resolvedZIndex }}
        data-meu-watermark-overlay=""
      >
        <defs>
          <pattern
            id={patternId}
            x={pattern.offsetX}
            y={pattern.offsetY}
            width={pattern.tileWidth}
            height={pattern.tileHeight}
            patternUnits="userSpaceOnUse"
          >
            {renderMark(firstX, rowY, "first")}
            {renderMark(secondX, secondRowY, "second")}
            {renderMark(secondX - pattern.tileWidth, secondRowY, "second-wrap")}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}
