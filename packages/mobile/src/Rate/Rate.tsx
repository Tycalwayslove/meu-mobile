"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import type { CSSProperties, ChangeEvent, ForwardedRef, MouseEvent, PointerEvent } from "react";

import { useMeuConfig } from "../ConfigProvider";
import { useFieldContext } from "../Field/FieldContext";
import { clampNumber, normalizeSteppedNumber } from "../internal/numbers";
import { activeCharacter, activeStar, input, root, star, stars } from "./Rate.css";
import type { RateProps } from "./types";

type StarStyle = CSSProperties & { "--meu-rate-star-width": string };

type PointerSession = {
  changed: boolean;
  startValue: number;
  targetValue: number;
};

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
 * Renders a touch-friendly rating control backed by native range semantics.
 *
 * @public
 */
export const Rate = forwardRef<HTMLInputElement, RateProps>(function Rate(
  {
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-valuetext": ariaValueText,
    allowClear = true,
    allowHalf = false,
    character = "★",
    className,
    count = 5,
    defaultValue = 0,
    disabled = false,
    dir,
    getValueLabel,
    id,
    onClick,
    onChange,
    onPointerCancel,
    onPointerDown,
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
  const increment = allowHalf ? 0.5 : 1;
  const normalize = (nextValue: number) =>
    normalizeSteppedNumber({ max: safeCount, min: 0, step: increment, value: nextValue });
  const controlled = value !== undefined;
  const normalizedDefaultValue = normalize(defaultValue);
  const [uncontrolledValue, setUncontrolledValue] = useState(normalizedDefaultValue);
  const currentValue = normalize(controlled ? value : uncontrolledValue);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const defaultValueRef = useRef(normalizedDefaultValue);
  const pointerSessionRef = useRef<PointerSession | null>(null);
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
  const valueLabel = getValueLabel
    ? getValueLabel(currentValue, safeCount)
    : locale === "zh-CN"
      ? `${currentValue} / ${safeCount} 星`
      : `${currentValue} of ${safeCount} stars`;
  const starWidth = size === "small" ? 30 : size === "large" ? 38 : 34;

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
        pointerSessionRef.current = null;
      });
    }

    form.addEventListener("reset", handleReset);
    return () => form.removeEventListener("reset", handleReset);
  }, [controlled, props.form]);

  function publish(nextValue: number) {
    const bounded = normalize(nextValue);
    if (!controlled) setUncontrolledValue(bounded);
    if (bounded !== currentValue && onChange) onChange(bounded);
  }

  function valueFromPointer(event: PointerEvent<HTMLInputElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) return currentValue;
    const view = event.currentTarget.ownerDocument.defaultView;
    const rtl =
      event.currentTarget.dir === "rtl" ||
      (view ? view.getComputedStyle(event.currentTarget).direction === "rtl" : false);
    const ratio = (event.clientX - rect.left) / rect.width;
    const raw = (rtl ? 1 - ratio : ratio) * safeCount;
    const multiplier = allowHalf ? 2 : 1;
    return clampNumber(Math.ceil(raw * multiplier) / multiplier, 0, safeCount);
  }

  function handlePointerDown(event: PointerEvent<HTMLInputElement>) {
    if (onPointerDown) onPointerDown(event);
    if (event.defaultPrevented) {
      pointerSessionRef.current = null;
      return;
    }
    pointerSessionRef.current = {
      changed: false,
      startValue: currentValue,
      targetValue: valueFromPointer(event)
    };
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (pointerSessionRef.current) pointerSessionRef.current.changed = true;
    publish(event.target.valueAsNumber);
  }

  function handleClick(event: MouseEvent<HTMLInputElement>) {
    const pointerSession = pointerSessionRef.current;
    pointerSessionRef.current = null;
    if (onClick) onClick(event);
    if (event.defaultPrevented) return;
    if (
      event.detail > 0 &&
      allowClear &&
      pointerSession &&
      !pointerSession.changed &&
      pointerSession.startValue === pointerSession.targetValue
    ) {
      publish(0);
    }
  }

  return (
    <span
      className={
        className
          ? `${root({ disabled: inert, size, status: invalid ? "error" : status })} ${className}`
          : root({ disabled: inert, size, status: invalid ? "error" : status })
      }
      style={style}
      dir={dir}
      data-meu-component="rate"
      data-size={size}
      data-state={disabled ? "disabled" : readOnly ? "readonly" : invalid ? "error" : "default"}
      {...(readOnly
        ? {
            id: resolvedId,
            role: "meter" as const,
            "aria-label": ariaLabel || (labelledBy ? undefined : valueLabel),
            "aria-labelledby": labelledBy,
            "aria-describedby": describedBy,
            "aria-invalid": resolvedAriaInvalid,
            "aria-valuemin": 0,
            "aria-valuemax": safeCount,
            "aria-valuenow": currentValue,
            "aria-valuetext": ariaValueText || valueLabel
          }
        : {})}
    >
      {!readOnly ? (
        <input
          {...props}
          ref={(node) => {
            inputRef.current = node;
            assignRef(ref, node);
          }}
          id={resolvedId}
          className={input}
          type="range"
          min={0}
          max={safeCount}
          step={increment}
          value={currentValue}
          disabled={disabled}
          dir={dir}
          onChange={handleChange}
          onPointerDown={handlePointerDown}
          onPointerCancel={(event) => {
            if (onPointerCancel) onPointerCancel(event);
            pointerSessionRef.current = null;
          }}
          onClick={handleClick}
          aria-valuetext={ariaValueText || valueLabel}
          aria-label={ariaLabel}
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          aria-invalid={resolvedAriaInvalid}
        />
      ) : (
        <input
          ref={(node) => {
            inputRef.current = node;
            assignRef(ref, node);
          }}
          type="hidden"
          name={props.name}
          form={props.form}
          value={currentValue}
          disabled={disabled}
          data-meu-slot="form-value"
        />
      )}
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
