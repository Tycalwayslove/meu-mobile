"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";

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

  const setRootRef = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  useSafeLayoutEffect(() => {
    const container = rootRef.current;
    const watermark = overlayRef.current;
    if (!tamperProtection || !container || !watermark || typeof MutationObserver === "undefined") {
      return;
    }
    const observe = (observer: MutationObserver) => {
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
      for (const record of records) {
        if (record.target === container) {
          if (Array.from(record.removedNodes).includes(watermark)) {
            container.appendChild(watermark);
            tampered = true;
          }
          continue;
        }
        if (record.type === "attributes" && record.attributeName) {
          const target = record.target as Element;
          if (record.oldValue === null) target.removeAttribute(record.attributeName);
          else target.setAttribute(record.attributeName, record.oldValue);
          tampered = true;
        }
        if (record.type === "characterData" && record.oldValue !== null) {
          record.target.nodeValue = record.oldValue;
          tampered = true;
        }
        if (record.type === "childList") {
          for (const added of Array.from(record.addedNodes)) {
            if (added.parentNode) added.parentNode.removeChild(added);
          }
          for (const removed of Array.from(record.removedNodes)) {
            if (record.target instanceof Node) {
              record.target.insertBefore(removed, record.nextSibling);
            }
          }
          tampered = true;
        }
      }
      if (tampered && onRemove) onRemove();
      observe(observer);
    });
    observe(observer);
    return () => observer.disconnect();
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

  const renderMark = (x: number, y: number, key: string) => (
    <g key={key} transform={`translate(${x} ${y}) rotate(${pattern.rotate})`}>
      {showImage ? (
        <image
          href={image}
          x={-pattern.markWidth / 2}
          y={-pattern.markHeight / 2}
          width={pattern.markWidth}
          height={pattern.markHeight}
          preserveAspectRatio="xMidYMid meet"
          {...(crossOrigin ? { crossOrigin } : {})}
          onError={(event) => {
            if (image) setImageFailedFor(image);
            if (onImageError) onImageError(event);
          }}
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
