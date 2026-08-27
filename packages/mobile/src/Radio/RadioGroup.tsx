"use client";

import { useId, useState } from "react";
import type { ChangeEvent } from "react";

import { useFieldContext } from "../Field/FieldContext";
import { group } from "./Radio.css";
import { RadioGroupContext } from "./RadioGroupContext";
import type { RadioGroupProps, RadioValue } from "./types";

export function RadioGroup<TValue extends RadioValue = RadioValue>({
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  children,
  className,
  defaultValue,
  direction = "vertical",
  disabled = false,
  id,
  name,
  onChange,
  ref,
  required = false,
  status = "default",
  tabIndex = -1,
  value,
  ...props
}: RadioGroupProps<TValue>) {
  const generatedName = `meu-radio-group-${useId()}`;
  const fieldContext = useFieldContext();
  const [uncontrolledValue, setUncontrolledValue] = useState<TValue | undefined>(defaultValue);
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

  function isSelected(optionValue: RadioValue) {
    return currentValue === optionValue;
  }

  function select(optionValue: RadioValue, event: ChangeEvent<HTMLInputElement>) {
    const typedValue = optionValue as TValue;
    if (!controlled) setUncontrolledValue(typedValue);
    if (onChange) onChange(typedValue, event);
  }

  return (
    <RadioGroupContext.Provider
      value={{
        disabled,
        isSelected,
        name: name || generatedName,
        required,
        select,
        status: invalid ? "error" : status
      }}
    >
      <div
        {...props}
        ref={ref}
        id={resolvedId}
        role="radiogroup"
        tabIndex={tabIndex}
        className={className ? `${group({ direction })} ${className}` : group({ direction })}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel ? undefined : labelledBy}
        aria-required={required || undefined}
        data-meu-component="radio-group"
        data-state={disabled ? "disabled" : invalid ? "error" : "default"}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}
