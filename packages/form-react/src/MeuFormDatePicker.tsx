"use client";

import { nativeDateAdapter } from "@meu/date-adapter";
import { DatePicker, Field, PickerTrigger } from "@meu/mobile";
import type {
  DateAdapter,
  DatePickerOpenChangeDetails,
  DatePickerProps,
  DatePrecision,
  PickerTriggerProps
} from "@meu/mobile";
import { useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { useController, useFormContext } from "react-hook-form";
import type { FieldValues, Path, UseControllerProps } from "react-hook-form";

type DatePickerAdapterProps<TDate> = Omit<
  DatePickerProps<TDate>,
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

export type MeuFormDatePickerProps<
  TFieldValues extends FieldValues,
  TDate = Date
> = DatePickerAdapterProps<TDate> & {
  defaultOpen?: boolean;
  description?: ReactNode;
  formatValue?: (
    value: TDate,
    details: { adapter: DateAdapter<TDate>; precision: DatePrecision }
  ) => ReactNode;
  label?: ReactNode;
  name: Path<TFieldValues>;
  onCancel?: DatePickerProps<TDate>["onCancel"];
  onConfirm?: DatePickerProps<TDate>["onConfirm"];
  onOpenChange?: (open: boolean, details: DatePickerOpenChangeDetails) => void;
  open?: boolean;
  pickerAriaLabel?: string;
  pickerTitle?: ReactNode;
  required?: boolean;
  rules?: UseControllerProps<TFieldValues, Path<TFieldValues>>["rules"];
  triggerProps?: Omit<PickerTriggerProps, "open" | "ref" | "status" | "value">;
};

const formatPatterns: Record<DatePrecision, string> = {
  day: "YYYY-MM-DD",
  hour: "YYYY-MM-DD HH",
  minute: "YYYY-MM-DD HH:mm",
  month: "YYYY-MM",
  second: "YYYY-MM-DD HH:mm:ss",
  year: "YYYY"
};

export function MeuFormDatePicker<TFieldValues extends FieldValues, TDate = Date>({
  adapter,
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
  precision = "day",
  required = false,
  rules,
  triggerProps,
  ...pickerProps
}: MeuFormDatePickerProps<TFieldValues, TDate>) {
  const { control } = useFormContext<TFieldValues>();
  const controlledOpen = open !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const resolvedOpen = controlledOpen ? open : uncontrolledOpen;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const resolvedAdapter = (adapter || nativeDateAdapter) as DateAdapter<TDate>;
  const { field, fieldState } = useController({
    control,
    name,
    ...(rules ? { rules } : {})
  });
  const currentValue = (field.value === undefined ? null : field.value) as TDate | null;
  const formattedValue =
    currentValue !== null && resolvedAdapter.isValid(currentValue)
      ? formatValue
        ? formatValue(currentValue, { adapter: resolvedAdapter, precision })
        : resolvedAdapter.format(currentValue, formatPatterns[precision])
      : undefined;
  const {
    disabled: triggerDisabled,
    onBlur: triggerOnBlur,
    onClick: triggerOnClick,
    ...resolvedTriggerProps
  } = triggerProps || {};
  const disabled = Boolean(field.disabled || triggerDisabled);
  const titleContent = pickerTitle === undefined ? label : pickerTitle;
  const hasTitle = titleContent !== undefined && titleContent !== null && titleContent !== "";

  function requestOpenChange(nextOpen: boolean, details: DatePickerOpenChangeDetails) {
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
      <DatePicker<TDate>
        {...pickerProps}
        {...(hasTitle
          ? { title: titleContent }
          : { "aria-label": pickerAriaLabel || "Date Picker" })}
        adapter={resolvedAdapter}
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
