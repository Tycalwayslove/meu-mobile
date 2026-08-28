"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import type { ChangeEvent, ForwardedRef, MouseEvent } from "react";

import { useFieldContext } from "../Field/FieldContext";
import { indicator, input, root } from "./Radio.css";
import { useRadioGroupContext } from "./RadioGroupContext";
import type { RadioProps } from "./types";

function assignRef<T>(ref: ForwardedRef<T>, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

function mergeIdReferences(...values: Array<string | undefined>): string | undefined {
  const tokens = values.flatMap((value) => (value ? value.trim().split(/\s+/) : []));
  const uniqueTokens = [...new Set(tokens.filter(Boolean))];
  return uniqueTokens.length > 0 ? uniqueTokens.join(" ") : undefined;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  {
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    checked,
    children,
    className,
    defaultChecked = false,
    disabled = false,
    form,
    id,
    name,
    onChange,
    onClick,
    readOnly = false,
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
  const resolvedReadOnly = readOnly || Boolean(groupContext && groupContext.readOnly);
  const resolvedStatus =
    status === "error" || (groupContext && groupContext.status === "error") ? "error" : "default";
  const invalid =
    ariaInvalid === true ||
    ariaInvalid === "true" ||
    resolvedStatus === "error" ||
    Boolean(fieldContext && fieldContext.invalid);
  const resolvedId = id || (fieldContext && !inGroup ? fieldContext.controlId : undefined);
  const describedBy = mergeIdReferences(
    ariaDescribedBy,
    fieldContext ? fieldContext.describedBy : undefined
  );
  const resolvedName = name || (groupContext ? groupContext.name : undefined);
  const resolvedRequired =
    required ||
    Boolean(groupContext && groupContext.required) ||
    Boolean(fieldContext && fieldContext.required);
  const resetChecked =
    inGroup && groupContext && value !== undefined
      ? groupContext.isResetSelected(value)
      : controlled
        ? currentChecked
        : defaultChecked;

  useEffect(() => {
    const element = inputRef.current;
    if (element) element.defaultChecked = resetChecked;
  }, [resetChecked]);

  useEffect(() => {
    const element = inputRef.current;
    const form = element ? element.form : null;
    if (!element || !form || controlled || inGroup) return;

    let resetTimer: number | null = null;
    const handleReset = (event: Event) => {
      if (resetTimer !== null) window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        resetTimer = null;
        if (!event.defaultPrevented) setUncontrolledChecked(defaultChecked);
      }, 0);
    };
    form.addEventListener("reset", handleReset);
    return () => {
      form.removeEventListener("reset", handleReset);
      if (resetTimer !== null) window.clearTimeout(resetTimer);
    };
  }, [controlled, defaultChecked, form, inGroup]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (resolvedDisabled || resolvedReadOnly) {
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

  function handleClick(event: MouseEvent<HTMLInputElement>) {
    if (resolvedReadOnly) {
      event.preventDefault();
      const element = event.currentTarget;
      element.checked = currentChecked;
      void Promise.resolve().then(() => {
        if (inputRef.current === element) element.checked = currentChecked;
      });
    }
    if (onClick) onClick(event);
  }

  return (
    <label
      className={
        className
          ? `${root({ disabled: resolvedDisabled, readOnly: resolvedReadOnly, size })} ${className}`
          : root({ disabled: resolvedDisabled, readOnly: resolvedReadOnly, size })
      }
      style={style}
      data-meu-component="radio"
      data-size={size}
      data-readonly={resolvedReadOnly ? "true" : "false"}
      data-state={
        resolvedDisabled
          ? "disabled"
          : resolvedReadOnly
            ? "readonly"
            : currentChecked
              ? "checked"
              : "unchecked"
      }
    >
      {/* aria-invalid is a global WAI-ARIA state that is valid on native radio inputs. */}
      {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props */}
      <input
        {...props}
        ref={(element) => {
          inputRef.current = element;
          assignRef(ref, element);
        }}
        id={resolvedId}
        className={input}
        type="radio"
        checked={currentChecked}
        disabled={resolvedDisabled}
        form={form}
        name={resolvedName}
        required={resolvedRequired}
        value={value}
        onClick={handleClick}
        onChange={handleChange}
        aria-describedby={describedBy}
        aria-disabled={!inGroup && resolvedReadOnly ? true : undefined}
        aria-invalid={invalid || undefined}
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
