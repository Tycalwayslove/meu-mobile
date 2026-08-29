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

import { HiddenFormValues } from "./HiddenFormValues";

/**
 * Cascade picker props accepted after removing state managed by the form adapter.
 *
 * @public
 */
export type MeuFormCascadePickerAdapterProps<TValue extends PickerValue> = Omit<
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

/**
 * Props for a cascade picker whose selected path is stored in React Hook Form.
 *
 * @public
 */
export type MeuFormCascadePickerProps<
  TFieldValues extends FieldValues,
  TValue extends PickerValue = PickerValue
> = MeuFormCascadePickerAdapterProps<TValue> & {
  /** Initial popup state when `open` does not control the picker. */
  defaultOpen?: boolean;
  /** Supporting content rendered with the field and associated with the picker trigger. */
  description?: ReactNode;
  /** Renders the trigger value from the controlled path and its resolved options. */
  formatValue?: (
    value: ReadonlyArray<TValue | null>,
    options: ReadonlyArray<CascadePickerOption<TValue> | null>
  ) => ReactNode;
  /** Visible field label; also supplies the default popup title. */
  label?: ReactNode;
  /** React Hook Form field path that stores the selected cascade path. */
  name: Path<TFieldValues>;
  /** Called when the user cancels without committing a new form value. */
  onCancel?: CascadePickerProps<TValue>["onCancel"];
  /** Called after the confirmed path is written to the form, with its resolved options. */
  onConfirm?: CascadePickerProps<TValue>["onConfirm"];
  /** Called when popup visibility is requested to change, with the next state and reason. */
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
  /** Props forwarded to the trigger except state, value, status, and ref managed by this adapter. */
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

/**
 * Binds a cascade picker's confirmed path, validation state, and trigger to React Hook Form.
 *
 * @public
 */
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
      <HiddenFormValues disabled={disabled} name={field.name} values={currentValue} />
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
