"use client";

import { MeuIconX } from "@meu/icons-react";
import { forwardRef, useEffect, useRef, useState } from "react";
import type { InputHTMLAttributes } from "react";

import { useMeuConfig } from "../ConfigProvider";
import { useFieldContext } from "../Field/FieldContext";
import { assignRef } from "../internal/assignRef";
import { mergeIdReferences } from "../internal/mergeIdReferences";
import { clearButton, input, loadingIndicator, spinner, wrapper } from "./TextInput.css";

type TextInputValue = InputHTMLAttributes<HTMLInputElement>["value"];
type TextInputInputEvent = Parameters<
  NonNullable<InputHTMLAttributes<HTMLInputElement>["onInput"]>
>[0];

function valueHasText(value: TextInputValue) {
  return value !== undefined && String(value).length > 0;
}

function valueToString(value: TextInputValue) {
  return value === undefined ? "" : String(value);
}

/**
 * Props for a Field-aware native text input with an optional clear action.
 *
 * @public
 */
export type TextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  /** Accessible name for the built-in clear button. */
  clearLabel?: string;
  /** Shows a native button while the editable value is non-empty. @defaultValue false */
  clearable?: boolean;
  /** Marks caller-owned asynchronous work without making the native input read-only. */
  loading?: boolean;
  /** Accessible status name announced while `loading` is true. */
  loadingLabel?: string;
  /** Called after the clear action dispatches the input change. */
  onClear?: () => void;
  /** Controls the input height and horizontal padding. @defaultValue "medium" */
  size?: "small" | "medium" | "large";
  /** Applies validation styling and `aria-invalid="true"`; caller grammar/spelling tokens are otherwise preserved. @defaultValue "default" */
  status?: "default" | "error";
};

/**
 * Renders a Field-aware native text input with an optional clear action.
 *
 * @public
 */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  {
    "aria-busy": ariaBusy,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    className,
    clearLabel: clearLabelProp,
    clearable = false,
    defaultValue,
    dir,
    disabled = false,
    form,
    id,
    loading = false,
    loadingLabel: loadingLabelProp,
    onChange,
    onClear,
    onInput,
    readOnly = false,
    required = false,
    size = "medium",
    status = "default",
    value,
    ...props
  },
  forwardedRef
) {
  const config = useMeuConfig();
  const fieldContext = useFieldContext();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const clearFocusedRef = useRef(false);
  const resetTimerRef = useRef<number | null>(null);
  const controlled = value !== undefined;
  const [uncontrolledHasValue, setUncontrolledHasValue] = useState(() =>
    valueHasText(defaultValue)
  );
  const hasValue = controlled ? valueHasText(value) : uncontrolledHasValue;
  const resolvedId = id || (fieldContext ? fieldContext.controlId : undefined);
  const resolvedRequired = required || Boolean(fieldContext && fieldContext.required);
  const describedBy =
    ariaDescribedBy === ""
      ? ""
      : mergeIdReferences(ariaDescribedBy, fieldContext ? fieldContext.describedBy : undefined);
  const hasExplicitAriaLabel = Boolean(ariaLabel && ariaLabel.trim());
  const labelledBy = hasExplicitAriaLabel
    ? undefined
    : mergeIdReferences(ariaLabelledBy, fieldContext ? fieldContext.labelId : undefined);
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
  const hasTrailingAction = loading || (clearable && hasValue && !disabled && !readOnly);
  const classes = input({ clearable: hasTrailingAction, size, status: invalid ? "error" : status });
  const clearLabel =
    clearLabelProp !== undefined
      ? clearLabelProp
      : config.locale === "en-US"
        ? "Clear input"
        : "清除输入";
  const loadingLabel =
    loadingLabelProp !== undefined
      ? loadingLabelProp
      : config.locale === "en-US"
        ? "Loading"
        : "正在加载";

  useEffect(() => {
    const element = inputRef.current;
    const ownerDocument = element ? element.ownerDocument : null;
    if (!element || !ownerDocument) return undefined;
    const timerWindow = ownerDocument.defaultView || window;

    const handleReset = (event: Event) => {
      const currentElement = inputRef.current;
      if (!currentElement || event.target !== currentElement.form) return;
      if (controlled) currentElement.defaultValue = valueToString(value);
      if (resetTimerRef.current !== null) timerWindow.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = timerWindow.setTimeout(() => {
        resetTimerRef.current = null;
        const resetElement = inputRef.current;
        if (!resetElement || event.defaultPrevented) return;
        if (controlled) resetElement.value = valueToString(value);
        else setUncontrolledHasValue(resetElement.value.length > 0);
      }, 0);
    };

    ownerDocument.addEventListener("reset", handleReset);
    return () => {
      ownerDocument.removeEventListener("reset", handleReset);
      if (resetTimerRef.current !== null) timerWindow.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    };
  }, [controlled, defaultValue, form, value]);

  useEffect(() => {
    if (!loading || !clearFocusedRef.current) return;
    clearFocusedRef.current = false;
    const element = inputRef.current;
    if (element && !element.disabled) element.focus();
  }, [loading]);

  function handleInput(event: TextInputInputEvent) {
    if (!controlled) setUncontrolledHasValue(event.currentTarget.value.length > 0);
    if (onInput) onInput(event);
  }

  function clear() {
    if (disabled || readOnly || loading) return;
    const element = inputRef.current;
    if (element) {
      const ownerWindow = element.ownerDocument.defaultView;
      const ownerGlobal = ownerWindow;
      const inputPrototype = ownerGlobal ? ownerGlobal.HTMLInputElement.prototype : undefined;
      const valueDescriptor = inputPrototype
        ? Object.getOwnPropertyDescriptor(inputPrototype, "value")
        : undefined;
      if (valueDescriptor && valueDescriptor.set) valueDescriptor.set.call(element, "");
      else element.value = "";
      const inputEvent = ownerGlobal
        ? new ownerGlobal.Event("input", { bubbles: true })
        : element.ownerDocument.createEvent("Event");
      if (!ownerGlobal) inputEvent.initEvent("input", true, false);
      element.dispatchEvent(inputEvent);
      element.focus();
    }
    if (onClear) {
      onClear();
    }
  }

  return (
    <span className={wrapper} dir={dir}>
      <input
        {...props}
        ref={(element) => {
          inputRef.current = element;
          assignRef(forwardedRef, element);
        }}
        id={resolvedId}
        className={className ? `${classes} ${className}` : classes}
        defaultValue={controlled ? undefined : defaultValue}
        dir={dir}
        disabled={disabled}
        form={form}
        readOnly={readOnly}
        required={resolvedRequired}
        value={value}
        onChange={onChange}
        onInput={handleInput}
        aria-busy={loading ? true : ariaBusy}
        aria-describedby={describedBy}
        aria-invalid={resolvedAriaInvalid}
        aria-label={ariaLabel}
        aria-labelledby={labelledBy}
        data-meu-component="text-input"
        data-size={size}
        data-state={
          disabled
            ? "disabled"
            : loading
              ? "loading"
              : readOnly
                ? "readonly"
                : invalid
                  ? "error"
                  : "default"
        }
      />
      {loading ? (
        <span
          className={loadingIndicator}
          role="status"
          aria-atomic="true"
          aria-live="polite"
          aria-label={loadingLabel}
        >
          <span className={spinner} aria-hidden="true" />
        </span>
      ) : clearable && hasValue && !disabled && !readOnly ? (
        <button
          type="button"
          className={clearButton}
          aria-label={clearLabel}
          onBlur={() => {
            clearFocusedRef.current = false;
          }}
          onClick={clear}
          onFocus={() => {
            clearFocusedRef.current = true;
          }}
          onMouseDown={(event) => event.preventDefault()}
        >
          <MeuIconX size={18} />
        </button>
      ) : null}
    </span>
  );
});
