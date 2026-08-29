"use client";

import { Field, Picker, PickerTrigger } from "@meu/mobile";
import type {
  PickerOpenChangeDetails,
  PickerOption,
  PickerProps,
  PickerTriggerProps,
  PickerValue
} from "@meu/mobile";
import { useEffect, useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { useController, useFormContext } from "react-hook-form";
import type { FieldValues, Path, UseControllerProps } from "react-hook-form";

import { HiddenFormValues } from "./HiddenFormValues";

/**
 * Picker props accepted after removing state managed by the form adapter.
 *
 * @public
 */
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

/**
 * Props for a column picker whose confirmed values are stored in React Hook Form.
 *
 * @public
 */
export type MeuFormPickerProps<
  TFieldValues extends FieldValues,
  TValue extends PickerValue = PickerValue
> = MeuFormPickerAdapterProps<TValue> & {
  /** Initial popup state when `open` does not control the picker. */
  defaultOpen?: boolean;
  /** Supporting content rendered with the field and associated with the picker trigger. */
  description?: ReactNode;
  /** Renders the trigger value from the controlled form value and resolved options. */
  formatValue?: (
    value: ReadonlyArray<TValue | null>,
    options: ReadonlyArray<PickerOption<TValue> | null>
  ) => ReactNode;
  /** Visible field label; also supplies the default popup title. */
  label?: ReactNode;
  /** React Hook Form field path that stores one value per picker column. */
  name: Path<TFieldValues>;
  /** Called after cancellation marks the field touched without committing the draft value. */
  onCancel?: PickerProps<TValue>["onCancel"];
  /** Called after confirmed values are written and the field is marked touched. */
  onConfirm?: PickerProps<TValue>["onConfirm"];
  /** Called last for a visibility request; close callbacks observe the updated touched state. */
  onOpenChange?: (open: boolean, details: PickerOpenChangeDetails) => void;
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
   * Props forwarded to the trigger except managed state. Disabling the trigger also omits the
   * field from React Hook Form and native submissions.
   */
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

/**
 * Binds a picker's confirmed values, validation state, and trigger to React Hook Form.
 *
 * @public
 */
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
  const {
    disabled: triggerDisabled,
    onBlur: triggerOnBlur,
    onClick: triggerOnClick,
    ...resolvedTriggerProps
  } = triggerProps || {};
  const localDisabled = Boolean(triggerDisabled);
  const { field, fieldState } = useController({
    control,
    disabled: localDisabled,
    name,
    ...(rules ? { rules } : {})
  });
  const touchedOpenCycleRef = useRef(false);
  useEffect(() => {
    if (resolvedOpen) touchedOpenCycleRef.current = false;
  }, [resolvedOpen]);
  const currentValue = Array.isArray(field.value) ? (field.value as Array<TValue | null>) : [];
  const selectedOptions = pickerProps.columns.map((column, index) =>
    optionForValue(column, currentValue[index])
  );
  const formattedValue = formatValue
    ? formatValue(currentValue, selectedOptions)
    : defaultFormattedValue(selectedOptions);
  const disabled = Boolean(field.disabled || localDisabled);
  const titleContent = pickerTitle === undefined ? label : pickerTitle;
  const hasTitle = titleContent !== undefined && titleContent !== null && titleContent !== "";

  function requestOpenChange(nextOpen: boolean, details: PickerOpenChangeDetails) {
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
      data-meu-form-field={field.name}
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
        onCancel={(details) => {
          markOpenCycleTouched();
          if (onCancel) onCancel(details);
        }}
        onConfirm={(nextValue, options) => {
          field.onChange(nextValue);
          markOpenCycleTouched();
          if (onConfirm) onConfirm(nextValue, options);
        }}
        onOpenChange={(nextOpen, details) => {
          requestOpenChange(nextOpen, details);
        }}
      />
    </Field>
  );
}
