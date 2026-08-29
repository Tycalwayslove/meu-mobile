"use client";

import { forwardRef } from "react";

import { button, buttonItem, spinner } from "./Button.css";
import type { ButtonProps } from "./types";

/**
 * Renders a native button with Meu sizing, tone, loading, and icon treatments.
 *
 * @public
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    block = false,
    children,
    className,
    disabled = false,
    leadingIcon,
    loading = false,
    size = "medium",
    tone = "accent",
    trailingIcon,
    type = "button",
    variant = "solid",
    ...props
  },
  ref
) {
  const classes = button({ block, size, tone, variant });

  return (
    <button
      {...props}
      ref={ref}
      type={type}
      className={className ? `${classes} ${className}` : classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-meu-component="button"
      data-size={size}
      data-tone={tone}
      data-state={loading ? "loading" : disabled ? "disabled" : "default"}
    >
      {loading ? (
        <span className={`${buttonItem} ${spinner}`} aria-hidden="true" />
      ) : leadingIcon ? (
        <span className={buttonItem} aria-hidden="true">
          {leadingIcon}
        </span>
      ) : null}
      <span className={buttonItem}>{children}</span>
      {loading || !trailingIcon ? null : (
        <span className={buttonItem} aria-hidden="true">
          {trailingIcon}
        </span>
      )}
    </button>
  );
});
