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

/**
 * Date range picker props accepted after removing state managed by the form adapter.
 *
 * @public
 */
export type MeuFormDateRangePickerAdapterProps<TDate> = Omit<
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

/**
 * React Hook Form paths whose values can hold a two-date range or an empty value.
 *
 * @public
 */
export type MeuDateRangePickerFieldPath<TFieldValues extends FieldValues, TDate> =
  | FieldPathByValue<TFieldValues, CalendarRange<NoInfer<TDate>> | null>
  | FieldPathByValue<TFieldValues, CalendarRange<NoInfer<TDate>> | null | undefined>;

/**
 * Props for a date range picker whose confirmed range is stored in React Hook Form.
 *
 * @public
 */
export type MeuFormDateRangePickerProps<
  TFieldValues extends FieldValues,
  TDate = Date
> = MeuFormDateRangePickerAdapterProps<TDate> & {
  /** Initial popup state when `open` does not control the range picker. */
  defaultOpen?: boolean;
  /** Supporting content rendered with the field and associated with the picker trigger. */
  description?: ReactNode;
  /** Renders a valid two-date form value in the trigger with the active date adapter. */
  formatValue?: (
    value: CalendarRange<TDate>,
    details: { adapter: DateAdapter<TDate> }
  ) => ReactNode;
  /** Visible field label; also supplies the default popup title. */
  label?: ReactNode;
  /** Path of a React Hook Form field that stores a date pair or `null`. */
  name: MeuDateRangePickerFieldPath<TFieldValues, TDate>;
  /** Called when the user cancels without committing a new form value. */
  onCancel?: DateRangePickerProps<TDate>["onCancel"];
  /** Called after the confirmed date pair is written to the form. */
  onConfirm?: DateRangePickerProps<TDate>["onConfirm"];
  /** Called when popup visibility is requested to change, with the next state and reason. */
  onOpenChange?: (open: boolean, details: DateRangePickerOpenChangeDetails) => void;
  /** Controls popup visibility; omit to let the component manage it from `defaultOpen`. */
  open?: boolean;
  /** Accessible popup name used only when neither `pickerTitle` nor a label supplies a title. */
  pickerAriaLabel?: string;
  /** Popup heading; defaults to `label`, and suppresses the fallback accessible name. */
  pickerTitle?: ReactNode;
  /** Shows the required affordance; enforce required validation through `rules` when needed. */
  required?: boolean;
  /** React Hook Form validation and value-processing rules registered for the date range. */
  rules?: UseControllerProps<
    TFieldValues,
    MeuDateRangePickerFieldPath<TFieldValues, TDate>
  >["rules"];
  /** Props forwarded to the trigger except state, value, status, and ref managed by this adapter. */
  triggerProps?: Omit<PickerTriggerProps, "open" | "ref" | "status" | "value">;
};

/**
 * Binds a date range picker's confirmed value, validation state, and trigger to React Hook Form.
 *
 * @public
 */
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
    MeuDateRangePickerFieldPath<TFieldValues, TDate>
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
