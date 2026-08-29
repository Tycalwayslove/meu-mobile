"use client";

import { MeuIconX } from "@meu/icons-react";
import { forwardRef, useRef } from "react";
import type { ForwardedRef, InputHTMLAttributes } from "react";

import { useMeuConfig } from "../ConfigProvider";
import { useFieldContext } from "../Field/FieldContext";
import { clearButton, input, wrapper } from "./TextInput.css";

/**
 * Props for a Field-aware native text input with an optional clear action.
 *
 * @public
 */
export type TextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  /** Shows a native button that clears the current value. @defaultValue false */
  clearable?: boolean;
  /** Called after the clear action dispatches the input change. */
  onClear?: () => void;
  /** Controls the input height and horizontal padding. @defaultValue "medium" */
  size?: "small" | "medium" | "large";
  /** Applies validation styling and `aria-invalid="true"`; caller grammar/spelling tokens are otherwise preserved. @defaultValue "default" */
  status?: "default" | "error";
};

function assignRef<T>(ref: ForwardedRef<T>, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

/**
 * Renders a Field-aware native text input with an optional clear action.
 *
 * @public
 */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  {
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    className,
    clearable = false,
    disabled = false,
    id,
    onClear,
    readOnly = false,
    size = "medium",
    status = "default",
    ...props
  },
  forwardedRef
) {
  const config = useMeuConfig();
  const fieldContext = useFieldContext();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const resolvedId = id || (fieldContext ? fieldContext.controlId : undefined);
  const describedBy = ariaDescribedBy || (fieldContext ? fieldContext.describedBy : undefined);
  const callerInvalid =
    ariaInvalid === true ||
    ariaInvalid === "true" ||
    ariaInvalid === "grammar" ||
    ariaInvalid === "spelling";
  const contextualInvalid = status === "error" || Boolean(fieldContext && fieldContext.invalid);
  const invalid = callerInvalid || contextualInvalid;
  const resolvedAriaInvalid = contextualInvalid
    ? true
    : ariaInvalid === "grammar" || ariaInvalid === "spelling"
      ? ariaInvalid
      : callerInvalid
        ? true
        : ariaInvalid === false || ariaInvalid === "false"
          ? ariaInvalid
          : undefined;
  const classes = input({ clearable, size, status: invalid ? "error" : status });
  const clearLabel = config.locale === "en-US" ? "Clear input" : "清除输入";

  function clear() {
    const element = inputRef.current;
    if (element) {
      const valueDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
      if (valueDescriptor && valueDescriptor.set) valueDescriptor.set.call(element, "");
      else element.value = "";
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.focus();
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
        readOnly={readOnly}
        aria-describedby={describedBy}
        aria-invalid={resolvedAriaInvalid}
        data-meu-component="text-input"
        data-size={size}
        data-state={disabled ? "disabled" : readOnly ? "readonly" : invalid ? "error" : "default"}
      />
      {clearable && !disabled && !readOnly ? (
        <button type="button" className={clearButton} aria-label={clearLabel} onClick={clear}>
          <MeuIconX size={18} />
        </button>
      ) : null}
    </span>
  );
});
