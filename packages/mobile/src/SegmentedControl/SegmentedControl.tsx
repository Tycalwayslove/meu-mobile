"use client";

import { useId, useState } from "react";

import { useFieldContext } from "../Field/FieldContext";
import { icon, input, item, label, option, root } from "./SegmentedControl.css";
import type { SegmentedControlProps, SegmentedControlValue } from "./types";

export function SegmentedControl<TValue extends SegmentedControlValue = SegmentedControlValue>({
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  block = false,
  className,
  defaultValue,
  disabled = false,
  id,
  name,
  onChange,
  options,
  ref,
  required = false,
  size = "medium",
  status = "default",
  tabIndex = -1,
  value,
  ...props
}: SegmentedControlProps<TValue>) {
  const generatedName = `meu-segmented-${useId()}`;
  const fieldContext = useFieldContext();
  const controlled = value !== undefined;
  const firstEnabled = options.find((candidate) => !candidate.disabled);
  const validDefault = options.some(
    (candidate) => !candidate.disabled && candidate.value === defaultValue
  );
  const [uncontrolledValue, setUncontrolledValue] = useState<TValue | null>(() => {
    if (validDefault && defaultValue !== undefined) return defaultValue;
    return firstEnabled ? firstEnabled.value : null;
  });
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
  const classes = root({ block, status: invalid ? "error" : status });

  return (
    <div
      {...props}
      ref={ref}
      id={resolvedId}
      role="radiogroup"
      tabIndex={tabIndex}
      className={className ? `${classes} ${className}` : classes}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel ? undefined : labelledBy}
      aria-required={required || undefined}
      data-meu-component="segmented-control"
      data-size={size}
      data-state={disabled ? "disabled" : invalid ? "error" : "default"}
    >
      {options.map((candidate, index) => {
        const active = currentValue === candidate.value;
        const optionDisabled = disabled || Boolean(candidate.disabled);
        const optionId = `${resolvedId || resolvedName}-option-${index}`;
        return (
          <div
            className={item({ block })}
            key={`${typeof candidate.value}-${String(candidate.value)}`}
          >
            <input
              className={input}
              id={optionId}
              type="radio"
              name={resolvedName}
              value={candidate.value}
              checked={active}
              disabled={optionDisabled}
              required={required}
              onChange={(event) => {
                if (optionDisabled || !event.target.checked) return;
                if (!controlled) setUncontrolledValue(candidate.value);
                if (onChange) onChange(candidate.value, event);
              }}
            />
            <label
              htmlFor={optionId}
              className={option({ active, disabled: optionDisabled, size })}
            >
              {candidate.icon !== undefined && candidate.icon !== null ? (
                <span className={icon} aria-hidden="true">
                  {candidate.icon}
                </span>
              ) : null}
              <span className={label}>{candidate.label}</span>
            </label>
          </div>
        );
      })}
    </div>
  );
}
