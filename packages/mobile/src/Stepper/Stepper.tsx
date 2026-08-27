"use client";

import { forwardRef, useState } from "react";
import type { FocusEvent, KeyboardEvent } from "react";

import { useMeuConfig } from "../ConfigProvider";
import { useFieldContext } from "../Field/FieldContext";
import { normalizeSteppedNumber } from "../internal/numbers";
import { button, input, root } from "./Stepper.css";
import type { StepperProps } from "./types";

function valuesEqual(first: number | null, second: number | null) {
  return first === second || (Number.isNaN(first) && Number.isNaN(second));
}

export const Stepper = forwardRef<HTMLInputElement, StepperProps>(function Stepper(
  {
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    allowEmpty = false,
    className,
    decrementAriaLabel,
    defaultValue = 0,
    disabled = false,
    id,
    incrementAriaLabel,
    max,
    min,
    onBlur,
    onChange,
    onFocus,
    onKeyDown,
    precision,
    readOnly = false,
    size = "medium",
    status = "default",
    step = 1,
    style,
    value,
    ...props
  },
  ref
) {
  const { locale } = useMeuConfig();
  const fieldContext = useFieldContext();
  const controlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<number | null>(defaultValue);
  const currentValue = controlled ? value : uncontrolledValue;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(currentValue === null ? "" : String(currentValue));
  const safeStep = Number.isFinite(step) && step > 0 ? step : 1;
  const resolvedId = id || (fieldContext ? fieldContext.controlId : undefined);
  const describedBy = ariaDescribedBy || (fieldContext ? fieldContext.describedBy : undefined);
  const invalid =
    ariaInvalid === true ||
    ariaInvalid === "true" ||
    status === "error" ||
    Boolean(fieldContext && fieldContext.invalid);
  const inert = disabled || readOnly;
  const atMin = currentValue !== null && min !== undefined && currentValue <= min;
  const atMax = currentValue !== null && max !== undefined && currentValue >= max;

  function normalize(nextValue: number) {
    return normalizeSteppedNumber({ max, min, precision, step: safeStep, value: nextValue });
  }

  function publish(nextValue: number | null) {
    if (!controlled) setUncontrolledValue(nextValue);
    if (!valuesEqual(currentValue, nextValue) && onChange) onChange(nextValue);
  }

  function commitDraft() {
    const text = draft.trim();
    if (!text) {
      if (allowEmpty) publish(null);
      setEditing(false);
      return;
    }
    const parsed = Number(text);
    if (Number.isFinite(parsed)) publish(normalize(parsed));
    setEditing(false);
  }

  function offset(direction: -1 | 1) {
    if (inert) return;
    const draftValue = editing && Number.isFinite(Number(draft)) ? Number(draft) : currentValue;
    const base =
      draftValue !== null ? draftValue : min !== undefined && Number.isFinite(min) ? min : 0;
    const nextValue = normalize(base + safeStep * direction);
    setEditing(false);
    setDraft(String(nextValue));
    publish(nextValue);
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    commitDraft();
    if (onBlur) onBlur(event);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      offset(1);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      offset(-1);
    } else if (event.key === "Enter") {
      event.currentTarget.blur();
    }
    if (onKeyDown) onKeyDown(event);
  }

  return (
    <div
      className={
        className
          ? `${root({ disabled: inert, size, status: invalid ? "error" : status })} ${className}`
          : root({ disabled: inert, size, status: invalid ? "error" : status })
      }
      style={style}
      data-meu-component="stepper"
      data-size={size}
      data-state={disabled ? "disabled" : readOnly ? "readonly" : invalid ? "error" : "default"}
    >
      <button
        className={button}
        type="button"
        disabled={inert || atMin}
        aria-label={decrementAriaLabel || (locale === "zh-CN" ? "减少" : "Decrease")}
        onClick={() => offset(-1)}
      >
        <span aria-hidden="true">−</span>
      </button>
      <input
        {...props}
        ref={ref}
        id={resolvedId}
        className={input}
        type="text"
        role="spinbutton"
        inputMode="decimal"
        value={editing ? draft : currentValue === null ? "" : String(currentValue)}
        disabled={disabled}
        readOnly={readOnly}
        onChange={(event) => setDraft(event.target.value)}
        onFocus={(event) => {
          setDraft(currentValue === null ? "" : String(currentValue));
          setEditing(true);
          event.currentTarget.select();
          if (onFocus) onFocus(event);
        }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        aria-valuenow={currentValue === null ? undefined : currentValue}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
      />
      <button
        className={button}
        type="button"
        disabled={inert || atMax}
        aria-label={incrementAriaLabel || (locale === "zh-CN" ? "增加" : "Increase")}
        onClick={() => offset(1)}
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  );
});
