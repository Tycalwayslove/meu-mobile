"use client";

import { useEffect, useRef, useState } from "react";

import { useFieldContext } from "../Field/FieldContext";
import { assignRef } from "../internal/assignRef";
import { mergeIdReferences } from "../internal/mergeIdReferences";
import { group } from "./Checkbox.css";
import { CheckboxGroupContext } from "./CheckboxGroupContext";
import type { CheckboxGroupProps, CheckboxValue } from "./types";

/**
 * Coordinates checkbox values and shared accessibility state for a group.
 *
 * @public
 */
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
  readOnly = false,
  ref,
  status = "default",
  tabIndex = -1,
  value,
  ...props
}: CheckboxGroupProps<TValue>) {
  const fieldContext = useFieldContext();
  const groupRef = useRef<HTMLDivElement | null>(null);
  const [uncontrolledValue, setUncontrolledValue] = useState<TValue[]>(defaultValue);
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

  function isSelected(optionValue: CheckboxValue) {
    return currentValue.some((item) => item === optionValue);
  }

  function isResetSelected(optionValue: CheckboxValue) {
    return resetValue.some((item) => item === optionValue);
  }

  function toggle(optionValue: CheckboxValue, checked: boolean) {
    if (disabled || readOnly) return;
    const typedValue = optionValue as TValue;
    const nextValue = checked
      ? currentValue.some((item) => item === typedValue)
        ? currentValue
        : [...currentValue, typedValue]
      : currentValue.filter((item) => item !== typedValue);
    if (!controlled) setUncontrolledValue(nextValue);
    if (onChange) onChange(nextValue);
  }

  useEffect(() => {
    const container = groupRef.current;
    const firstInput = container
      ? container.querySelector<HTMLInputElement>("input[type='checkbox']")
      : null;
    const form = firstInput ? firstInput.form : null;
    if (!form || controlled) return;

    const view = form.ownerDocument.defaultView;
    if (!view) return;
    let resetTimer: number | null = null;
    const handleReset = (event: Event) => {
      if (resetTimer !== null) view.clearTimeout(resetTimer);
      resetTimer = view.setTimeout(() => {
        resetTimer = null;
        if (!event.defaultPrevented) setUncontrolledValue([...defaultValue]);
      }, 0);
    };
    form.addEventListener("reset", handleReset);
    return () => {
      form.removeEventListener("reset", handleReset);
      if (resetTimer !== null) view.clearTimeout(resetTimer);
    };
  });

  return (
    <CheckboxGroupContext.Provider
      value={{
        disabled,
        isResetSelected,
        isSelected,
        name,
        readOnly,
        status: invalid ? "error" : status,
        toggle
      }}
    >
      {/* aria-invalid is a global WAI-ARIA state that applies to the semantic group root. */}
      {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props */}
      <div
        {...props}
        ref={(element) => {
          groupRef.current = element;
          assignRef(ref, element);
        }}
        id={resolvedId}
        role="group"
        tabIndex={tabIndex}
        className={className ? `${group({ direction })} ${className}` : group({ direction })}
        aria-describedby={describedBy}
        aria-invalid={resolvedAriaInvalid}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel ? undefined : labelledBy}
        data-meu-component="checkbox-group"
        data-state={disabled ? "disabled" : readOnly ? "readonly" : invalid ? "error" : "default"}
      >
        {children}
      </div>
    </CheckboxGroupContext.Provider>
  );
}
