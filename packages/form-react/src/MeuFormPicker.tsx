"use client";

import { Field, Picker, PickerTrigger } from "@meu/mobile";
import type {
  PickerOpenChangeDetails,
  PickerOption,
  PickerProps,
  PickerTriggerProps,
  PickerValue
} from "@meu/mobile";
import { useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { useController, useFormContext } from "react-hook-form";
import type { FieldValues, Path, UseControllerProps } from "react-hook-form";

import { HiddenFormValues } from "./HiddenFormValues";

export type MeuFormPickerAdapterProps<TValue extends PickerValue> = Omit<
  PickerProps<TValue>,
  | "aria-label"
  | "aria-labelledby"
  | "defaultOpen"
  | "defaultValue"
  | "onCancel"
  | "onConfirm"
  | "onOpenChange"
  | "open"
  | "ref"
  | "returnFocusRef"
  | "title"
  | "value"
>;

export type MeuFormPickerProps<
  TFieldValues extends FieldValues,
  TValue extends PickerValue = PickerValue
> = MeuFormPickerAdapterProps<TValue> & {
  defaultOpen?: boolean;
  description?: ReactNode;
  formatValue?: (
    value: ReadonlyArray<TValue | null>,
    options: ReadonlyArray<PickerOption<TValue> | null>
  ) => ReactNode;
  label?: ReactNode;
  name: Path<TFieldValues>;
  onCancel?: PickerProps<TValue>["onCancel"];
  onConfirm?: PickerProps<TValue>["onConfirm"];
  onOpenChange?: (open: boolean, details: PickerOpenChangeDetails) => void;
  open?: boolean;
  pickerAriaLabel?: string;
  pickerTitle?: ReactNode;
  required?: boolean;
  rules?: UseControllerProps<TFieldValues, Path<TFieldValues>>["rules"];
  triggerProps?: Omit<PickerTriggerProps, "open" | "ref" | "status" | "value">;
};

function optionForValue<TValue extends PickerValue>(
  options: ReadonlyArray<PickerOption<TValue>>,
  value: TValue | null | undefined
) {
  if (value === null || value === undefined) return null;
  return options.find((option) => !option.disabled && option.value === value) || null;
}

function defaultFormattedValue<TValue extends PickerValue>(
  options: ReadonlyArray<PickerOption<TValue> | null>
) {
  const selected = options.filter((option): option is PickerOption<TValue> => option !== null);
  if (selected.length === 0) return undefined;
  return selected.map((option, index) => (
    <span key={`${typeof option.value}-${String(option.value)}-${index}`}>
      {index === 0 ? null : " / "}
      {option.label}
    </span>
  ));
}

export function MeuFormPicker<
  TFieldValues extends FieldValues,
  TValue extends PickerValue = PickerValue
>({
  defaultOpen = false,
  description,
  formatValue,
  label,
  name,
  onCancel,
  onConfirm,
  onOpenChange,
  open,
  pickerAriaLabel,
  pickerTitle,
  required = false,
  rules,
  triggerProps,
  ...pickerProps
}: MeuFormPickerProps<TFieldValues, TValue>) {
  const { control } = useFormContext<TFieldValues>();
  const controlledOpen = open !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const resolvedOpen = controlledOpen ? open : uncontrolledOpen;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { field, fieldState } = useController({
    control,
    name,
    ...(rules ? { rules } : {})
  });
  const currentValue = Array.isArray(field.value) ? (field.value as Array<TValue | null>) : [];
  const selectedOptions = pickerProps.columns.map((column, index) =>
    optionForValue(column, currentValue[index])
  );
  const formattedValue = formatValue
    ? formatValue(currentValue, selectedOptions)
    : defaultFormattedValue(selectedOptions);
  const {
    disabled: triggerDisabled,
    onBlur: triggerOnBlur,
    onClick: triggerOnClick,
    ...resolvedTriggerProps
  } = triggerProps || {};
  const disabled = Boolean(field.disabled || triggerDisabled);
  const titleContent = pickerTitle === undefined ? label : pickerTitle;
  const hasTitle = titleContent !== undefined && titleContent !== null && titleContent !== "";

  function requestOpenChange(nextOpen: boolean, details: PickerOpenChangeDetails) {
    if (resolvedOpen === nextOpen) return;
    if (!controlledOpen) setUncontrolledOpen(nextOpen);
    if (onOpenChange) onOpenChange(nextOpen, details);
  }

  return (
    <Field
      label={label}
      description={description}
      required={required}
      error={fieldState.error ? fieldState.error.message : undefined}
    >
      <PickerTrigger
        {...resolvedTriggerProps}
        ref={(node) => {
          triggerRef.current = node;
          field.ref(node);
        }}
        disabled={disabled}
        open={resolvedOpen}
        status={fieldState.invalid ? "error" : "default"}
        value={formattedValue}
        onBlur={(event) => {
          field.onBlur();
          if (triggerOnBlur) triggerOnBlur(event);
        }}
        onClick={(event: MouseEvent<HTMLButtonElement>) => {
          if (triggerOnClick) triggerOnClick(event);
          if (!event.defaultPrevented) {
            requestOpenChange(true, { reason: "trigger" });
          }
        }}
      />
      <HiddenFormValues disabled={disabled} name={field.name} values={currentValue} />
      <Picker<TValue>
        {...pickerProps}
        {...(hasTitle ? { title: titleContent } : { "aria-label": pickerAriaLabel || "Picker" })}
        open={resolvedOpen}
        returnFocusRef={triggerRef}
        value={currentValue}
        {...(onCancel ? { onCancel } : {})}
        onConfirm={(nextValue, options) => {
          field.onChange(nextValue);
          if (onConfirm) onConfirm(nextValue, options);
        }}
        onOpenChange={(nextOpen, details) => {
          requestOpenChange(nextOpen, details);
        }}
      />
    </Field>
  );
}
