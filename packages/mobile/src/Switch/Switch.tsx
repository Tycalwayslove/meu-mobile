"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import type { ChangeEvent, ForwardedRef, MouseEvent } from "react";

import { useFieldContext } from "../Field/FieldContext";
import { input, root, spinner, thumb, track } from "./Switch.css";
import type { SwitchProps } from "./types";

function assignRef<T>(ref: ForwardedRef<T>, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

function mergeIdReferences(...values: Array<string | undefined>): string | undefined {
  const tokens = values.flatMap((value) => (value ? value.trim().split(/\s+/) : []));
  const uniqueTokens = [...new Set(tokens.filter(Boolean))];
  return uniqueTokens.length > 0 ? uniqueTokens.join(" ") : undefined;
}

/**
 * Renders a native checkbox with switch semantics and Field integration.
 *
 * @public
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  {
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    checked,
    className,
    defaultChecked = false,
    disabled = false,
    form,
    id,
    loading = false,
    onChange,
    onClick,
    readOnly = false,
    required = false,
    size = "medium",
    status = "default",
    style,
    ...props
  },
  ref
) {
  const fieldContext = useFieldContext();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked);
  const controlled = checked !== undefined;
  const currentChecked = controlled ? checked : uncontrolledChecked;
  const interactionBlocked = disabled || loading || readOnly;
  const resolvedId = id || (fieldContext ? fieldContext.controlId : undefined);
  const describedBy = mergeIdReferences(
    ariaDescribedBy,
    fieldContext ? fieldContext.describedBy : undefined
  );
  const labelledBy = ariaLabel
    ? undefined
    : mergeIdReferences(ariaLabelledBy, fieldContext ? fieldContext.labelId : undefined);
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
  const resetChecked = controlled ? currentChecked : defaultChecked;

  useEffect(() => {
    const element = inputRef.current;
    if (element) element.defaultChecked = resetChecked;
  }, [resetChecked]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (interactionBlocked) {
      event.preventDefault();
      const element = event.currentTarget;
      element.checked = currentChecked;
      void Promise.resolve().then(() => {
        if (inputRef.current === element) element.checked = currentChecked;
      });
      return;
    }
    const nextChecked = event.target.checked;
    if (!controlled) setUncontrolledChecked(nextChecked);
    if (onChange) onChange(nextChecked, event);
  }

  function handleClick(event: MouseEvent<HTMLInputElement>) {
    if (loading || readOnly) {
      event.preventDefault();
      const element = event.currentTarget;
      element.checked = currentChecked;
      void Promise.resolve().then(() => {
        if (inputRef.current === element) element.checked = currentChecked;
      });
    }
    if (!loading && onClick) onClick(event);
  }

  useEffect(() => {
    const element = inputRef.current;
    const form = element ? element.form : null;
    if (!element || !form || controlled) return;

    const view = form.ownerDocument.defaultView;
    if (!view) return;
    let resetTimer: number | null = null;
    const handleReset = (event: Event) => {
      if (resetTimer !== null) view.clearTimeout(resetTimer);
      resetTimer = view.setTimeout(() => {
        resetTimer = null;
        if (!event.defaultPrevented) setUncontrolledChecked(defaultChecked);
      }, 0);
    };
    form.addEventListener("reset", handleReset);
    return () => {
      form.removeEventListener("reset", handleReset);
      if (resetTimer !== null) view.clearTimeout(resetTimer);
    };
  }, [controlled, defaultChecked, form]);

  return (
    <span
      className={
        className
          ? `${root({ disabled: interactionBlocked, readOnly, size })} ${className}`
          : root({ disabled: interactionBlocked, readOnly, size })
      }
      style={style}
      data-meu-component="switch"
      data-size={size}
      data-readonly={readOnly ? "true" : "false"}
      data-state={
        loading
          ? "loading"
          : disabled
            ? "disabled"
            : readOnly
              ? "readonly"
              : currentChecked
                ? "checked"
                : "unchecked"
      }
    >
      <input
        {...props}
        ref={(element) => {
          inputRef.current = element;
          assignRef(ref, element);
        }}
        id={resolvedId}
        className={input}
        type="checkbox"
        role="switch"
        checked={currentChecked}
        disabled={disabled}
        form={form}
        required={resolvedRequired}
        onClick={handleClick}
        onChange={handleChange}
        aria-busy={loading}
        aria-checked={currentChecked}
        aria-describedby={describedBy}
        aria-disabled={loading || undefined}
        aria-invalid={resolvedAriaInvalid}
        aria-label={ariaLabel}
        aria-labelledby={labelledBy}
        aria-readonly={readOnly || undefined}
      />
      <span
        className={track({
          checked: currentChecked,
          disabled: interactionBlocked,
          size,
          status: invalid ? "error" : status
        })}
        aria-hidden="true"
      >
        <span className={thumb({ checked: currentChecked, size })}>
          {loading ? <span className={spinner} /> : null}
        </span>
      </span>
    </span>
  );
});
