"use client";

import { forwardRef } from "react";

import { button, buttonContent, buttonItem, spinner } from "./Button.css";
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
      <span
        className={buttonContent({ loading })}
        data-meu-slot="content"
        data-loading={loading || undefined}
      >
        {leadingIcon ? (
          <span className={buttonItem} aria-hidden="true">
            {leadingIcon}
          </span>
        ) : null}
        <span className={buttonItem}>{children}</span>
        {trailingIcon ? (
          <span className={buttonItem} aria-hidden="true">
            {trailingIcon}
          </span>
        ) : null}
      </span>
      {loading ? <span className={spinner} data-meu-slot="spinner" aria-hidden="true" /> : null}
    </button>
  );
});
