"use client";

import { nativeDateAdapter } from "@meu/date-adapter";
import { DateRangePicker, Field, PickerTrigger } from "@meu/mobile";
import type {
  CalendarRange,
  DateAdapter,
  DateRangePickerOpenChangeDetails,
  DateRangePickerProps,
  PickerTriggerProps
} from "@meu/mobile";
import { useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { useController, useFormContext } from "react-hook-form";
import type { FieldPathByValue, FieldValues, UseControllerProps } from "react-hook-form";

type DateRangePickerAdapterProps<TDate> = Omit<
  DateRangePickerProps<TDate>,
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

type DateRangePickerFieldPath<TFieldValues extends FieldValues, TDate> =
  | FieldPathByValue<TFieldValues, CalendarRange<NoInfer<TDate>> | null>
  | FieldPathByValue<TFieldValues, CalendarRange<NoInfer<TDate>> | null | undefined>;

export type MeuFormDateRangePickerProps<
  TFieldValues extends FieldValues,
  TDate = Date
> = DateRangePickerAdapterProps<TDate> & {
  defaultOpen?: boolean;
  description?: ReactNode;
  formatValue?: (
    value: CalendarRange<TDate>,
    details: { adapter: DateAdapter<TDate> }
  ) => ReactNode;
  label?: ReactNode;
  name: DateRangePickerFieldPath<TFieldValues, TDate>;
  onCancel?: DateRangePickerProps<TDate>["onCancel"];
  onConfirm?: DateRangePickerProps<TDate>["onConfirm"];
  onOpenChange?: (open: boolean, details: DateRangePickerOpenChangeDetails) => void;
  open?: boolean;
  pickerAriaLabel?: string;
  pickerTitle?: ReactNode;
  required?: boolean;
  rules?: UseControllerProps<TFieldValues, DateRangePickerFieldPath<TFieldValues, TDate>>["rules"];
  triggerProps?: Omit<PickerTriggerProps, "open" | "ref" | "status" | "value">;
};

export function MeuFormDateRangePicker<TFieldValues extends FieldValues, TDate = Date>({
  adapter,
  defaultOpen = false,
  description,
  disabled: pickerDisabled,
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
}: MeuFormDateRangePickerProps<TFieldValues, TDate>) {
  const { control } = useFormContext<TFieldValues>();
  const controlledOpen = open !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const resolvedOpen = controlledOpen ? open : uncontrolledOpen;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const resolvedAdapter = (adapter || nativeDateAdapter) as DateAdapter<TDate>;
  const { field, fieldState } = useController<
    TFieldValues,
    DateRangePickerFieldPath<TFieldValues, TDate>
  >({
    control,
    name,
    ...(rules ? { rules } : {})
  });
  const currentValue = (
    Array.isArray(field.value) && field.value.length === 2 ? field.value : null
  ) as CalendarRange<TDate> | null;
  const formattedValue =
    currentValue !== null &&
    resolvedAdapter.isValid(currentValue[0]) &&
    resolvedAdapter.isValid(currentValue[1])
      ? formatValue
        ? formatValue(currentValue, { adapter: resolvedAdapter })
        : `${resolvedAdapter.format(currentValue[0], "YYYY-MM-DD")} – ${resolvedAdapter.format(
            currentValue[1],
            "YYYY-MM-DD"
          )}`
      : undefined;
  const {
    disabled: triggerDisabled,
    onBlur: triggerOnBlur,
    onClick: triggerOnClick,
    ...resolvedTriggerProps
  } = triggerProps || {};
  const disabled = Boolean(field.disabled || pickerDisabled || triggerDisabled);
  const titleContent = pickerTitle === undefined ? label : pickerTitle;
  const hasTitle = titleContent !== undefined && titleContent !== null && titleContent !== "";

  function requestOpenChange(nextOpen: boolean, details: DateRangePickerOpenChangeDetails) {
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
      <DateRangePicker<TDate>
        {...pickerProps}
        {...(hasTitle
          ? { title: titleContent }
          : { "aria-label": pickerAriaLabel || "Date Range Picker" })}
        adapter={resolvedAdapter}
        disabled={disabled}
        open={resolvedOpen}
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
