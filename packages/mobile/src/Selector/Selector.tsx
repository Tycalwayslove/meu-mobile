"use client";

import { useId, useState } from "react";
import type { CSSProperties, MouseEvent } from "react";

import { useFieldContext } from "../Field/FieldContext";
import {
  checkMark,
  description,
  input,
  item,
  label,
  option,
  root,
  withCheckMark
} from "./Selector.css";
import type { SelectorProps, SelectorValue } from "./types";

type SelectorStyle = CSSProperties & { "--meu-selector-columns": string };

export function Selector<TValue extends SelectorValue = SelectorValue>({
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  allowClear = true,
  className,
  columns = 2,
  defaultValue = [],
  disabled = false,
  id,
  multiple = false,
  name,
  onChange,
  options,
  ref,
  required = false,
  showCheckMark = true,
  size = "medium",
  status = "default",
  style,
  tabIndex = -1,
  value,
  ...props
}: SelectorProps<TValue>) {
  const generatedName = `meu-selector-${useId()}`;
  const fieldContext = useFieldContext();
  const controlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<TValue[]>(defaultValue);
  const currentValue = controlled ? value : uncontrolledValue;
  const resolvedId = id || (fieldContext ? fieldContext.controlId : undefined);
  const describedBy = ariaDescribedBy || (fieldContext ? fieldContext.describedBy : undefined);
  const labelledBy = ariaLabelledBy || (fieldContext ? fieldContext.labelId : undefined);
  const invalid =
    ariaInvalid === true ||
    ariaInvalid === "true" ||
    status === "error" ||
    Boolean(fieldContext && fieldContext.invalid);
  const resolvedName = name || generatedName;
  const safeColumns = Math.min(Math.max(Math.trunc(columns), 1), 6);
  const rootStyle: SelectorStyle = { ...style, "--meu-selector-columns": String(safeColumns) };

  function publish(nextCandidates: TValue[]) {
    const nextValue = options
      .filter((candidate) => nextCandidates.some((itemValue) => itemValue === candidate.value))
      .map((candidate) => candidate.value);
    const selectedOptions = options.filter((candidate) =>
      nextValue.some((itemValue) => itemValue === candidate.value)
    );
    if (!controlled) setUncontrolledValue(nextValue);
    if (onChange) onChange(nextValue, selectedOptions);
  }

  function handleSingleClick(event: MouseEvent<HTMLInputElement>, active: boolean) {
    if (!multiple && active && allowClear) {
      event.preventDefault();
      publish([]);
    }
  }

  return (
    <div
      {...props}
      ref={ref}
      id={resolvedId}
      role={multiple ? "group" : "radiogroup"}
      tabIndex={tabIndex}
      className={
        className
          ? `${root({ size, status: invalid ? "error" : status })} ${className}`
          : root({ size, status: invalid ? "error" : status })
      }
      style={rootStyle}
      aria-describedby={describedBy}
      aria-invalid={multiple ? undefined : invalid || undefined}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel ? undefined : labelledBy}
      aria-required={required || undefined}
      data-meu-component="selector"
      data-size={size}
      data-state={disabled ? "disabled" : invalid ? "error" : "default"}
    >
      {options.map((candidate, index) => {
        const active = currentValue.some((itemValue) => itemValue === candidate.value);
        const optionDisabled = disabled || Boolean(candidate.disabled);
        const optionId = `${resolvedId || resolvedName}-option-${index}`;
        return (
          <div className={item} key={`${typeof candidate.value}-${String(candidate.value)}`}>
            <input
              className={input}
              id={optionId}
              type={multiple ? "checkbox" : "radio"}
              name={resolvedName}
              value={candidate.value}
              checked={active}
              disabled={optionDisabled}
              required={!multiple && required}
              onClick={(event) => handleSingleClick(event, active)}
              onChange={(event) => {
                if (optionDisabled) return;
                if (multiple) {
                  publish(
                    event.target.checked
                      ? [...currentValue, candidate.value]
                      : currentValue.filter((itemValue) => itemValue !== candidate.value)
                  );
                } else if (event.target.checked) {
                  publish([candidate.value]);
                }
              }}
            />
            <label
              htmlFor={optionId}
              className={`${option({ active, disabled: optionDisabled, size })}${
                active && showCheckMark ? ` ${withCheckMark}` : ""
              }`}
            >
              <span className={label}>{candidate.label}</span>
              {candidate.description ? (
                <span className={description}>{candidate.description}</span>
              ) : null}
              {active && showCheckMark ? <span className={checkMark} aria-hidden="true" /> : null}
            </label>
          </div>
        );
      })}
    </div>
  );
}
