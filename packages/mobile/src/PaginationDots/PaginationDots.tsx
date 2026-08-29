"use client";

import { useMeuConfig } from "../ConfigProvider";
import { button, dot, ellipsis, root } from "./PaginationDots.css";
import type { PaginationDotsProps } from "./types";

const MAX_SAFE_COUNT = Number.MAX_SAFE_INTEGER;
const MAX_VISIBLE_MARKERS = 99;

/**
 * Renders compact page-position markers with optional page buttons.
 *
 * @public
 */
export function PaginationDots({
  "aria-label": ariaLabel,
  activeIndex,
  className,
  count,
  direction = "horizontal",
  getPageLabel,
  interactive = false,
  maxVisible = 7,
  onChange,
  ref,
  variant = "dot",
  ...props
}: PaginationDotsProps) {
  const { locale } = useMeuConfig();
  const safeCount = Number.isFinite(count)
    ? Math.min(Math.max(0, Math.trunc(count)), MAX_SAFE_COUNT)
    : 0;
  const normalizedIndex = Number.isFinite(activeIndex) ? Math.trunc(activeIndex) : 0;
  const safeIndex = safeCount > 0 ? Math.min(Math.max(normalizedIndex, 0), safeCount - 1) : 0;
  const resolvedLabel =
    ariaLabel ||
    (locale === "en-US"
      ? `Page ${safeCount > 0 ? safeIndex + 1 : 0} of ${safeCount}`
      : `第 ${safeCount > 0 ? safeIndex + 1 : 0} 页，共 ${safeCount} 页`);
  const classes = root({ direction });
  const safeMaxVisible = Number.isFinite(maxVisible)
    ? Math.min(Math.max(5, Math.trunc(maxVisible)), MAX_VISIBLE_MARKERS)
    : 7;

  function visibleItems(): Array<number | string> {
    if (safeCount <= safeMaxVisible) return Array.from({ length: safeCount }, (_, index) => index);
    const edgeValueCount = safeMaxVisible - 2;
    if (safeIndex <= safeMaxVisible - 3) {
      return [...Array.from({ length: edgeValueCount }, (_, index) => index), "end", safeCount - 1];
    }
    if (safeIndex >= safeCount - edgeValueCount) {
      return [
        0,
        "start",
        ...Array.from({ length: edgeValueCount }, (_, index) => safeCount - edgeValueCount + index)
      ];
    }
    const neighborSlots = safeMaxVisible - 5;
    const leftNeighborCount = Math.floor(neighborSlots / 2);
    return [
      0,
      "start",
      ...Array.from(
        { length: neighborSlots + 1 },
        (_, index) => safeIndex - leftNeighborCount + index
      ),
      "end",
      safeCount - 1
    ];
  }

  function pageLabel(index: number) {
    if (getPageLabel) return getPageLabel(index, safeCount);
    return locale === "en-US"
      ? `Go to page ${index + 1} of ${safeCount}`
      : `前往第 ${index + 1} 页，共 ${safeCount} 页`;
  }

  return (
    <div
      {...props}
      ref={ref}
      role={interactive ? "group" : "img"}
      className={className ? `${classes} ${className}` : classes}
      aria-label={resolvedLabel}
      data-meu-component="pagination-dots"
      data-count={safeCount}
      data-index={safeIndex}
      data-variant={variant}
    >
      {visibleItems().map((item) => {
        if (typeof item !== "number") {
          return (
            <span className={ellipsis} aria-hidden="true" key={item}>
              …
            </span>
          );
        }
        const marker = (
          <span
            className={dot({ active: item === safeIndex, direction, variant })}
            aria-hidden="true"
            data-active={item === safeIndex ? "true" : "false"}
          />
        );
        return interactive ? (
          <button
            className={button}
            type="button"
            aria-current={item === safeIndex ? "page" : undefined}
            aria-label={pageLabel(item)}
            onClick={(event) => {
              if (item !== safeIndex && onChange) onChange(item, event);
            }}
            key={item}
          >
            {marker}
          </button>
        ) : (
          <span key={item}>{marker}</span>
        );
      })}
    </div>
  );
}
