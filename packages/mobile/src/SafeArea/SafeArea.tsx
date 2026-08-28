import { forwardRef } from "react";
import type { CSSProperties } from "react";

import { safeArea } from "./SafeArea.css";
import type { SafeAreaProps } from "./types";

type SafeAreaStyle = CSSProperties & { "--meu-safe-area-fallback"?: string };

function normalizeFallback(fallback: number | string): string {
  if (typeof fallback === "number") {
    return Number.isFinite(fallback) && fallback > 0 ? `${fallback}px` : "0px";
  }
  return fallback;
}

/**
 * Consumes one viewport safe-area inset as a non-interactive layout spacer.
 * It does not position content, react to the virtual keyboard, or deduplicate
 * safe areas already consumed by an ancestor.
 *
 * @public
 */
export const SafeArea = forwardRef<HTMLDivElement, SafeAreaProps>(function SafeArea(
  { "aria-hidden": ariaHidden = true, className, fallback, position = "bottom", style, ...props },
  ref
) {
  const classes = safeArea({ position });
  let resolvedStyle: SafeAreaStyle | undefined = style;
  if (fallback !== undefined) {
    resolvedStyle = {
      "--meu-safe-area-fallback": normalizeFallback(fallback),
      ...style
    };
  }

  return (
    <div
      {...props}
      ref={ref}
      aria-hidden={ariaHidden}
      className={className ? `${classes} ${className}` : classes}
      data-meu-component="safe-area"
      data-position={position}
      style={resolvedStyle}
    />
  );
});
