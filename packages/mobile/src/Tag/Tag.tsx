"use client";

import type { Ref } from "react";

import { tagChip, tagContent, tagRoot } from "./Tag.css";
import type { TagProps } from "./types";

export function Tag({
  children,
  className,
  disabled = false,
  onClick,
  ref,
  rounded = false,
  size = "medium",
  tone = "neutral",
  variant = "soft",
  ...props
}: TagProps) {
  const interactive = Boolean(onClick);
  const classes = tagRoot({ disabled, interactive });
  const resolvedClasses = className ? `${classes} ${className}` : classes;
  const content = (
    <span className={tagChip({ rounded, size, tone, variant })}>
      <span className={tagContent}>{children}</span>
    </span>
  );

  if (interactive) {
    return (
      <button
        {...props}
        ref={ref as Ref<HTMLButtonElement>}
        type="button"
        className={resolvedClasses}
        disabled={disabled}
        onClick={onClick}
        data-meu-component="tag"
        data-size={size}
        data-state={disabled ? "disabled" : "interactive"}
        data-tone={tone}
        data-variant={variant}
      >
        {content}
      </button>
    );
  }

  return (
    <span
      {...props}
      ref={ref}
      className={resolvedClasses}
      aria-disabled={disabled || undefined}
      data-meu-component="tag"
      data-size={size}
      data-state={disabled ? "disabled" : "static"}
      data-tone={tone}
      data-variant={variant}
    >
      {content}
    </span>
  );
}
