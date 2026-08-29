import { Children } from "react";
import type { CSSProperties, ReactNode } from "react";

import { badge, badgeContent, badgeWrapper } from "./Badge.css";
import type { BadgeProps } from "./types";

type BadgeStyle = CSSProperties & {
  "--meu-badge-offset-x"?: string;
  "--meu-badge-offset-y"?: string;
};

function resolveContent(content: ReactNode, max: number | undefined) {
  if (typeof content !== "number" || max === undefined || !Number.isFinite(max)) return content;
  const safeMax = Math.max(0, Math.trunc(max));
  return content > safeMax ? `${safeMax}+` : content;
}

function normalizeNumericContent(content: ReactNode): ReactNode {
  if (typeof content !== "number") return content;
  return Number.isFinite(content) ? Math.max(0, Math.trunc(content)) : 0;
}

function finiteOffset(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

function hasRenderableContent(value: ReactNode): boolean {
  return value !== "" && Children.toArray(value).length > 0;
}

/**
 * Renders compact semantic status or count content.
 *
 * @public
 */
export function Badge({
  bordered = false,
  children,
  className,
  content,
  dot = false,
  label,
  max,
  offset,
  ref,
  showZero = false,
  style,
  tone = "danger",
  ...props
}: BadgeProps) {
  const normalizedContent = normalizeNumericContent(content);
  const numericZero = normalizedContent === 0;
  const visible = dot || (numericZero ? showZero : hasRenderableContent(normalizedContent));
  const resolvedContent = resolveContent(normalizedContent, max);
  const hasAnchor = hasRenderableContent(children);
  const markerStyle: BadgeStyle | undefined = offset
    ? {
        "--meu-badge-offset-x": `${finiteOffset(offset[0])}px`,
        "--meu-badge-offset-y": `${finiteOffset(offset[1])}px`
      }
    : undefined;
  const marker = visible ? (
    <span
      className={badge({ bordered, dot, fixed: hasAnchor, tone })}
      style={markerStyle}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={dot && !label ? true : undefined}
      data-meu-badge-marker
      data-tone={tone}
    >
      {dot ? null : <span className={badgeContent}>{resolvedContent}</span>}
    </span>
  ) : null;

  if (!hasAnchor) {
    if (!marker) return null;
    return (
      <span
        {...props}
        ref={ref}
        className={className}
        style={style}
        data-meu-component="badge"
        data-state={dot ? "dot" : "standalone"}
      >
        {marker}
      </span>
    );
  }

  return (
    <span
      {...props}
      ref={ref}
      className={className ? `${badgeWrapper} ${className}` : badgeWrapper}
      style={style}
      data-meu-component="badge"
      data-state={dot ? "dot" : visible ? "content" : "empty"}
    >
      {children}
      {marker}
    </span>
  );
}
