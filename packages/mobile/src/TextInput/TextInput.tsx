"use client";

import { MeuIconX } from "@meu/icons-react";
import { forwardRef, useRef } from "react";
import type { ForwardedRef, InputHTMLAttributes } from "react";

import { useFieldContext } from "../Field/FieldContext";
import { clearButton, input, wrapper } from "./TextInput.css";

export type TextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  clearable?: boolean;
  onClear?: () => void;
  size?: "small" | "medium" | "large";
  status?: "default" | "error";
};

function assignRef<T>(ref: ForwardedRef<T>, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  {
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    className,
    clearable = false,
    disabled = false,
    id,
    onClear,
    size = "medium",
    status = "default",
    ...props
  },
  forwardedRef
) {
  const fieldContext = useFieldContext();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const resolvedId = id || (fieldContext ? fieldContext.controlId : undefined);
  const describedBy = ariaDescribedBy || (fieldContext ? fieldContext.describedBy : undefined);
  const invalid = Boolean(ariaInvalid) || status === "error" || Boolean(fieldContext && fieldContext.invalid);
  const classes = input({ clearable, size, status: invalid ? "error" : status });

  function clear() {
    const element = inputRef.current;
    if (element) {
      element.value = "";
      element.focus();
      element.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (onClear) {
      onClear();
    }
  }

  return (
    <span className={wrapper}>
      <input
        {...props}
        ref={(element) => {
          inputRef.current = element;
          assignRef(forwardedRef, element);
        }}
        id={resolvedId}
        className={className ? `${classes} ${className}` : classes}
        disabled={disabled}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        data-meu-component="text-input"
        data-size={size}
        data-state={disabled ? "disabled" : invalid ? "error" : "default"}
      />
      {clearable && !disabled ? (
        <button type="button" className={clearButton} aria-label="清除输入" onClick={clear}>
          <MeuIconX size={18} />
        </button>
      ) : null}
    </span>
  );
});
