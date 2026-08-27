"use client";

import { useMeuConfig } from "../ConfigProvider";
import { dot, root } from "./PaginationDots.css";
import type { PaginationDotsProps } from "./types";

export function PaginationDots({
  "aria-label": ariaLabel,
  activeIndex,
  className,
  count,
  direction = "horizontal",
  ref,
  variant = "dot",
  ...props
}: PaginationDotsProps) {
  const { locale } = useMeuConfig();
  const safeCount = Number.isFinite(count) ? Math.max(0, Math.trunc(count)) : 0;
  const safeIndex =
    safeCount > 0 ? Math.min(Math.max(Math.trunc(activeIndex), 0), safeCount - 1) : 0;
  const resolvedLabel =
    ariaLabel ||
    (locale === "en-US"
      ? `Page ${safeCount > 0 ? safeIndex + 1 : 0} of ${safeCount}`
      : `第 ${safeCount > 0 ? safeIndex + 1 : 0} 页，共 ${safeCount} 页`);
  const classes = root({ direction });

  return (
    <div
      {...props}
      ref={ref}
      role="img"
      className={className ? `${classes} ${className}` : classes}
      aria-label={resolvedLabel}
      data-meu-component="pagination-dots"
      data-count={safeCount}
      data-index={safeIndex}
      data-variant={variant}
    >
      {Array.from({ length: safeCount }, (_, index) => (
        <span
          className={dot({ active: index === safeIndex, direction, variant })}
          aria-hidden="true"
          data-active={index === safeIndex ? "true" : "false"}
          key={index}
        />
      ))}
    </div>
  );
}
