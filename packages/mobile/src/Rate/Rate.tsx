"use client";

import { forwardRef, useRef, useState } from "react";
import type { CSSProperties, ChangeEvent, PointerEvent } from "react";

import { useMeuConfig } from "../ConfigProvider";
import { useFieldContext } from "../Field/FieldContext";
import { clampNumber, roundNumber } from "../internal/numbers";
import { activeCharacter, activeStar, input, root, star, stars } from "./Rate.css";
import type { RateProps } from "./types";

type StarStyle = CSSProperties & { "--meu-rate-star-width": string };

export const Rate = forwardRef<HTMLInputElement, RateProps>(function Rate(
  {
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    "aria-valuetext": ariaValueText,
    allowClear = true,
    allowHalf = false,
    character = "★",
    className,
    count = 5,
    defaultValue = 0,
    disabled = false,
    getValueLabel,
    id,
    onChange,
    readOnly = false,
    size = "medium",
    status = "default",
    style,
    value,
    ...props
  },
  ref
) {
  const { locale } = useMeuConfig();
  const fieldContext = useFieldContext();
  const safeCount = Math.max(1, Math.trunc(Number.isFinite(count) ? count : 5));
  const controlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(() =>
    clampNumber(defaultValue, 0, safeCount)
  );
  const currentValue = clampNumber(controlled ? value : uncontrolledValue, 0, safeCount);
  const pointerStartValue = useRef(currentValue);
  const pointerTargetValue = useRef(currentValue);
  const resolvedId = id || (fieldContext ? fieldContext.controlId : undefined);
  const describedBy = ariaDescribedBy || (fieldContext ? fieldContext.describedBy : undefined);
  const invalid =
    ariaInvalid === true ||
    ariaInvalid === "true" ||
    status === "error" ||
    Boolean(fieldContext && fieldContext.invalid);
  const inert = disabled || readOnly;
  const valueLabel = getValueLabel
    ? getValueLabel(currentValue, safeCount)
    : locale === "zh-CN"
      ? `${currentValue} / ${safeCount} 星`
      : `${currentValue} of ${safeCount} stars`;
  const starWidth = size === "small" ? 30 : size === "large" ? 38 : 34;

  function publish(nextValue: number) {
    const bounded = clampNumber(nextValue, 0, safeCount);
    if (!controlled) setUncontrolledValue(bounded);
    if (bounded !== currentValue && onChange) onChange(bounded);
  }

  function valueFromPointer(event: PointerEvent<HTMLInputElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) return currentValue;
    const raw = ((event.clientX - rect.left) / rect.width) * safeCount;
    const multiplier = allowHalf ? 2 : 1;
    return clampNumber(Math.ceil(raw * multiplier) / multiplier, 0, safeCount);
  }

  function handlePointerDown(event: PointerEvent<HTMLInputElement>) {
    pointerStartValue.current = currentValue;
    pointerTargetValue.current = valueFromPointer(event);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    publish(roundNumber(event.target.valueAsNumber, allowHalf ? 1 : 0));
  }

  return (
    <span
      className={
        className
          ? `${root({ disabled: inert, size, status: invalid ? "error" : status })} ${className}`
          : root({ disabled: inert, size, status: invalid ? "error" : status })
      }
      style={style}
      data-meu-component="rate"
      data-size={size}
      data-state={disabled ? "disabled" : readOnly ? "readonly" : invalid ? "error" : "default"}
      {...(readOnly
        ? {
            id: resolvedId,
            role: "img" as const,
            "aria-label": props["aria-label"] || valueLabel,
            "aria-describedby": describedBy
          }
        : {})}
    >
      {!readOnly ? (
        <input
          {...props}
          ref={ref}
          id={resolvedId}
          className={input}
          type="range"
          min={0}
          max={safeCount}
          step={allowHalf ? 0.5 : 1}
          value={currentValue}
          disabled={disabled}
          onChange={handleChange}
          onPointerDown={handlePointerDown}
          onClick={(event) => {
            if (
              event.detail > 0 &&
              allowClear &&
              pointerStartValue.current === pointerTargetValue.current
            ) {
              publish(0);
            }
          }}
          aria-valuetext={ariaValueText || valueLabel}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
        />
      ) : null}
      <span className={stars({ size })} aria-hidden="true">
        {Array.from({ length: safeCount }, (_, index) => {
          const fill = Math.min(Math.max(currentValue - index, 0), 1) * 100;
          const starStyle: StarStyle = { "--meu-rate-star-width": `${starWidth}px` };
          return (
            <span className={star({ size })} key={index} style={starStyle}>
              {character}
              <span className={activeStar} style={{ width: `${fill}%` }}>
                <span className={activeCharacter}>{character}</span>
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
});
