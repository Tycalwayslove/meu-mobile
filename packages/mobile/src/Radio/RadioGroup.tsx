"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent, ForwardedRef } from "react";

import { useFieldContext } from "../Field/FieldContext";
import { group } from "./Radio.css";
import { RadioGroupContext } from "./RadioGroupContext";
import type { RadioGroupProps, RadioValue } from "./types";

function assignRef<T>(ref: ForwardedRef<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

function mergeIdReferences(...values: Array<string | undefined>): string | undefined {
  const tokens = values.flatMap((value) => (value ? value.trim().split(/\s+/) : []));
  const uniqueTokens = [...new Set(tokens.filter(Boolean))];
  return uniqueTokens.length > 0 ? uniqueTokens.join(" ") : undefined;
}

/**
 * Coordinates selection, form naming, and accessibility for descendant radios.
 *
 * @public
 */
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
  readOnly = false,
  ref,
  required = false,
  status = "default",
  tabIndex = -1,
  value,
  ...props
}: RadioGroupProps<TValue>) {
  const generatedName = `meu-radio-group-${useId()}`;
  const fieldContext = useFieldContext();
  const groupRef = useRef<HTMLDivElement | null>(null);
  const [uncontrolledValue, setUncontrolledValue] = useState<TValue | undefined>(defaultValue);
  const controlled = value !== undefined;
  const currentValue = controlled ? value : uncontrolledValue;
  const resetValue = controlled ? currentValue : defaultValue;
  const resolvedId = id || (fieldContext ? fieldContext.controlId : undefined);
  const describedBy = mergeIdReferences(
    ariaDescribedBy,
    fieldContext ? fieldContext.describedBy : undefined
  );
  const labelledBy = mergeIdReferences(
    ariaLabelledBy,
    fieldContext ? fieldContext.labelId : undefined
  );
  const resolvedRequired = required || Boolean(fieldContext && fieldContext.required);
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

  function isSelected(optionValue: RadioValue) {
    return currentValue === optionValue;
  }

  function isResetSelected(optionValue: RadioValue) {
    return resetValue === optionValue;
  }

  function select(optionValue: RadioValue, event: ChangeEvent<HTMLInputElement>) {
    if (disabled || readOnly) return;
    const typedValue = optionValue as TValue;
    if (!controlled) setUncontrolledValue(typedValue);
    if (onChange) onChange(typedValue, event);
  }

  useEffect(() => {
    const container = groupRef.current;
    const firstInput = container
      ? container.querySelector<HTMLInputElement>("input[type='radio']")
      : null;
    const form = firstInput ? firstInput.form : null;
    if (!form || controlled) return;

    let resetTimer: number | null = null;
    const handleReset = (event: Event) => {
      if (resetTimer !== null) window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        resetTimer = null;
        if (!event.defaultPrevented) setUncontrolledValue(defaultValue);
      }, 0);
    };
    form.addEventListener("reset", handleReset);
    return () => {
      form.removeEventListener("reset", handleReset);
      if (resetTimer !== null) window.clearTimeout(resetTimer);
    };
  });

  return (
    <RadioGroupContext.Provider
      value={{
        disabled,
        isResetSelected,
        isSelected,
        name: name || generatedName,
        readOnly,
        required: resolvedRequired,
        select,
        status: invalid ? "error" : status
      }}
    >
      <div
        {...props}
        ref={(element) => {
          groupRef.current = element;
          assignRef(ref, element);
        }}
        id={resolvedId}
        role="radiogroup"
        tabIndex={tabIndex}
        className={className ? `${group({ direction })} ${className}` : group({ direction })}
        aria-describedby={describedBy}
        aria-invalid={resolvedAriaInvalid}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel ? undefined : labelledBy}
        aria-readonly={readOnly || undefined}
        aria-required={resolvedRequired || undefined}
        data-meu-component="radio-group"
        data-state={disabled ? "disabled" : readOnly ? "readonly" : invalid ? "error" : "default"}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}
