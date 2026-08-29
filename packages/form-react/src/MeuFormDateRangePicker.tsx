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
import { useEffect, useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { useController, useFormContext } from "react-hook-form";
import type { FieldPathByValue, FieldValues, UseControllerProps } from "react-hook-form";

import type { MeuFormDataSerialization } from "./adapter-types";
import { HiddenFormValues, serializeHiddenFormValues } from "./HiddenFormValues";

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
  /**
   * Converts a complete valid range into native `FormData` values. By default the start and end
   * are emitted as two `YYYY-MM-DD` entries with the same name, so use `FormData.getAll(name)` on
   * the server. Return a scalar for a single-entry backend contract. This callback is synchronous;
   * thrown errors or accidental promise results safely omit the field.
   */
  serializeValue?: (
    value: CalendarRange<TDate>,
    details: { adapter: DateAdapter<TDate> }
  ) => MeuFormDataSerialization;
  /**
   * Props forwarded to the trigger except managed state. Disabling either the picker or trigger
   * also omits the field from React Hook Form and native submissions.
   */
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
  serializeValue,
  triggerProps,
  ...pickerProps
}: MeuFormDateRangePickerProps<TFieldValues, TDate>) {
  const { control } = useFormContext<TFieldValues>();
  const controlledOpen = open !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const resolvedOpen = controlledOpen ? open : uncontrolledOpen;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const resolvedAdapter = (adapter || nativeDateAdapter) as DateAdapter<TDate>;
  const {
    disabled: triggerDisabled,
    onBlur: triggerOnBlur,
    onClick: triggerOnClick,
    ...resolvedTriggerProps
  } = triggerProps || {};
  const localDisabled = Boolean(pickerDisabled || triggerDisabled);
  const { field, fieldState } = useController<
    TFieldValues,
    MeuDateRangePickerFieldPath<TFieldValues, TDate>
  >({
    control,
    disabled: localDisabled,
    name,
    ...(rules ? { rules } : {})
  });
  const touchedOpenCycleRef = useRef(false);
  useEffect(() => {
    if (resolvedOpen) touchedOpenCycleRef.current = false;
  }, [resolvedOpen]);
  const currentValue = (
    Array.isArray(field.value) && field.value.length === 2 ? field.value : null
  ) as CalendarRange<TDate> | null;
  const currentValueIsValid =
    currentValue !== null &&
    resolvedAdapter.isValid(currentValue[0]) &&
    resolvedAdapter.isValid(currentValue[1]);
  const formattedValue = currentValueIsValid
    ? formatValue
      ? formatValue(currentValue, { adapter: resolvedAdapter })
      : `${resolvedAdapter.format(currentValue[0], "YYYY-MM-DD")} – ${resolvedAdapter.format(
          currentValue[1],
          "YYYY-MM-DD"
        )}`
    : undefined;
  const serializedValues = currentValueIsValid
    ? serializeHiddenFormValues(() =>
        serializeValue
          ? serializeValue(currentValue, { adapter: resolvedAdapter })
          : currentValue.map((value) => resolvedAdapter.format(value, "YYYY-MM-DD"))
      ).values
    : [];
  const disabled = Boolean(field.disabled || localDisabled);
  const titleContent = pickerTitle === undefined ? label : pickerTitle;
  const hasTitle = titleContent !== undefined && titleContent !== null && titleContent !== "";

  function requestOpenChange(nextOpen: boolean, details: DateRangePickerOpenChangeDetails) {
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
