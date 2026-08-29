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
import { useEffect, useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { useController, useFormContext } from "react-hook-form";
import type { FieldValues, Path, UseControllerProps } from "react-hook-form";

import type { MeuFormDataSerialization } from "./adapter-types";
import { HiddenFormValues, serializeHiddenFormValues } from "./HiddenFormValues";

/**
 * Date picker props accepted after removing state managed by the form adapter.
 *
 * @public
 */
export type MeuFormDatePickerAdapterProps<TDate> = Omit<
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

/**
 * Props for a date picker whose confirmed value is stored in React Hook Form.
 *
 * @public
 */
export type MeuFormDatePickerProps<
  TFieldValues extends FieldValues,
  TDate = Date
> = MeuFormDatePickerAdapterProps<TDate> & {
  /** Initial popup state when `open` does not control the date picker. */
  defaultOpen?: boolean;
  /** Supporting content rendered with the field and associated with the picker trigger. */
  description?: ReactNode;
  /** Renders a valid form value in the trigger, with the active adapter and precision. */
  formatValue?: (
    value: TDate,
    details: { adapter: DateAdapter<TDate>; precision: DatePrecision }
  ) => ReactNode;
  /** Visible field label; also supplies the default popup title. */
  label?: ReactNode;
  /** React Hook Form field path that stores the selected date or `null`. */
  name: Path<TFieldValues>;
  /** Called when the user cancels without committing a new form value. */
  onCancel?: DatePickerProps<TDate>["onCancel"];
  /** Called after the confirmed date is written to the form. */
  onConfirm?: DatePickerProps<TDate>["onConfirm"];
  /** Called when popup visibility is requested to change, with the next state and reason. */
  onOpenChange?: (open: boolean, details: DatePickerOpenChangeDetails) => void;
  /** Controls popup visibility; omit to let the component manage it from `defaultOpen`. */
  open?: boolean;
  /** Accessible popup name used only when neither `pickerTitle` nor a label supplies a title. */
  pickerAriaLabel?: string;
  /** Popup heading; defaults to `label`, and suppresses the fallback accessible name. */
  pickerTitle?: ReactNode;
  /** Shows the required affordance; enforce required validation through `rules` when needed. */
  required?: boolean;
  /** React Hook Form validation and value-processing rules registered for this field. */
  rules?: UseControllerProps<TFieldValues, Path<TFieldValues>>["rules"];
  /**
   * Converts a valid selected date into native `FormData` values. The default uses the active
   * adapter and picker precision (for example, `2026-08-29` at day precision). Return an array
   * for repeated same-name entries; empty values omit the field. This callback must be synchronous;
   * thrown errors or accidental promise results safely omit the field.
   */
  serializeValue?: (
    value: TDate,
    details: { adapter: DateAdapter<TDate>; precision: DatePrecision }
  ) => MeuFormDataSerialization;
  /** Props forwarded to the trigger except state, value, status, and ref managed by this adapter. */
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

/**
 * Binds a date picker's confirmed value, validation state, and trigger to React Hook Form.
 *
 * @public
 */
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
  serializeValue,
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
  const touchedOpenCycleRef = useRef(false);
  useEffect(() => {
    if (resolvedOpen) touchedOpenCycleRef.current = false;
  }, [resolvedOpen]);
  const currentValue = (field.value === undefined ? null : field.value) as TDate | null;
  const currentValueIsValid = currentValue !== null && resolvedAdapter.isValid(currentValue);
  const formattedValue = currentValueIsValid
    ? formatValue
      ? formatValue(currentValue, { adapter: resolvedAdapter, precision })
      : resolvedAdapter.format(currentValue, formatPatterns[precision])
    : undefined;
  const serializedValues = currentValueIsValid
    ? serializeHiddenFormValues(() =>
        serializeValue
          ? serializeValue(currentValue, { adapter: resolvedAdapter, precision })
          : resolvedAdapter.format(currentValue, formatPatterns[precision])
      ).values
    : [];
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

  function markOpenCycleTouched() {
    if (touchedOpenCycleRef.current) return;
    touchedOpenCycleRef.current = true;
    field.onBlur();
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
          if (!resolvedOpen) field.onBlur();
          if (triggerOnBlur) triggerOnBlur(event);
        }}
        onClick={(event: MouseEvent<HTMLButtonElement>) => {
          if (triggerOnClick) triggerOnClick(event);
          if (!event.defaultPrevented) requestOpenChange(true, { reason: "trigger" });
        }}
      />
      <HiddenFormValues disabled={disabled} name={field.name} values={serializedValues} />
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
        onCancel={(details) => {
          markOpenCycleTouched();
          if (onCancel) onCancel(details);
        }}
        onConfirm={(nextValue) => {
          field.onChange(nextValue);
          markOpenCycleTouched();
          if (onConfirm) onConfirm(nextValue);
        }}
        onOpenChange={(nextOpen, details) => requestOpenChange(nextOpen, details)}
      />
    </Field>
  );
}
