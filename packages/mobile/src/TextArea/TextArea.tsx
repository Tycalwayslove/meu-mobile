"use client";

import { forwardRef, useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent, ForwardedRef } from "react";

import { useFieldContext } from "../Field/FieldContext";
import { counter, root, textarea } from "./TextArea.css";
import type { TextAreaAutoSize, TextAreaProps } from "./types";

function assignRef<T>(ref: ForwardedRef<T>, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

function normalizeValue(value: TextAreaProps["value"]): string {
  if (value === undefined || value === null) return "";
  if (Array.isArray(value)) return value.join(",");
  return String(value);
}

function getRows(autoSize: TextAreaAutoSize, key: "maxRows" | "minRows"): number | undefined {
  if (typeof autoSize !== "object") return undefined;
  const rows = autoSize[key];
  return typeof rows === "number" && rows > 0 ? rows : undefined;
}

function resizeTextArea(element: HTMLTextAreaElement, autoSize: TextAreaAutoSize) {
  if (!autoSize) {
    element.style.height = "";
    element.style.overflowY = "";
    return;
  }

  element.style.height = "auto";
  const computed = window.getComputedStyle(element);
  const lineHeight = Number.parseFloat(computed.lineHeight) || 24;
  const padding =
    (Number.parseFloat(computed.paddingTop) || 0) +
    (Number.parseFloat(computed.paddingBottom) || 0);
  const border =
    (Number.parseFloat(computed.borderTopWidth) || 0) +
    (Number.parseFloat(computed.borderBottomWidth) || 0);
  const minRows = getRows(autoSize, "minRows");
  const maxRows = getRows(autoSize, "maxRows");
  const constrainedMaxRows = maxRows && minRows ? Math.max(maxRows, minRows) : maxRows;
  const naturalHeight = element.scrollHeight + border;
  const minHeight = minRows ? minRows * lineHeight + padding + border : 0;
  const maxHeight = constrainedMaxRows
    ? constrainedMaxRows * lineHeight + padding + border
    : Number.POSITIVE_INFINITY;
  const nextHeight = Math.min(Math.max(naturalHeight, minHeight), maxHeight);

  element.style.height = `${nextHeight}px`;
  element.style.overflowY = naturalHeight > maxHeight ? "auto" : "hidden";
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  {
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    autoSize = false,
    className,
    defaultValue,
    disabled = false,
    id,
    maxLength,
    onChange,
    rows,
    showCount = false,
    size = "medium",
    status = "default",
    value,
    ...props
  },
  forwardedRef
) {
  const fieldContext = useFieldContext();
  const countId = `meu-text-area-count-${useId()}`;
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const [uncontrolledValue, setUncontrolledValue] = useState(() => normalizeValue(defaultValue));
  const controlled = value !== undefined;
  const displayedValue = controlled ? normalizeValue(value) : uncontrolledValue;
  const resolvedId = id || (fieldContext ? fieldContext.controlId : undefined);
  const fieldDescribedBy = fieldContext ? fieldContext.describedBy : undefined;
  const describedBy =
    [ariaDescribedBy || fieldDescribedBy, showCount ? countId : undefined]
      .filter(Boolean)
      .join(" ") || undefined;
  const invalid =
    ariaInvalid === true ||
    ariaInvalid === "true" ||
    status === "error" ||
    Boolean(fieldContext && fieldContext.invalid);
  const classes = textarea({
    autoSize: Boolean(autoSize),
    size,
    status: invalid ? "error" : status
  });
  const minRows = getRows(autoSize, "minRows");

  useEffect(() => {
    const element = textAreaRef.current;
    if (element) resizeTextArea(element, autoSize);
  }, [autoSize, displayedValue]);

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    if (!controlled) setUncontrolledValue(event.target.value);
    resizeTextArea(event.target, autoSize);
    if (onChange) onChange(event);
  }

  return (
    <span className={root}>
      <textarea
        {...props}
        ref={(element) => {
          textAreaRef.current = element;
          assignRef(forwardedRef, element);
        }}
        id={resolvedId}
        className={className ? `${classes} ${className}` : classes}
        defaultValue={controlled ? undefined : defaultValue}
        disabled={disabled}
        maxLength={maxLength}
        onChange={handleChange}
        rows={rows || minRows || 3}
        value={controlled ? value : undefined}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        data-auto-size={autoSize ? "true" : "false"}
        data-meu-component="text-area"
        data-size={size}
        data-state={disabled ? "disabled" : invalid ? "error" : "default"}
      />
      {showCount ? (
        <span id={countId} className={counter} aria-live="polite" data-meu-slot="count">
          {displayedValue.length}
          {typeof maxLength === "number" ? ` / ${maxLength}` : null}
        </span>
      ) : null}
    </span>
  );
});
