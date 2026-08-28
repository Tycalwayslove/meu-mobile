import type { CSSProperties } from "react";

import { block, textGroup } from "./Skeleton.css";
import type { SkeletonProps } from "./types";

type SkeletonStyle = CSSProperties & {
  "--meu-skeleton-aspect-ratio"?: CSSProperties["aspectRatio"];
  "--meu-skeleton-height"?: string;
  "--meu-skeleton-line-width"?: string;
  "--meu-skeleton-width"?: string;
};

function resolveSize(value: CSSProperties["width"], fallback: string) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? `${Math.max(0, value)}px` : fallback;
  }
  return value === undefined ? fallback : value;
}

export function Skeleton({
  animated = false,
  aspectRatio,
  className,
  height,
  lines = 1,
  lineWidths,
  ref,
  style,
  variant = "text",
  width,
  ...props
}: SkeletonProps) {
  const safeLines = Number.isFinite(lines) ? Math.min(20, Math.max(1, Math.trunc(lines))) : 1;
  const circleWidth = resolveSize(width === undefined ? height : width, "44px");
  const circleHeight = resolveSize(height === undefined ? width : height, "44px");
  const resolvedWidth = variant === "circle" ? circleWidth : resolveSize(width, "100%");
  const resolvedHeight =
    variant === "circle" ? circleHeight : resolveSize(height, variant === "text" ? "16px" : "80px");
  const resolvedStyle: SkeletonStyle = {
    ...style,
    "--meu-skeleton-aspect-ratio": aspectRatio,
    "--meu-skeleton-height": resolvedHeight,
    "--meu-skeleton-width": resolvedWidth
  };

  if (variant !== "text") {
    return (
      <div
        {...props}
        ref={ref}
        className={
          className ? `${block({ animated, variant })} ${className}` : block({ animated, variant })
        }
        style={resolvedStyle}
        aria-hidden="true"
        data-meu-component="skeleton"
        data-animated={animated ? "true" : "false"}
        data-variant={variant}
      />
    );
  }

  return (
    <div
      {...props}
      ref={ref}
      className={className ? `${textGroup} ${className}` : textGroup}
      style={resolvedStyle}
      aria-hidden="true"
      data-meu-component="skeleton"
      data-animated={animated ? "true" : "false"}
      data-variant="text"
    >
      {Array.from({ length: safeLines }, (_, index) => {
        const requestedWidth = lineWidths ? lineWidths[index] : undefined;
        const fallbackWidth = safeLines > 1 && index === safeLines - 1 ? "72%" : "100%";
        const lineStyle: SkeletonStyle = {
          "--meu-skeleton-line-width": resolveSize(requestedWidth, fallbackWidth)
        };
        return (
          <span className={block({ animated, variant: "text" })} style={lineStyle} key={index} />
        );
      })}
    </div>
  );
}
