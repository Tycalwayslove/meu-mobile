"use client";

import { Field, NumberKeyboard, NumberKeyboardTrigger } from "@meu/mobile";
import { useId, useRef, useState } from "react";
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

type NumberKeyboardAdapterProps = Omit<
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

export type MeuFormNumberKeyboardOpenChangeDetails =
  | NumberKeyboardOpenChangeDetails
  | { reason: "trigger" };

export type MeuFormNumberKeyboardProps<TFieldValues extends FieldValues> =
  NumberKeyboardAdapterProps & {
    defaultOpen?: boolean;
    description?: ReactNode;
    formatValue?: (value: string) => ReactNode;
    keyboardAriaLabel?: string;
    keyboardTitle?: string;
    label?: ReactNode;
    maxLength?: number;
    name: Path<TFieldValues>;
    onConfirm?: (value: string) => void;
    onDelete?: (details: NumberKeyboardDeleteDetails) => void;
    onInput?: (value: string, details: NumberKeyboardInputDetails) => void;
    onOpenChange?: (open: boolean, details: MeuFormNumberKeyboardOpenChangeDetails) => void;
    open?: boolean;
    placeholder?: ReactNode;
    required?: boolean;
    rules?: UseControllerProps<TFieldValues, Path<TFieldValues>>["rules"];
    transformInput?: (
      currentValue: string,
      input: string,
      details: NumberKeyboardInputDetails
    ) => string;
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
  const { field, fieldState } = useController({
    control,
    name,
    ...(rules ? { rules } : {})
  });
  const currentValue = typeof field.value === "string" ? field.value : "";
  const resolvedMaxLength = normalizeMaxLength(maxLength);
  const {
    disabled: triggerDisabled,
    onBlur: triggerOnBlur,
    onClick: triggerOnClick,
    ...resolvedTriggerProps
  } = triggerProps || {};
  const disabled = Boolean(field.disabled || triggerDisabled || keyboardProps.disabled);
  const titleContent = keyboardTitle === undefined && typeof label === "string" ? label : keyboardTitle;
  const displayValue = formatValue ? formatValue(currentValue) : currentValue;

  function requestOpenChange(
    nextOpen: boolean,
    details: MeuFormNumberKeyboardOpenChangeDetails
  ) {
    if (resolvedOpen === nextOpen) return;
    if (!controlledOpen) setUncontrolledOpen(nextOpen);
    if (!nextOpen) field.onBlur();
    if (onOpenChange) onOpenChange(nextOpen, details);
  }

  return (
    <Field
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
        aria-required={required || undefined}
        disabled={disabled}
        open={resolvedOpen}
        placeholder={placeholder}
        status={fieldState.invalid ? "error" : "default"}
        value={displayValue}
        onBlur={(event) => {
          field.onBlur();
          if (triggerOnBlur) triggerOnBlur(event);
        }}
        onClick={(event: MouseEvent<HTMLButtonElement>) => {
          if (triggerOnClick) triggerOnClick(event);
          if (!event.defaultPrevented) requestOpenChange(true, { reason: "trigger" });
        }}
      />
      <NumberKeyboard
        {...keyboardProps}
        {...(titleContent ? { title: titleContent } : { "aria-label": keyboardAriaLabel || "数字键盘" })}
        id={keyboardId}
        disabled={disabled}
        open={resolvedOpen}
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
          field.onBlur();
          if (onConfirm) onConfirm(currentValue);
        }}
        onOpenChange={(nextOpen, details) => requestOpenChange(nextOpen, details)}
      />
    </Field>
  );
}
