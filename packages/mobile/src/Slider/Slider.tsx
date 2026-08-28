"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import type {
  CSSProperties,
  ChangeEvent,
  FocusEvent,
  ForwardedRef,
  KeyboardEvent,
  PointerEvent
} from "react";

import { useFieldContext } from "../Field/FieldContext";
import { normalizeSteppedNumber } from "../internal/numbers";
import {
  controlRow,
  input,
  inputSize,
  mark as markClass,
  marks as marksClass,
  root,
  valueText
} from "./Slider.css";
import type { SliderProps } from "./types";

type SliderStyle = CSSProperties & {
  "--meu-slider-progress": string;
};

const valueChangingKeys = new Set([
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "End",
  "Home",
  "PageDown",
  "PageUp"
]);

function assignRef(ref: ForwardedRef<HTMLInputElement>, node: HTMLInputElement | null) {
  if (typeof ref === "function") ref(node);
  else if (ref) ref.current = node;
}

/** A native single-value range control with mobile pointer, keyboard and form semantics. */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  {
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    className,
    defaultValue,
    disabled = false,
    dir,
    formatValue,
    id,
    marks = [],
    max = 100,
    min = 0,
    onBlur,
    onChange,
    onChangeComplete,
    onKeyDown,
    onKeyUp,
    onPointerCancel,
    onPointerDown,
    onPointerUp,
    showValue = false,
    size = "medium",
    status = "default",
    step = 1,
    style,
    value,
    ...props
  },
  ref
) {
  const fieldContext = useFieldContext();
  const finiteMin = Number.isFinite(min) ? min : 0;
  const finiteMax = Number.isFinite(max) ? max : 100;
  const lower = Math.min(finiteMin, finiteMax);
  const upper = Math.max(finiteMin, finiteMax);
  const safeStep = Number.isFinite(step) && step > 0 ? step : 1;
  const normalize = (nextValue: number) =>
    normalizeSteppedNumber({ max: upper, min: lower, step: safeStep, value: nextValue });
  const effectiveUpper = normalize(upper);
  const controlled = value !== undefined;
  const normalizedDefaultValue = normalize(defaultValue === undefined ? lower : defaultValue);
  const [uncontrolledValue, setUncontrolledValue] = useState(normalizedDefaultValue);
  const currentValue = normalize(controlled ? value : uncontrolledValue);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const defaultValueRef = useRef(normalizedDefaultValue);
  const lastEventRef = useRef<ChangeEvent<HTMLInputElement> | null>(null);
  const lastValueRef = useRef(currentValue);
  const interactionStartValueRef = useRef(currentValue);
  const interactionChangedRef = useRef(false);
  const interactionActiveRef = useRef(false);
  const keyboardInteractionRef = useRef(false);
  const resolvedId = id || (fieldContext ? fieldContext.controlId : undefined);
  const describedBy = ariaDescribedBy || (fieldContext ? fieldContext.describedBy : undefined);
  const invalid =
    ariaInvalid === true ||
    ariaInvalid === "true" ||
    status === "error" ||
    Boolean(fieldContext && fieldContext.invalid);
  const progress =
    effectiveUpper === lower ? 0 : ((currentValue - lower) / (effectiveUpper - lower)) * 100;
  const sliderStyle: SliderStyle = {
    "--meu-slider-progress": `${Math.min(Math.max(progress, 0), 100)}%`
  };

  useEffect(() => {
    defaultValueRef.current = normalizedDefaultValue;
  }, [normalizedDefaultValue]);

  useEffect(() => {
    if (controlled) return;
    const form = inputRef.current ? inputRef.current.form : null;
    if (!form) return;

    function handleReset(event: Event) {
      if (inputRef.current) inputRef.current.defaultValue = String(defaultValueRef.current);
      void Promise.resolve().then(() => {
        if (event.defaultPrevented) return;
        const resetValue = defaultValueRef.current;
        setUncontrolledValue(resetValue);
        lastValueRef.current = resetValue;
        lastEventRef.current = null;
        interactionChangedRef.current = false;
      });
    }

    form.addEventListener("reset", handleReset);
    return () => form.removeEventListener("reset", handleReset);
  }, [controlled, props.form]);

  function beginInteraction() {
    interactionActiveRef.current = true;
    interactionStartValueRef.current = currentValue;
    lastValueRef.current = currentValue;
    interactionChangedRef.current = false;
    lastEventRef.current = null;
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextValue = normalize(event.target.valueAsNumber);
    lastEventRef.current = event;
    lastValueRef.current = nextValue;
    interactionChangedRef.current = nextValue !== interactionStartValueRef.current;
    if (!controlled) setUncontrolledValue(nextValue);
    if (onChange) onChange(nextValue, event);
  }

  function completeChange() {
    if (
      interactionActiveRef.current &&
      interactionChangedRef.current &&
      lastEventRef.current &&
      onChangeComplete
    ) {
      onChangeComplete(lastValueRef.current, lastEventRef.current);
    }
    interactionChangedRef.current = false;
    interactionActiveRef.current = false;
    lastEventRef.current = null;
    keyboardInteractionRef.current = false;
  }

  function handlePointerDown(event: PointerEvent<HTMLInputElement>) {
    if (onPointerDown) onPointerDown(event);
    if (!event.defaultPrevented) beginInteraction();
  }

  function handlePointerUp(event: PointerEvent<HTMLInputElement>) {
    if (onPointerUp) onPointerUp(event);
    completeChange();
  }

  function handlePointerCancel(event: PointerEvent<HTMLInputElement>) {
    if (onPointerCancel) onPointerCancel(event);
    interactionChangedRef.current = false;
    interactionActiveRef.current = false;
    lastEventRef.current = null;
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (onKeyDown) onKeyDown(event);
    if (
      !event.defaultPrevented &&
      valueChangingKeys.has(event.key) &&
      !keyboardInteractionRef.current
    ) {
      beginInteraction();
      keyboardInteractionRef.current = true;
    }
  }

  function handleKeyUp(event: KeyboardEvent<HTMLInputElement>) {
    if (onKeyUp) onKeyUp(event);
    if (valueChangingKeys.has(event.key)) completeChange();
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    if (keyboardInteractionRef.current) completeChange();
    if (onBlur) onBlur(event);
  }

  return (
    <div
      className={className ? `${root({ disabled, size })} ${className}` : root({ disabled, size })}
      style={style}
      dir={dir}
      data-meu-component="slider"
      data-size={size}
      data-state={disabled ? "disabled" : invalid ? "error" : "default"}
    >
      <div className={controlRow}>
        <input
          {...props}
          ref={(node) => {
            inputRef.current = node;
            assignRef(ref, node);
          }}
          id={resolvedId}
          className={`${input} ${inputSize({ size, status: invalid ? "error" : status })}`}
          style={sliderStyle}
          type="range"
          min={lower}
          max={effectiveUpper}
          step={safeStep}
          value={currentValue}
          disabled={disabled}
          dir={dir}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onPointerCancel={handlePointerCancel}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
        />
        {showValue ? (
          <output className={valueText} htmlFor={resolvedId}>
            {formatValue ? formatValue(currentValue) : currentValue}
          </output>
        ) : null}
      </div>
      {marks.length > 0 ? (
        <div className={marksClass} aria-hidden="true">
          {marks
            .filter((mark) => mark.value >= lower && mark.value <= effectiveUpper)
            .map((mark, index) => (
              <span
                className={markClass}
                key={`${mark.value}-${index}`}
                style={{
                  insetInlineStart: `${
                    effectiveUpper === lower
                      ? 0
                      : ((mark.value - lower) / (effectiveUpper - lower)) * 100
                  }%`
                }}
              >
                {mark.label}
              </span>
            ))}
        </div>
      ) : null}
    </div>
  );
});
