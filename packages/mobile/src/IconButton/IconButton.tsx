"use client";

import { forwardRef } from "react";

import { content, iconButton, spinner } from "./IconButton.css";
import type { IconButtonProps } from "./types";

/**
 * Renders an icon-only native button with an enforced accessible name and mobile touch target.
 *
 * @public
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    children,
    className,
    disabled = false,
    loading = false,
    size = "medium",
    tone = "neutral",
    type = "button",
    variant = "ghost",
    ...props
  },
  ref
) {
  const classes = iconButton({ size, tone, variant });
  const pressed = props["aria-pressed"];
  const state = loading
    ? "loading"
    : disabled
      ? "disabled"
      : pressed === true || pressed === "mixed"
        ? "pressed"
        : "default";

  return (
    <button
      {...props}
      ref={ref}
      type={type}
      className={className ? `${classes} ${className}` : classes}
      disabled={disabled || loading}
      aria-busy={loading}
      data-meu-component="icon-button"
      data-size={size}
      data-tone={tone}
      data-state={state}
    >
      {loading ? (
        <span className={spinner} aria-hidden="true" />
      ) : (
        <span className={content} aria-hidden="true">
          {children}
        </span>
      )}
    </button>
  );
});
