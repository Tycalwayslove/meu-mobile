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
  const numericZero = content === 0;
  const visible = dot || Boolean(content) || (numericZero && showZero);
  const resolvedContent = resolveContent(content, max);
  const markerStyle: BadgeStyle | undefined = offset
    ? {
        "--meu-badge-offset-x": `${offset[0]}px`,
        "--meu-badge-offset-y": `${offset[1]}px`
      }
    : undefined;
  const marker = visible ? (
    <span
      className={badge({ bordered, dot, fixed: Boolean(children), tone })}
      style={markerStyle}
      aria-label={label}
      aria-hidden={dot && !label ? true : undefined}
      data-meu-badge-marker
      data-tone={tone}
    >
      {dot ? null : <span className={badgeContent}>{resolvedContent}</span>}
    </span>
  ) : null;

  if (!children) {
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
