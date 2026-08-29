"use client";

import type { Ref } from "react";

import { useMeuConfig } from "../ConfigProvider";
import { tagChip, tagClose, tagContent, tagGroup, tagRoot } from "./Tag.css";
import type { TagProps } from "./types";

/**
 * Renders a compact label, filter, or closable chip.
 *
 * @public
 */
export function Tag({
  "aria-label": ariaLabel,
  children,
  className,
  closeAriaLabel,
  disabled = false,
  onClick,
  onClose,
  ref,
  rounded = false,
  selected,
  size = "medium",
  tone = "neutral",
  variant = "soft",
  ...props
}: TagProps) {
  const { locale } = useMeuConfig();
  const interactive = Boolean(onClick);
  const isSelected = interactive && selected === true;
  const classes = tagRoot({ disabled, interactive });
  const content = (
    <span className={tagChip({ disabled, rounded, selected: isSelected, size, tone, variant })}>
      <span className={tagContent}>{children}</span>
    </span>
  );

  const state = disabled
    ? "disabled"
    : onClose
      ? interactive
        ? "filter-closable"
        : "closable"
      : interactive
        ? isSelected
          ? "selected"
          : "filter"
        : "static";

  const primary = interactive ? (
    <button
      type="button"
      className={classes}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={interactive ? selected : undefined}
      onClick={onClick}
      data-meu-tag-primary
      data-size={size}
      data-state={state}
      data-selected={isSelected || undefined}
      data-tone={tone}
      data-variant={variant}
    >
      {content}
    </button>
  ) : (
    <span
      className={classes}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      data-meu-tag-primary
      data-size={size}
      data-state={state}
      data-selected={undefined}
      data-tone={tone}
      data-variant={variant}
    >
      {content}
    </span>
  );

  if (onClose) {
    const childLabel =
      typeof children === "string" || typeof children === "number" ? String(children).trim() : "";
    const resolvedCloseLabel =
      closeAriaLabel ||
      (locale === "zh-CN"
        ? childLabel
          ? `移除标签：${childLabel}`
          : "移除标签"
        : childLabel
          ? `Remove tag: ${childLabel}`
          : "Remove tag");
    return (
      <span
        {...props}
        ref={ref}
        className={className ? `${tagGroup} ${className}` : tagGroup}
        data-meu-component="tag"
        data-meu-tag-group
        data-size={size}
        data-state={state}
        data-selected={isSelected || undefined}
        data-tone={tone}
        data-variant={variant}
      >
        {primary}
        <button
          type="button"
          className={tagClose}
          disabled={disabled}
          aria-label={resolvedCloseLabel}
          onClick={onClose}
          data-meu-tag-close
        >
          <span aria-hidden="true">×</span>
        </button>
      </span>
    );
  }

  if (interactive) {
    return (
      <button
        {...props}
        ref={ref as Ref<HTMLButtonElement>}
        type="button"
        className={className ? `${classes} ${className}` : classes}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-pressed={selected}
        onClick={onClick}
        data-meu-component="tag"
        data-size={size}
        data-state={state}
        data-selected={isSelected || undefined}
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
      className={className ? `${classes} ${className}` : classes}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      data-meu-component="tag"
      data-size={size}
      data-state={state}
      data-selected={undefined}
      data-tone={tone}
      data-variant={variant}
    >
      {content}
    </span>
  );
}
