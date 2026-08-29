"use client";

import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ChangeEvent, ForwardedRef, MouseEvent } from "react";

import { useFieldContext } from "../Field/FieldContext";
import { indicator, input, root } from "./Checkbox.css";
import { useCheckboxGroupContext } from "./CheckboxGroupContext";
import type { CheckboxProps } from "./types";

function mergeIdReferences(...values: Array<string | undefined>): string | undefined {
  const tokens = values.flatMap((value) => (value ? value.trim().split(/\s+/) : []));
  const uniqueTokens = [...new Set(tokens.filter(Boolean))];
  return uniqueTokens.length > 0 ? uniqueTokens.join(" ") : undefined;
}

function assignRef<T>(ref: ForwardedRef<T>, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

/**
 * Renders a native checkbox with controlled or uncontrolled checked state.
 *
 * @public
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
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
    indeterminate = false,
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
  const resolvedReadOnly = readOnly || Boolean(groupContext && groupContext.readOnly);
  const resolvedStatus =
    status === "error" || (groupContext && groupContext.status === "error") ? "error" : "default";
  const callerInvalid =
    ariaInvalid === true ||
    ariaInvalid === "true" ||
    ariaInvalid === "grammar" ||
    ariaInvalid === "spelling";
  const fieldInvalid = Boolean(fieldContext && fieldContext.invalid);
  const contextualInvalid = status === "error" || (!groupContext && fieldInvalid);
  const invalid = callerInvalid || contextualInvalid;
  const visualInvalid = invalid || resolvedStatus === "error" || fieldInvalid;
  const resolvedAriaInvalid = contextualInvalid
    ? true
    : ariaInvalid === "grammar" || ariaInvalid === "spelling"
      ? ariaInvalid
      : callerInvalid
        ? true
        : ariaInvalid === false || ariaInvalid === "false"
          ? ariaInvalid
          : undefined;
  const resolvedId = id || (fieldContext && !inGroup ? fieldContext.controlId : undefined);
  const describedBy = mergeIdReferences(
    ariaDescribedBy,
    fieldContext ? fieldContext.describedBy : undefined
  );
  const resolvedName = name || (groupContext ? groupContext.name : undefined);
  const resolvedRequired = required || Boolean(fieldContext && fieldContext.required && !inGroup);
  const resetChecked =
    inGroup && groupContext && value !== undefined
      ? groupContext.isResetSelected(value)
      : controlled
        ? currentChecked
        : defaultChecked;

  useLayoutEffect(() => {
    const element = inputRef.current;
    if (element) element.indeterminate = indeterminate;
  }, [indeterminate]);

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
    event.currentTarget.indeterminate = indeterminate;
    if (inGroup && groupContext && value !== undefined) groupContext.toggle(value, nextChecked);
    else if (!controlled) setUncontrolledChecked(nextChecked);
    if (onChange) onChange(nextChecked, event);
  }

  function handleClick(event: MouseEvent<HTMLInputElement>) {
    if (resolvedReadOnly) {
      event.preventDefault();
      const element = event.currentTarget;
      element.checked = currentChecked;
      element.indeterminate = indeterminate;
      void Promise.resolve().then(() => {
        if (inputRef.current === element) {
          element.checked = currentChecked;
          element.indeterminate = indeterminate;
        }
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
      data-meu-component="checkbox"
      data-size={size}
      data-readonly={resolvedReadOnly ? "true" : "false"}
      data-state={
        resolvedDisabled
          ? "disabled"
          : resolvedReadOnly
            ? "readonly"
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
        form={form}
        name={resolvedName}
        required={resolvedRequired}
        value={value}
        onClick={handleClick}
        onChange={handleChange}
        aria-checked={indeterminate ? "mixed" : currentChecked}
        aria-describedby={describedBy}
        aria-invalid={resolvedAriaInvalid}
        aria-readonly={resolvedReadOnly || undefined}
      />
      <span
        className={indicator({
          checked: currentChecked,
          disabled: resolvedDisabled,
          indeterminate,
          size,
          status: visualInvalid ? "error" : resolvedStatus
        })}
        aria-hidden="true"
      />
      {children ? <span>{children}</span> : null}
    </label>
  );
});
