"use client";

import { forwardRef, useState } from "react";
import type { ChangeEvent } from "react";

import { useFieldContext } from "../Field/FieldContext";
import { indicator, input, root } from "./Radio.css";
import { useRadioGroupContext } from "./RadioGroupContext";
import type { RadioProps } from "./types";

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  {
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    checked,
    children,
    className,
    defaultChecked = false,
    disabled = false,
    id,
    name,
    onChange,
    required = false,
    size = "medium",
    status = "default",
    style,
    value,
    ...props
  },
  ref
) {
  const fieldContext = useFieldContext();
  const groupContext = useRadioGroupContext();
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
  const resolvedRequired = required || Boolean(groupContext && groupContext.required);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (resolvedDisabled) {
      event.preventDefault();
      return;
    }
    const nextChecked = event.target.checked;
    if (nextChecked && inGroup && groupContext && value !== undefined) {
      groupContext.select(value, event);
    } else if (!controlled) {
      setUncontrolledChecked(nextChecked);
    }
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
      data-meu-component="radio"
      data-size={size}
      data-state={resolvedDisabled ? "disabled" : currentChecked ? "checked" : "unchecked"}
    >
      <input
        {...props}
        ref={ref}
        id={resolvedId}
        className={input}
        type="radio"
        checked={currentChecked}
        disabled={resolvedDisabled}
        name={resolvedName}
        required={resolvedRequired}
        value={value}
        onChange={handleChange}
        aria-describedby={describedBy}
      />
      <span
        className={indicator({
          checked: currentChecked,
          disabled: resolvedDisabled,
          size,
          status: invalid ? "error" : resolvedStatus
        })}
        aria-hidden="true"
      />
      {children ? <span>{children}</span> : null}
    </label>
  );
});
