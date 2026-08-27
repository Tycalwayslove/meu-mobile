"use client";

import { forwardRef, useState } from "react";
import type { ChangeEvent } from "react";

import { useFieldContext } from "../Field/FieldContext";
import { input, root, spinner, thumb, track } from "./Switch.css";
import type { SwitchProps } from "./types";

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  {
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    checked,
    className,
    defaultChecked = false,
    disabled = false,
    id,
    loading = false,
    onChange,
    size = "medium",
    status = "default",
    style,
    ...props
  },
  ref
) {
  const fieldContext = useFieldContext();
  const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked);
  const controlled = checked !== undefined;
  const currentChecked = controlled ? checked : uncontrolledChecked;
  const resolvedDisabled = disabled || loading;
  const resolvedId = id || (fieldContext ? fieldContext.controlId : undefined);
  const describedBy = ariaDescribedBy || (fieldContext ? fieldContext.describedBy : undefined);
  const invalid =
    ariaInvalid === true ||
    ariaInvalid === "true" ||
    status === "error" ||
    Boolean(fieldContext && fieldContext.invalid);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (resolvedDisabled) {
      event.preventDefault();
      return;
    }
    const nextChecked = event.target.checked;
    if (!controlled) setUncontrolledChecked(nextChecked);
    if (onChange) onChange(nextChecked, event);
  }

  return (
    <span
      className={
        className
          ? `${root({ disabled: resolvedDisabled, size })} ${className}`
          : root({ disabled: resolvedDisabled, size })
      }
      style={style}
      data-meu-component="switch"
      data-size={size}
      data-state={
        loading
          ? "loading"
          : resolvedDisabled
            ? "disabled"
            : currentChecked
              ? "checked"
              : "unchecked"
      }
    >
      <input
        {...props}
        ref={ref}
        id={resolvedId}
        className={input}
        type="checkbox"
        role="switch"
        checked={currentChecked}
        disabled={resolvedDisabled}
        onChange={handleChange}
        aria-busy={loading}
        aria-checked={currentChecked}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
      />
      <span
        className={track({
          checked: currentChecked,
          disabled: resolvedDisabled,
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
