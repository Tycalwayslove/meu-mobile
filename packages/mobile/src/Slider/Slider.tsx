"use client";

import { forwardRef, useRef, useState } from "react";
import type { CSSProperties, ChangeEvent } from "react";

import { useFieldContext } from "../Field/FieldContext";
import { clampNumber } from "../internal/numbers";
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

export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  {
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    className,
    defaultValue,
    disabled = false,
    formatValue,
    id,
    marks = [],
    max = 100,
    min = 0,
    onChange,
    onChangeComplete,
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
  const lower = Math.min(min, max);
  const upper = Math.max(min, max);
  const controlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(() =>
    clampNumber(defaultValue === undefined ? lower : defaultValue, lower, upper)
  );
  const currentValue = clampNumber(controlled ? value : uncontrolledValue, lower, upper);
  const lastEventRef = useRef<ChangeEvent<HTMLInputElement> | null>(null);
  const lastValueRef = useRef(currentValue);
  const resolvedId = id || (fieldContext ? fieldContext.controlId : undefined);
  const describedBy = ariaDescribedBy || (fieldContext ? fieldContext.describedBy : undefined);
  const invalid =
    ariaInvalid === true ||
    ariaInvalid === "true" ||
    status === "error" ||
    Boolean(fieldContext && fieldContext.invalid);
  const progress = upper === lower ? 0 : ((currentValue - lower) / (upper - lower)) * 100;
  const sliderStyle: SliderStyle = {
    "--meu-slider-progress": `${Math.min(Math.max(progress, 0), 100)}%`
  };

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextValue = clampNumber(event.target.valueAsNumber, lower, upper);
    lastEventRef.current = event;
    lastValueRef.current = nextValue;
    if (!controlled) setUncontrolledValue(nextValue);
    if (onChange) onChange(nextValue, event);
  }

  function completeChange() {
    if (lastEventRef.current && onChangeComplete) {
      onChangeComplete(lastValueRef.current, lastEventRef.current);
    }
  }

  return (
    <div
      className={className ? `${root({ disabled, size })} ${className}` : root({ disabled, size })}
      style={style}
      data-meu-component="slider"
      data-size={size}
      data-state={disabled ? "disabled" : invalid ? "error" : "default"}
    >
      <div className={controlRow}>
        <input
          {...props}
          ref={ref}
          id={resolvedId}
          className={`${input} ${inputSize({ size, status: invalid ? "error" : status })}`}
          style={sliderStyle}
          type="range"
          min={lower}
          max={upper}
          step={Number.isFinite(step) && step > 0 ? step : 1}
          value={currentValue}
          disabled={disabled}
          onChange={handleChange}
          onPointerUp={completeChange}
          onKeyUp={completeChange}
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
            .filter((mark) => mark.value >= lower && mark.value <= upper)
            .map((mark) => (
              <span
                className={markClass}
                key={mark.value}
                style={{
                  left: `${upper === lower ? 0 : ((mark.value - lower) / (upper - lower)) * 100}%`
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
