"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import type { ChangeEvent, ForwardedRef } from "react";

import { useFieldContext } from "../Field/FieldContext";
import { indicator, input, root } from "./Checkbox.css";
import { useCheckboxGroupContext } from "./CheckboxGroupContext";
import type { CheckboxProps } from "./types";

function assignRef<T>(ref: ForwardedRef<T>, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    checked,
    children,
    className,
    defaultChecked = false,
    disabled = false,
    id,
    indeterminate = false,
    name,
    onChange,
    size = "medium",
    status = "default",
    style,
    value,
    ...props
  },
  forwardedRef
) {
  const fieldContext = useFieldContext();
  const groupContext = useCheckboxGroupContext();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked);
  const inGroup = Boolean(groupContext && value !== undefined);
  const controlled = checked !== undefined;
  const currentChecked = inGroup
    ? Boolean(groupContext && value !== undefined && groupContext.isSelected(value))
    : controlled
      ? checked
      : uncontrolledChecked;
  const resolvedDisabled = disabled || Boolean(groupContext && groupContext.disabled);
  const resolvedStatus =
    status === "error" || (groupContext && groupContext.status === "error") ? "error" : "default";
  const invalid =
    ariaInvalid === true ||
    ariaInvalid === "true" ||
    resolvedStatus === "error" ||
    Boolean(fieldContext && fieldContext.invalid);
  const resolvedId = id || (fieldContext && !inGroup ? fieldContext.controlId : undefined);
  const describedBy = ariaDescribedBy || (fieldContext ? fieldContext.describedBy : undefined);
  const resolvedName = name || (groupContext ? groupContext.name : undefined);

  useEffect(() => {
    const element = inputRef.current;
    if (element) element.indeterminate = indeterminate;
  }, [indeterminate]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (resolvedDisabled) {
      event.preventDefault();
      return;
    }
    const nextChecked = event.target.checked;
    if (inGroup && groupContext && value !== undefined) groupContext.toggle(value, nextChecked);
    else if (!controlled) setUncontrolledChecked(nextChecked);
    if (onChange) onChange(nextChecked, event);
  }

  return (
    <label
      className={
        className
          ? `${root({ disabled: resolvedDisabled, size })} ${className}`
          : root({ disabled: resolvedDisabled, size })
      }
      style={style}
      data-meu-component="checkbox"
      data-size={size}
      data-state={
        resolvedDisabled
          ? "disabled"
          : indeterminate
            ? "indeterminate"
            : currentChecked
              ? "checked"
              : "unchecked"
      }
    >
      <input
        {...props}
        ref={(element) => {
          inputRef.current = element;
          assignRef(forwardedRef, element);
        }}
        id={resolvedId}
        className={input}
        type="checkbox"
        checked={currentChecked}
        disabled={resolvedDisabled}
        name={resolvedName}
        value={value}
        onChange={handleChange}
        aria-checked={indeterminate ? "mixed" : currentChecked}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
      />
      <span
        className={indicator({
          checked: currentChecked,
          disabled: resolvedDisabled,
          indeterminate,
          size,
          status: invalid ? "error" : resolvedStatus
        })}
        aria-hidden="true"
      />
      {children ? <span>{children}</span> : null}
    </label>
  );
});
