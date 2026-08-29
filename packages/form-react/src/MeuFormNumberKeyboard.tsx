"use client";

import { Field, NumberKeyboard, NumberKeyboardTrigger } from "@meu/mobile";
import { useEffect, useId, useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { useController, useFormContext } from "react-hook-form";
import type { FieldValues, Path, UseControllerProps } from "react-hook-form";

import type {
  NumberKeyboardDeleteDetails,
  NumberKeyboardInputDetails,
  NumberKeyboardOpenChangeDetails,
  NumberKeyboardProps,
  NumberKeyboardTriggerProps
} from "@meu/mobile";
import { HiddenFormValues } from "./HiddenFormValues";

/**
 * Number keyboard props accepted after removing state managed by the form adapter.
 *
 * @public
 */
export type MeuFormNumberKeyboardAdapterProps = Omit<
  NumberKeyboardProps,
  | "aria-label"
  | "aria-labelledby"
  | "defaultOpen"
  | "id"
  | "onConfirm"
  | "onDelete"
  | "onInput"
  | "onOpenChange"
  | "open"
  | "ref"
  | "title"
>;

/**
 * Reasons reported when the number keyboard requests an open-state change.
 *
 * @public
 */
export type MeuFormNumberKeyboardOpenChangeDetails =
  | NumberKeyboardOpenChangeDetails
  | {
      /** Identifies a request caused by activating the form field's trigger button. */
      reason: "trigger";
    };

/**
 * Props for a number keyboard whose edited string is stored in React Hook Form.
 *
 * @public
 */
export type MeuFormNumberKeyboardProps<TFieldValues extends FieldValues> =
  MeuFormNumberKeyboardAdapterProps & {
    /** Initial keyboard state when `open` does not control visibility. */
    defaultOpen?: boolean;
    /** Supporting content rendered with the field and associated with the trigger. */
    description?: ReactNode;
    /** Renders the trigger value from the current string stored in the form. */
    formatValue?: (value: string) => ReactNode;
    /** Accessible keyboard name used when `keyboardTitle` does not render a heading. */
    keyboardAriaLabel?: string;
    /** Keyboard heading; a string `label` supplies the default when this is omitted. */
    keyboardTitle?: string;
    /** Visible field label rendered by the surrounding `Field`. */
    label?: ReactNode;
    /** Maximum stored string length after each transformed key input. */
    maxLength?: number;
    /** React Hook Form field path that stores the keyboard's string value. */
    name: Path<TFieldValues>;
    /** Called after confirmation marks the field as touched, with the current form value. */
    onConfirm?: (value: string) => void;
    /** Called after one character is removed from the form value, with delete-source details. */
    onDelete?: (details: NumberKeyboardDeleteDetails) => void;
    /** Called after handling a key, with the raw input and its source details. */
    onInput?: (value: string, details: NumberKeyboardInputDetails) => void;
    /** Called after close requests mark touched; confirmation invokes `onConfirm` first. */
    onOpenChange?: (open: boolean, details: MeuFormNumberKeyboardOpenChangeDetails) => void;
    /** Controls keyboard visibility; omit to let the component manage it from `defaultOpen`. */
    open?: boolean;
    /** Content shown in the trigger when the form value renders empty. */
    placeholder?: ReactNode;
    /** Shows the required affordance; enforce required validation through `rules` when needed. */
    required?: boolean;
    /** React Hook Form validation and value-processing rules registered for this field. */
    rules?: UseControllerProps<TFieldValues, Path<TFieldValues>>["rules"];
    /** Produces the next form value from the current string, raw key input, and input details. */
    transformInput?: (
      currentValue: string,
      input: string,
      details: NumberKeyboardInputDetails
    ) => string;
    /**
     * Props forwarded to the trigger except managed state and ARIA wiring. Disabling either the
     * keyboard or trigger also omits the field from React Hook Form and native submissions.
     */
    triggerProps?: Omit<
      NumberKeyboardTriggerProps,
      "aria-controls" | "open" | "ref" | "status" | "value"
    >;
  };

function normalizeMaxLength(value: number | undefined) {
  if (value === undefined || !Number.isFinite(value)) return Number.POSITIVE_INFINITY;
  return Math.max(0, Math.floor(value));
}

function defaultTransformInput(
  currentValue: string,
  input: string,
  details: NumberKeyboardInputDetails
) {
  if (details.source === "decimal" && currentValue.indexOf(".") >= 0) return currentValue;
  return `${currentValue}${input}`;
}

/**
 * Binds number-key input, validation state, and trigger behavior to React Hook Form.
 *
 * @public
 */
export function MeuFormNumberKeyboard<TFieldValues extends FieldValues>({
  defaultOpen = false,
  description,
  formatValue,
  keyboardAriaLabel,
  keyboardTitle,
  label,
  maxLength,
  name,
  onConfirm,
  onDelete,
  onInput,
  onOpenChange,
  open,
  placeholder = "请输入",
  required = false,
  rules,
  transformInput = defaultTransformInput,
  triggerProps,
  ...keyboardProps
}: MeuFormNumberKeyboardProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>();
  const keyboardId = `meu-form-number-keyboard-${useId()}`;
  const controlledOpen = open !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const resolvedOpen = controlledOpen ? open : uncontrolledOpen;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const keyboardRef = useRef<HTMLDivElement>(null);
  const {
    disabled: triggerDisabled,
    onBlur: triggerOnBlur,
    onClick: triggerOnClick,
    ...resolvedTriggerProps
  } = triggerProps || {};
  const {
    disabled: keyboardDisabled,
    onBlur: keyboardOnBlur,
    ...resolvedKeyboardProps
  } = keyboardProps;
  const localDisabled = Boolean(triggerDisabled || keyboardDisabled);
  const { field, fieldState } = useController({
    control,
    disabled: localDisabled,
    name,
    ...(rules ? { rules } : {})
  });
  const touchedOpenCycleRef = useRef(false);
  useEffect(() => {
    if (resolvedOpen) touchedOpenCycleRef.current = false;
  }, [resolvedOpen]);
  const currentValue = typeof field.value === "string" ? field.value : "";
  const resolvedMaxLength = normalizeMaxLength(maxLength);
  const disabled = Boolean(field.disabled || localDisabled);
  const titleContent =
    keyboardTitle === undefined && typeof label === "string" ? label : keyboardTitle;
  const displayValue = formatValue ? formatValue(currentValue) : currentValue;

  function requestOpenChange(nextOpen: boolean, details: MeuFormNumberKeyboardOpenChangeDetails) {
    if (resolvedOpen === nextOpen) return;
    if (!controlledOpen) setUncontrolledOpen(nextOpen);
    if (!nextOpen) markOpenCycleTouched();
    if (onOpenChange) onOpenChange(nextOpen, details);
  }

  function markOpenCycleTouched() {
    if (touchedOpenCycleRef.current) return;
    touchedOpenCycleRef.current = true;
    field.onBlur();
  }

  function focusRemainsInComposite(nextTarget: EventTarget | null) {
    if (!(nextTarget instanceof Node)) return false;
    return Boolean(
      (triggerRef.current && triggerRef.current.contains(nextTarget)) ||
      (keyboardRef.current && keyboardRef.current.contains(nextTarget))
    );
  }

  return (
    <Field
      data-meu-form-field={field.name}
      label={label}
      description={description}
      required={required}
      error={fieldState.error ? fieldState.error.message : undefined}
    >
      <NumberKeyboardTrigger
        {...resolvedTriggerProps}
        ref={(node) => {
          triggerRef.current = node;
          field.ref(node);
        }}
        aria-controls={keyboardId}
        disabled={disabled}
        open={resolvedOpen}
        placeholder={placeholder}
        status={fieldState.invalid ? "error" : "default"}
        value={displayValue}
        onBlur={(event) => {
          if (!focusRemainsInComposite(event.relatedTarget)) field.onBlur();
          if (triggerOnBlur) triggerOnBlur(event);
        }}
        onClick={(event: MouseEvent<HTMLButtonElement>) => {
          if (triggerOnClick) triggerOnClick(event);
          if (!event.defaultPrevented) requestOpenChange(true, { reason: "trigger" });
        }}
      />
      <HiddenFormValues disabled={disabled} name={field.name} values={[currentValue]} />
      <NumberKeyboard
        {...resolvedKeyboardProps}
        ref={keyboardRef}
        {...(titleContent
          ? { title: titleContent }
          : { "aria-label": keyboardAriaLabel || "数字键盘" })}
        id={keyboardId}
        disabled={disabled}
        open={resolvedOpen}
        onBlur={(event) => {
          if (!focusRemainsInComposite(event.relatedTarget)) field.onBlur();
          if (keyboardOnBlur) keyboardOnBlur(event);
        }}
        onInput={(input, details) => {
          const transformed = transformInput(currentValue, input, details);
          const nextValue = transformed.slice(0, resolvedMaxLength);
          if (nextValue !== currentValue) field.onChange(nextValue);
          if (onInput) onInput(input, details);
        }}
        onDelete={(details) => {
          if (currentValue.length > 0) field.onChange(currentValue.slice(0, -1));
          if (onDelete) onDelete(details);
        }}
        onConfirm={() => {
          markOpenCycleTouched();
          if (onConfirm) onConfirm(currentValue);
        }}
        onOpenChange={(nextOpen, details) => requestOpenChange(nextOpen, details)}
      />
    </Field>
  );
}
