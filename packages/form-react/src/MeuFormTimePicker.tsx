"use client";

import { Field, formatTimeValue, isValidTimeValue, PickerTrigger, TimePicker } from "@meu/mobile";
import type {
  PickerTriggerProps,
  TimePickerHourCycle,
  TimePickerOpenChangeDetails,
  TimePickerPrecision,
  TimePickerProps,
  TimeValue
} from "@meu/mobile";
import { useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { useController, useFormContext } from "react-hook-form";
import type { FieldPathByValue, FieldValues, UseControllerProps } from "react-hook-form";

import { HiddenFormValues } from "./HiddenFormValues";

export type MeuTimePickerFieldPath<TFieldValues extends FieldValues> =
  | FieldPathByValue<TFieldValues, TimeValue>
  | FieldPathByValue<TFieldValues, TimeValue | null>
  | FieldPathByValue<TFieldValues, TimeValue | undefined>
  | FieldPathByValue<TFieldValues, TimeValue | null | undefined>;

export type MeuFormTimePickerAdapterProps = Omit<
  TimePickerProps,
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

export type MeuFormTimePickerProps<TFieldValues extends FieldValues> =
  MeuFormTimePickerAdapterProps & {
    defaultOpen?: boolean;
    description?: ReactNode;
    formatValue?: (
      value: TimeValue,
      details: { hourCycle: TimePickerHourCycle; precision: TimePickerPrecision }
    ) => ReactNode;
    label?: ReactNode;
    name: MeuTimePickerFieldPath<TFieldValues>;
    onCancel?: TimePickerProps["onCancel"];
    onConfirm?: TimePickerProps["onConfirm"];
    onOpenChange?: (open: boolean, details: TimePickerOpenChangeDetails) => void;
    open?: boolean;
    pickerAriaLabel?: string;
    pickerTitle?: ReactNode;
    required?: boolean;
    rules?: UseControllerProps<TFieldValues, MeuTimePickerFieldPath<TFieldValues>>["rules"];
    triggerProps?: Omit<PickerTriggerProps, "open" | "ref" | "status" | "value">;
  };

export function MeuFormTimePicker<TFieldValues extends FieldValues>({
  defaultOpen = false,
  description,
  formatValue,
  hourCycle = "h23",
  label,
  name,
  onCancel,
  onConfirm,
  onOpenChange,
  open,
  pickerAriaLabel,
  pickerTitle,
  precision = "minute",
  required = false,
  rules,
  triggerProps,
  ...pickerProps
}: MeuFormTimePickerProps<TFieldValues>) {
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
  const currentValue = (field.value === undefined ? null : field.value) as TimeValue | null;
  const formattedValue =
    currentValue !== null && isValidTimeValue(currentValue)
      ? formatValue
        ? formatValue(currentValue, { hourCycle, precision })
        : formatTimeValue(currentValue, { hourCycle, precision })
      : undefined;
  const serializedValue =
    currentValue !== null && isValidTimeValue(currentValue)
      ? formatTimeValue(currentValue, { hourCycle: "h23", precision })
      : null;
  const {
    disabled: triggerDisabled,
    onBlur: triggerOnBlur,
    onClick: triggerOnClick,
    ...resolvedTriggerProps
  } = triggerProps || {};
  const disabled = Boolean(field.disabled || triggerDisabled);
  const titleContent = pickerTitle === undefined ? label : pickerTitle;
  const hasTitle = titleContent !== undefined && titleContent !== null && titleContent !== "";

  function requestOpenChange(nextOpen: boolean, details: TimePickerOpenChangeDetails) {
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
          if (!event.defaultPrevented) requestOpenChange(true, { reason: "trigger" });
        }}
      />
      <HiddenFormValues disabled={disabled} name={field.name} values={[serializedValue]} />
      <TimePicker
        {...pickerProps}
        {...(hasTitle
          ? { title: titleContent }
          : { "aria-label": pickerAriaLabel || "Time Picker" })}
        hourCycle={hourCycle}
        open={resolvedOpen}
        precision={precision}
        returnFocusRef={triggerRef}
        value={currentValue}
        {...(onCancel ? { onCancel } : {})}
        onConfirm={(nextValue) => {
          field.onChange(nextValue);
          if (onConfirm) onConfirm(nextValue);
        }}
        onOpenChange={(nextOpen, details) => requestOpenChange(nextOpen, details)}
      />
    </Field>
  );
}
