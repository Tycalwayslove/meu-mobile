"use client";

import { CascadePicker, Field, PickerTrigger } from "@meu/mobile";
import type {
  CascadePickerOption,
  CascadePickerProps,
  PickerOpenChangeDetails,
  PickerTriggerProps,
  PickerValue
} from "@meu/mobile";
import { useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { useController, useFormContext } from "react-hook-form";
import type { FieldValues, Path, UseControllerProps } from "react-hook-form";

type CascadePickerAdapterProps<TValue extends PickerValue> = Omit<
  CascadePickerProps<TValue>,
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

export type MeuFormCascadePickerProps<
  TFieldValues extends FieldValues,
  TValue extends PickerValue = PickerValue
> = CascadePickerAdapterProps<TValue> & {
  defaultOpen?: boolean;
  description?: ReactNode;
  formatValue?: (
    value: ReadonlyArray<TValue | null>,
    options: ReadonlyArray<CascadePickerOption<TValue> | null>
  ) => ReactNode;
  label?: ReactNode;
  name: Path<TFieldValues>;
  onCancel?: CascadePickerProps<TValue>["onCancel"];
  onConfirm?: CascadePickerProps<TValue>["onConfirm"];
  onOpenChange?: (open: boolean, details: PickerOpenChangeDetails) => void;
  open?: boolean;
  pickerAriaLabel?: string;
  pickerTitle?: ReactNode;
  required?: boolean;
  rules?: UseControllerProps<TFieldValues, Path<TFieldValues>>["rules"];
  triggerProps?: Omit<PickerTriggerProps, "open" | "ref" | "status" | "value">;
};

function optionsForValue<TValue extends PickerValue>(
  rootOptions: ReadonlyArray<CascadePickerOption<TValue>>,
  value: ReadonlyArray<TValue | null>
) {
  const selectedOptions: Array<CascadePickerOption<TValue> | null> = [];
  let currentOptions = rootOptions;

  value.forEach((segment) => {
    const selected =
      segment === null
        ? null
        : currentOptions.find((option) => !option.disabled && option.value === segment) || null;
    selectedOptions.push(selected);
    currentOptions = selected && selected.children ? selected.children : [];
  });

  return selectedOptions;
}

function defaultFormattedValue<TValue extends PickerValue>(
  options: ReadonlyArray<CascadePickerOption<TValue> | null>
) {
  const selected = options.filter(
    (option): option is CascadePickerOption<TValue> => option !== null
  );
  if (selected.length === 0) return undefined;
  return selected.map((option, index) => (
    <span key={`${typeof option.value}-${String(option.value)}-${index}`}>
      {index === 0 ? null : " / "}
      {option.label}
    </span>
  ));
}

export function MeuFormCascadePicker<
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
}: MeuFormCascadePickerProps<TFieldValues, TValue>) {
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
  const selectedOptions = optionsForValue(pickerProps.options, currentValue);
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
        aria-required={required || undefined}
        status={fieldState.invalid ? "error" : "default"}
        value={formattedValue}
        onBlur={(event) => {
          field.onBlur();
          if (triggerOnBlur) triggerOnBlur(event);
        }}
        onClick={(event: MouseEvent<HTMLButtonElement>) => {
          if (triggerOnClick) triggerOnClick(event);
          if (!event.defaultPrevented) requestOpenChange(true, { reason: "trigger" });
        }}
      />
      <CascadePicker<TValue>
        {...pickerProps}
        {...(hasTitle
          ? { title: titleContent }
          : { "aria-label": pickerAriaLabel || "Cascade Picker" })}
        open={resolvedOpen}
        returnFocusRef={triggerRef}
        value={currentValue}
        {...(onCancel ? { onCancel } : {})}
        onConfirm={(nextValue, options) => {
          field.onChange(nextValue);
          if (onConfirm) onConfirm(nextValue, options);
        }}
        onOpenChange={(nextOpen, details) => requestOpenChange(nextOpen, details)}
      />
    </Field>
  );
}
