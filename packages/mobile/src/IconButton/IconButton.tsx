"use client";

import { forwardRef } from "react";

import { iconButton, spinner } from "./IconButton.css";
import type { IconButtonProps } from "./types";

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
      data-state={loading ? "loading" : disabled ? "disabled" : "default"}
    >
      {loading ? <span className={spinner} aria-hidden="true" /> : children}
    </button>
  );
});
