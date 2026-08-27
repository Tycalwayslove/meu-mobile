"use client";

import { useState } from "react";

import { useFieldContext } from "../Field/FieldContext";
import { group } from "./Checkbox.css";
import { CheckboxGroupContext } from "./CheckboxGroupContext";
import type { CheckboxGroupProps, CheckboxValue } from "./types";

export function CheckboxGroup<TValue extends CheckboxValue = CheckboxValue>({
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  children,
  className,
  defaultValue = [],
  direction = "vertical",
  disabled = false,
  id,
  name,
  onChange,
  ref,
  status = "default",
  tabIndex = -1,
  value,
  ...props
}: CheckboxGroupProps<TValue>) {
  const fieldContext = useFieldContext();
  const [uncontrolledValue, setUncontrolledValue] = useState<TValue[]>(defaultValue);
  const controlled = value !== undefined;
  const currentValue = controlled ? value : uncontrolledValue;
  const resolvedId = id || (fieldContext ? fieldContext.controlId : undefined);
  const describedBy = ariaDescribedBy || (fieldContext ? fieldContext.describedBy : undefined);
  const labelledBy = ariaLabelledBy || (fieldContext ? fieldContext.labelId : undefined);
  const invalid =
    ariaInvalid === true ||
    ariaInvalid === "true" ||
    status === "error" ||
    Boolean(fieldContext && fieldContext.invalid);

  function isSelected(optionValue: CheckboxValue) {
    return currentValue.some((item) => item === optionValue);
  }

  function toggle(optionValue: CheckboxValue, checked: boolean) {
    const typedValue = optionValue as TValue;
    const nextValue = checked
      ? currentValue.some((item) => item === typedValue)
        ? currentValue
        : [...currentValue, typedValue]
      : currentValue.filter((item) => item !== typedValue);
    if (!controlled) setUncontrolledValue(nextValue);
    if (onChange) onChange(nextValue);
  }

  return (
    <CheckboxGroupContext.Provider
      value={{ disabled, isSelected, name, status: invalid ? "error" : status, toggle }}
    >
      <div
        {...props}
        ref={ref}
        id={resolvedId}
        role="group"
        tabIndex={tabIndex}
        className={className ? `${group({ direction })} ${className}` : group({ direction })}
        aria-describedby={describedBy}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel ? undefined : labelledBy}
        data-meu-component="checkbox-group"
        data-state={disabled ? "disabled" : invalid ? "error" : "default"}
      >
        {children}
      </div>
    </CheckboxGroupContext.Provider>
  );
}
