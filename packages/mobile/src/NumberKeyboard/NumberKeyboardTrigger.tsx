"use client";

import { useFieldContext } from "../Field/FieldContext";
import { trigger, triggerPlaceholder, triggerSuffix, triggerValue } from "./NumberKeyboard.css";
import type { NumberKeyboardTriggerProps } from "./types";

/**
 * Renders a Field-aware button that opens a NumberKeyboard.
 *
 * @public
 */
export function NumberKeyboardTrigger({
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  className,
  disabled = false,
  id,
  open = false,
  placeholder = "请输入",
  ref,
  status = "default",
  type = "button",
  value,
  ...props
}: NumberKeyboardTriggerProps) {
  const fieldContext = useFieldContext();
  const resolvedId = id || (fieldContext ? fieldContext.controlId : undefined);
  const describedBy =
    [ariaDescribedBy, fieldContext ? fieldContext.describedBy : undefined]
      .flatMap((item) => (item ? item.trim().split(/\s+/) : []))
      .filter((item, index, items) => items.indexOf(item) === index)
      .join(" ") || undefined;
  const labelledBy =
    ariaLabelledBy || (!ariaLabel && fieldContext ? fieldContext.labelId : undefined);
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
  const hasValue = value !== undefined && value !== null && value !== "";
  const classes = trigger({ status: invalid ? "error" : status });

  return (
    /* aria-invalid is a global WAI-ARIA state carried by the native trigger. */
    /* eslint-disable-next-line jsx-a11y/role-supports-aria-props */
    <button
      {...props}
      ref={ref}
      id={resolvedId}
      type={type}
      className={className ? `${classes} ${className}` : classes}
      disabled={disabled}
      aria-describedby={describedBy}
      aria-expanded={open}
      aria-invalid={resolvedAriaInvalid}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel ? undefined : labelledBy}
      data-invalid={invalid || undefined}
      data-meu-component="number-keyboard-trigger"
      data-state={disabled ? "disabled" : invalid ? "error" : open ? "open" : "default"}
    >
      <span className={`${triggerValue}${hasValue ? "" : ` ${triggerPlaceholder}`}`}>
        {hasValue ? value : placeholder}
      </span>
      <span className={triggerSuffix} aria-hidden="true">
        123
      </span>
    </button>
  );
}
