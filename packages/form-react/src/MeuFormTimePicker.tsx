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
import { useEffect, useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { useController, useFormContext } from "react-hook-form";
import type { FieldPathByValue, FieldValues, UseControllerProps } from "react-hook-form";

import { HiddenFormValues } from "./HiddenFormValues";

/**
 * React Hook Form paths whose values can hold a structured time or an empty value.
 *
 * @public
 */
export type MeuTimePickerFieldPath<TFieldValues extends FieldValues> =
  | FieldPathByValue<TFieldValues, TimeValue>
  | FieldPathByValue<TFieldValues, TimeValue | null>
  | FieldPathByValue<TFieldValues, TimeValue | undefined>
  | FieldPathByValue<TFieldValues, TimeValue | null | undefined>;

/**
 * Time picker props accepted after removing state managed by the form adapter.
 *
 * @public
 */
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

/**
 * Props for a time picker whose confirmed `TimeValue` is stored in React Hook Form.
 *
 * @public
 */
export type MeuFormTimePickerProps<TFieldValues extends FieldValues> =
  MeuFormTimePickerAdapterProps & {
    /** Initial popup state when `open` does not control the time picker. */
    defaultOpen?: boolean;
    /** Supporting content rendered with the field and associated with the picker trigger. */
    description?: ReactNode;
    /** Renders a valid form value in the trigger with the active hour cycle and precision. */
    formatValue?: (
      value: TimeValue,
      details: { hourCycle: TimePickerHourCycle; precision: TimePickerPrecision }
    ) => ReactNode;
    /** Visible field label; also supplies the default popup title. */
    label?: ReactNode;
    /** Path of a React Hook Form field that stores a `TimeValue` or an empty value. */
    name: MeuTimePickerFieldPath<TFieldValues>;
    /** Called after cancellation marks the field touched without committing the draft time. */
    onCancel?: TimePickerProps["onCancel"];
    /** Called after the confirmed time is written and the field is marked touched. */
    onConfirm?: TimePickerProps["onConfirm"];
    /** Called last for a visibility request; close callbacks observe the updated touched state. */
    onOpenChange?: (open: boolean, details: TimePickerOpenChangeDetails) => void;
    /** Controls popup visibility; omit to let the component manage it from `defaultOpen`. */
    open?: boolean;
    /** Accessible popup name used only when neither `pickerTitle` nor a label supplies a title. */
    pickerAriaLabel?: string;
    /** Popup heading; defaults to `label`, and suppresses the fallback accessible name. */
    pickerTitle?: ReactNode;
    /** Shows the required affordance; enforce required validation through `rules` when needed. */
    required?: boolean;
    /** React Hook Form validation and value-processing rules registered for this field. */
    rules?: UseControllerProps<TFieldValues, MeuTimePickerFieldPath<TFieldValues>>["rules"];
    /** Props forwarded to the trigger except state, value, status, and ref managed by this adapter. */
    triggerProps?: Omit<PickerTriggerProps, "open" | "ref" | "status" | "value">;
  };

/**
 * Binds a time picker's confirmed value, validation state, and trigger to React Hook Form.
 *
 * @public
 */
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
  const touchedOpenCycleRef = useRef(false);
  useEffect(() => {
    if (resolvedOpen) touchedOpenCycleRef.current = false;
  }, [resolvedOpen]);
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
