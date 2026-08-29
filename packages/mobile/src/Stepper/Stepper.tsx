"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import type { FocusEvent, ForwardedRef, KeyboardEvent, PointerEvent } from "react";

import { useMeuConfig } from "../ConfigProvider";
import { useFieldContext } from "../Field/FieldContext";
import { normalizeSteppedNumber } from "../internal/numbers";
import { button, input, root } from "./Stepper.css";
import type { StepperProps } from "./types";

function valuesEqual(first: number | null, second: number | null) {
  return first === second || (Number.isNaN(first) && Number.isNaN(second));
}

function assignRef(ref: ForwardedRef<HTMLInputElement>, node: HTMLInputElement | null) {
  if (typeof ref === "function") ref(node);
  else if (ref) ref.current = node;
}

/**
 * Renders a numeric text field with accessible decrement and increment controls.
 *
 * @public
 */
export const Stepper = forwardRef<HTMLInputElement, StepperProps>(function Stepper(
  {
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    allowEmpty = false,
    className,
    decrementAriaLabel,
    defaultValue = 0,
    disabled = false,
    dir,
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
    required: requiredProp = false,
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
  const finiteMin = min !== undefined && Number.isFinite(min) ? min : undefined;
  const finiteMax = max !== undefined && Number.isFinite(max) ? max : undefined;
  const lower =
    finiteMin !== undefined && finiteMax !== undefined ? Math.min(finiteMin, finiteMax) : finiteMin;
  const upper =
    finiteMin !== undefined && finiteMax !== undefined ? Math.max(finiteMin, finiteMax) : finiteMax;
  const safeStep = Number.isFinite(step) && step > 0 ? step : 1;
  const normalize = (nextValue: number) =>
    normalizeSteppedNumber({ max: upper, min: lower, precision, step: safeStep, value: nextValue });
  const normalizeNullable = (nextValue: number | null) =>
    nextValue === null ? null : normalize(nextValue);
  const normalizedDefaultValue = normalizeNullable(defaultValue);
  const controlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<number | null>(normalizedDefaultValue);
  const currentValue = normalizeNullable(controlled ? value : uncontrolledValue);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(currentValue === null ? "" : String(currentValue));
  const inputRef = useRef<HTMLInputElement | null>(null);
  const defaultValueRef = useRef(normalizedDefaultValue);
  const stepButtonPointerRef = useRef(false);
  const resolvedId = id || (fieldContext ? fieldContext.controlId : undefined);
  const describedBy = ariaDescribedBy || (fieldContext ? fieldContext.describedBy : undefined);
  const invalid =
    ariaInvalid === true ||
    ariaInvalid === "true" ||
    status === "error" ||
    Boolean(fieldContext && fieldContext.invalid);
  const inert = disabled || readOnly;
  const required = requiredProp || Boolean(fieldContext && fieldContext.required);
  const effectiveLower = lower === undefined ? undefined : normalize(lower);
  const effectiveUpper = upper === undefined ? undefined : normalize(upper);
  const atMin =
    currentValue !== null && effectiveLower !== undefined && currentValue <= effectiveLower;
  const atMax =
    currentValue !== null && effectiveUpper !== undefined && currentValue >= effectiveUpper;

  const trimmedDraft = draft.trim();
  const parsedDraft = trimmedDraft ? parseDraft(trimmedDraft) : Number.NaN;
  const draftAriaValue = editing && Number.isFinite(parsedDraft) ? parsedDraft : undefined;

  useEffect(() => {
    defaultValueRef.current = normalizedDefaultValue;
  }, [normalizedDefaultValue]);

  useEffect(() => {
    if (controlled) return;
    const form = inputRef.current ? inputRef.current.form : null;
    if (!form) return;

    function handleReset(event: Event) {
      if (inputRef.current) {
        inputRef.current.defaultValue =
          defaultValueRef.current === null ? "" : String(defaultValueRef.current);
      }
      void Promise.resolve().then(() => {
        if (event.defaultPrevented) return;
        const resetValue = defaultValueRef.current;
        setUncontrolledValue(resetValue);
        setDraft(resetValue === null ? "" : String(resetValue));
        setEditing(false);
        stepButtonPointerRef.current = false;
      });
    }

    form.addEventListener("reset", handleReset);
    return () => form.removeEventListener("reset", handleReset);
  }, [controlled, props.form]);

  function publish(nextValue: number | null) {
    const normalizedValue = normalizeNullable(nextValue);
    if (!controlled) setUncontrolledValue(normalizedValue);
    if (!valuesEqual(currentValue, normalizedValue) && onChange) onChange(normalizedValue);
  }

  function parseDraft(text: string) {
    return Number(text.includes(".") ? text : text.replace(",", "."));
  }

  function commitDraft() {
    const text = draft.trim();
    if (!text) {
      if (allowEmpty) publish(null);
      setEditing(false);
      return;
    }
    const parsed = parseDraft(text);
    if (Number.isFinite(parsed)) publish(normalize(parsed));
    setEditing(false);
  }

  function offset(direction: -1 | 1) {
    if (inert) return;
    const parsedDraft = parseDraft(draft);
    const draftValue = editing && Number.isFinite(parsedDraft) ? parsedDraft : currentValue;
    const base = draftValue !== null ? draftValue : lower !== undefined ? lower : 0;
    const nextValue = normalize(base + safeStep * direction);
    setEditing(false);
    setDraft(String(nextValue));
    publish(nextValue);
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    if (!stepButtonPointerRef.current) commitDraft();
    if (onBlur) onBlur(event);
  }

  function handleStepButtonPointerDown() {
    stepButtonPointerRef.current = true;
  }

  function handleStepButtonPointerCancel(event: PointerEvent<HTMLButtonElement>) {
    if (!stepButtonPointerRef.current) return;
    stepButtonPointerRef.current = false;
    if (event.currentTarget.ownerDocument.activeElement !== inputRef.current) commitDraft();
  }

  function handleStepButtonClick(direction: -1 | 1) {
    stepButtonPointerRef.current = false;
    offset(direction);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (onKeyDown) onKeyDown(event);
    if (event.defaultPrevented || event.nativeEvent.isComposing || event.keyCode === 229) return;

    const changesValue =
      event.key === "ArrowUp" ||
      event.key === "ArrowDown" ||
      event.key === "Home" ||
      event.key === "End";
    if (inert && changesValue) return;

    if (event.key === "ArrowUp") {
      event.preventDefault();
      offset(1);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      offset(-1);
    } else if (event.key === "Enter") {
      event.currentTarget.blur();
    } else if (event.key === "Home" && lower !== undefined) {
      event.preventDefault();
      const nextValue = effectiveLower === undefined ? normalize(lower) : effectiveLower;
      publish(nextValue);
      setEditing(false);
      setDraft(String(nextValue));
    } else if (event.key === "End" && upper !== undefined) {
      event.preventDefault();
      const nextValue = effectiveUpper === undefined ? normalize(upper) : effectiveUpper;
      publish(nextValue);
      setEditing(false);
      setDraft(String(nextValue));
    } else if (event.key === "Escape") {
      event.preventDefault();
      setDraft(currentValue === null ? "" : String(currentValue));
      event.currentTarget.select();
    }
  }

  return (
    <div
      className={
        className
          ? `${root({ disabled: inert, size, status: invalid ? "error" : status })} ${className}`
          : root({ disabled: inert, size, status: invalid ? "error" : status })
      }
      style={style}
      dir={dir}
      data-meu-component="stepper"
      data-size={size}
      data-state={disabled ? "disabled" : readOnly ? "readonly" : invalid ? "error" : "default"}
    >
      <button
        className={button}
        type="button"
        disabled={inert || atMin}
        aria-controls={resolvedId}
        aria-label={decrementAriaLabel || (locale === "zh-CN" ? "减少" : "Decrease")}
        onPointerDown={handleStepButtonPointerDown}
        onPointerCancel={handleStepButtonPointerCancel}
        onClick={() => handleStepButtonClick(-1)}
      >
        <span aria-hidden="true">−</span>
      </button>
      <input
        {...props}
        ref={(node) => {
          inputRef.current = node;
          assignRef(ref, node);
        }}
        id={resolvedId}
        className={input}
        type="text"
        role="spinbutton"
        inputMode="decimal"
        value={editing ? draft : currentValue === null ? "" : String(currentValue)}
        disabled={disabled}
        dir={dir}
        readOnly={readOnly}
        required={required}
        onChange={(event) => setDraft(event.target.value)}
        onFocus={(event) => {
          setDraft(currentValue === null ? "" : String(currentValue));
          setEditing(true);
          event.currentTarget.select();
          if (onFocus) onFocus(event);
        }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        aria-valuenow={editing ? draftAriaValue : currentValue === null ? undefined : currentValue}
        aria-valuemin={effectiveLower}
        aria-valuemax={effectiveUpper}
        aria-required={required || undefined}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
      />
      <button
        className={button}
        type="button"
        disabled={inert || atMax}
        aria-controls={resolvedId}
        aria-label={incrementAriaLabel || (locale === "zh-CN" ? "增加" : "Increase")}
        onPointerDown={handleStepButtonPointerDown}
        onPointerCancel={handleStepButtonPointerCancel}
        onClick={() => handleStepButtonClick(1)}
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  );
});
