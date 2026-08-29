"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import type { FocusEvent, ForwardedRef, KeyboardEvent, PointerEvent } from "react";

import { useMeuConfig } from "../ConfigProvider";
import { useFieldContext } from "../Field/FieldContext";
import { decimalPlaces, normalizeSteppedNumber } from "../internal/numbers";
import { button, input, root } from "./Stepper.css";
import type { StepperProps } from "./types";

function valuesEqual(first: number | null, second: number | null) {
  return first === second || (Number.isNaN(first) && Number.isNaN(second));
}

function assignRef(ref: ForwardedRef<HTMLInputElement>, node: HTMLInputElement | null) {
  if (typeof ref === "function") ref(node);
  else if (ref) ref.current = node;
}

function mergeIdReferences(...values: Array<string | undefined>): string | undefined {
  const tokens = values.flatMap((value) => (value ? value.trim().split(/\s+/) : []));
  const uniqueTokens = [...new Set(tokens.filter(Boolean))];
  return uniqueTokens.length > 0 ? uniqueTokens.join(" ") : undefined;
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
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    allowEmpty = false,
    className,
    decrementAriaLabel,
    defaultValue = 0,
    disabled = false,
    dir,
    id,
    incrementAriaLabel,
    inputMode = "decimal",
    max,
    min,
    onBlur,
    onChange,
    onFocus,
    onKeyDown,
    precision,
    readOnly = false,
    repeatOnLongPress = false,
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
  const safePrecision =
    precision === undefined || !Number.isFinite(precision)
      ? undefined
      : Math.min(
          Math.max(
            Math.trunc(precision),
            decimalPlaces(safeStep),
            lower === undefined ? 0 : decimalPlaces(lower)
          ),
          12
        );
  const normalize = (nextValue: number) =>
    normalizeSteppedNumber({
      max: upper,
      min: lower,
      precision: safePrecision,
      step: safeStep,
      value: nextValue
    });
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
  const activeStepPointerRef = useRef<number | null>(null);
  const repeatDelayRef = useRef(0);
  const repeatIntervalRef = useRef(0);
  const repeatStartedRef = useRef(false);
  const suppressStepClickRef = useRef(false);
  const pointerSequenceRef = useRef(0);
  const mountedRef = useRef(true);
  const repeatValueRef = useRef<number | null>(currentValue);
  const repeatPublishedValueRef = useRef<number | null>(currentValue);
  const resolvedId = id || (fieldContext ? fieldContext.controlId : undefined);
  const describedBy = mergeIdReferences(
    ariaDescribedBy,
    fieldContext ? fieldContext.describedBy : undefined
  );
  const hasExplicitAriaLabel = Boolean(ariaLabel && ariaLabel.trim());
  const labelledBy = hasExplicitAriaLabel
    ? ariaLabelledBy
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
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      window.clearTimeout(repeatDelayRef.current);
      window.clearInterval(repeatIntervalRef.current);
      repeatDelayRef.current = 0;
      repeatIntervalRef.current = 0;
      pointerSequenceRef.current += 1;
    };
  }, []);

  useEffect(() => {
    if (!inert && repeatOnLongPress) return;
    window.clearTimeout(repeatDelayRef.current);
    window.clearInterval(repeatIntervalRef.current);
    repeatDelayRef.current = 0;
    repeatIntervalRef.current = 0;
    repeatStartedRef.current = false;
    suppressStepClickRef.current = false;
    activeStepPointerRef.current = null;
    stepButtonPointerRef.current = false;
    pointerSequenceRef.current += 1;
  }, [inert, repeatOnLongPress]);

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
    const trimmedText = text.trim();
    const normalizedText = trimmedText.includes(".") ? trimmedText : trimmedText.replace(",", ".");
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalizedText)) return Number.NaN;
    return Number(normalizedText);
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

  function clearStepRepeat() {
    window.clearTimeout(repeatDelayRef.current);
    window.clearInterval(repeatIntervalRef.current);
    repeatDelayRef.current = 0;
    repeatIntervalRef.current = 0;
  }

  function handleStepButtonPointerDown(event: PointerEvent<HTMLButtonElement>, direction: -1 | 1) {
    if (event.button !== 0 || event.isPrimary === false) return;
    clearStepRepeat();
    pointerSequenceRef.current += 1;
    stepButtonPointerRef.current = true;
    activeStepPointerRef.current = event.pointerId;
    repeatStartedRef.current = false;
    suppressStepClickRef.current = false;
    const parsedDraft = parseDraft(draft);
    const startingValue = editing && Number.isFinite(parsedDraft) ? parsedDraft : currentValue;
    repeatValueRef.current =
      startingValue !== null ? startingValue : lower !== undefined ? lower : 0;
    repeatPublishedValueRef.current = currentValue;
    if (!repeatOnLongPress || inert) return;

    if (typeof event.currentTarget.setPointerCapture === "function") {
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // Browsers may reject capture when the pointer is no longer active.
      }
    }

    const repeatStep = () => {
      const repeatValue = repeatValueRef.current;
      const base = repeatValue !== null ? repeatValue : lower !== undefined ? lower : 0;
      const nextValue = normalize(base + safeStep * direction);
      if (valuesEqual(base, nextValue)) {
        clearStepRepeat();
        return false;
      }
      repeatValueRef.current = nextValue;
      setEditing(false);
      setDraft(String(nextValue));
      if (!controlled) setUncontrolledValue(nextValue);
      if (!valuesEqual(repeatPublishedValueRef.current, nextValue) && onChange) {
        onChange(nextValue);
      }
      repeatPublishedValueRef.current = nextValue;
      return true;
    };
    repeatDelayRef.current = window.setTimeout(() => {
      repeatStartedRef.current = true;
      if (repeatStep()) repeatIntervalRef.current = window.setInterval(repeatStep, 100);
    }, 500);
  }

  function handleStepButtonPointerCancel(event: PointerEvent<HTMLButtonElement>) {
    if (activeStepPointerRef.current !== null && event.pointerId !== activeStepPointerRef.current)
      return;
    clearStepRepeat();
    activeStepPointerRef.current = null;
    const repeated = repeatStartedRef.current;
    repeatStartedRef.current = false;
    suppressStepClickRef.current = true;
    const sequence = pointerSequenceRef.current + 1;
    pointerSequenceRef.current = sequence;
    void Promise.resolve().then(() => {
      if (mountedRef.current && pointerSequenceRef.current === sequence) {
        suppressStepClickRef.current = false;
      }
    });
    if (!stepButtonPointerRef.current) return;
    stepButtonPointerRef.current = false;
    if (!repeated && event.currentTarget.ownerDocument.activeElement !== inputRef.current) {
      commitDraft();
    }
  }

  function handleStepButtonPointerUp(event: PointerEvent<HTMLButtonElement>) {
    if (activeStepPointerRef.current !== null && event.pointerId !== activeStepPointerRef.current)
      return;
    clearStepRepeat();
    activeStepPointerRef.current = null;
    const repeated = repeatStartedRef.current;
    const ownerDocument = event.currentTarget.ownerDocument;
    repeatStartedRef.current = false;
    suppressStepClickRef.current = repeated;
    const sequence = pointerSequenceRef.current + 1;
    pointerSequenceRef.current = sequence;
    void Promise.resolve().then(() => {
      if (!mountedRef.current || pointerSequenceRef.current !== sequence) return;
      if (!stepButtonPointerRef.current) return;
      stepButtonPointerRef.current = false;
      if (!repeated && ownerDocument.activeElement !== inputRef.current) {
        commitDraft();
      }
    });
  }

  function handleStepButtonLostPointerCapture(event: PointerEvent<HTMLButtonElement>) {
    if (activeStepPointerRef.current === event.pointerId) handleStepButtonPointerCancel(event);
  }

  function handleStepButtonClick(direction: -1 | 1) {
    stepButtonPointerRef.current = false;
    pointerSequenceRef.current += 1;
    if (suppressStepClickRef.current) {
      suppressStepClickRef.current = false;
      return;
    }
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
        onPointerDown={(event) => handleStepButtonPointerDown(event, -1)}
        onPointerUp={handleStepButtonPointerUp}
        onPointerCancel={handleStepButtonPointerCancel}
        onLostPointerCapture={handleStepButtonLostPointerCapture}
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
        inputMode={inputMode}
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
        aria-label={ariaLabel}
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        aria-invalid={resolvedAriaInvalid}
      />
      <button
        className={button}
        type="button"
        disabled={inert || atMax}
        aria-controls={resolvedId}
        aria-label={incrementAriaLabel || (locale === "zh-CN" ? "增加" : "Increase")}
        onPointerDown={(event) => handleStepButtonPointerDown(event, 1)}
        onPointerUp={handleStepButtonPointerUp}
        onPointerCancel={handleStepButtonPointerCancel}
        onLostPointerCapture={handleStepButtonLostPointerCapture}
        onClick={() => handleStepButtonClick(1)}
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  );
});
