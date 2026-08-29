"use client";

import { Field, PickerTrigger, TreeSelect } from "@meu/mobile";
import type {
  PickerTriggerProps,
  TreeSelectOpenChangeReason,
  TreeSelectOption,
  TreeSelectProps,
  TreeSelectValue
} from "@meu/mobile";
import { useEffect, useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { useController, useFormContext } from "react-hook-form";
import type { FieldValues, Path, UseControllerProps } from "react-hook-form";

import { HiddenFormValues } from "./HiddenFormValues";

/**
 * Tree selector props accepted after removing state managed by the form adapter.
 *
 * @public
 */
export type MeuFormTreeSelectAdapterProps<TValue extends TreeSelectValue> = Omit<
  TreeSelectProps<TValue>,
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
 * Props for a tree selector whose confirmed values are stored in React Hook Form.
 *
 * @public
 */
export type MeuFormTreeSelectProps<
  TFieldValues extends FieldValues,
  TValue extends TreeSelectValue = TreeSelectValue
> = MeuFormTreeSelectAdapterProps<TValue> & {
  /** Initial popup state when `open` does not control the tree selector. */
  defaultOpen?: boolean;
  /** Supporting content rendered with the field and associated with the picker trigger. */
  description?: ReactNode;
  /** Renders the trigger value from selected form values and their resolved tree options. */
  formatValue?: (
    value: ReadonlyArray<TValue>,
    options: ReadonlyArray<TreeSelectOption<TValue>>
  ) => ReactNode;
  /** Visible field label; also supplies the default popup title. */
  label?: ReactNode;
  /** React Hook Form field path that stores the selected tree values. */
  name: Path<TFieldValues>;
  /** Called after cancellation marks the field touched without committing the draft values. */
  onCancel?: TreeSelectProps<TValue>["onCancel"];
  /** Called after confirmation marks the field touched; read-only mode skips form value updates. */
  onConfirm?: TreeSelectProps<TValue>["onConfirm"];
  /** Called last for a visibility request; close callbacks observe the updated touched state. */
  onOpenChange?: (open: boolean, details: { reason: TreeSelectOpenChangeReason }) => void;
  /** Controls popup visibility; omit to let the component manage it from `defaultOpen`. */
  open?: boolean;
  /** Shows the required affordance; enforce required validation through `rules` when needed. */
  required?: boolean;
  /** React Hook Form validation and value-processing rules registered for this field. */
  rules?: UseControllerProps<TFieldValues, Path<TFieldValues>>["rules"];
  /** Accessible name for the tree itself, independent of the popup's title. */
  treeAriaLabel?: string;
  /** Popup heading; defaults to `label`, with `treeAriaLabel` used when no heading is present. */
  treeTitle?: ReactNode;
  /**
   * Props forwarded to the trigger except managed state. Disabling either the tree or trigger
   * also omits the field from React Hook Form and native submissions.
   */
  triggerProps?: Omit<PickerTriggerProps, "open" | "ref" | "status" | "value">;
};

function collectOptions<TValue extends TreeSelectValue>(
  options: ReadonlyArray<TreeSelectOption<TValue>>,
  result = new Map<TValue, TreeSelectOption<TValue>>()
) {
  options.forEach((option) => {
    if (result.has(option.value)) return;
    result.set(option.value, option);
    if (option.children) collectOptions(option.children, result);
  });
  return result;
}

function defaultFormattedValue<TValue extends TreeSelectValue>(
  options: ReadonlyArray<TreeSelectOption<TValue>>
) {
  if (options.length === 0) return undefined;
  return options.map((option, index) => (
    <span key={`${typeof option.value}-${String(option.value)}`}>
      {index === 0 ? null : "、"}
      {option.label}
    </span>
  ));
}

/**
 * Binds a tree selector's confirmed values, validation state, and trigger to React Hook Form.
 *
 * @public
 */
export function MeuFormTreeSelect<
  TFieldValues extends FieldValues,
  TValue extends TreeSelectValue = TreeSelectValue
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
  readOnly = false,
  required = false,
  rules,
  treeAriaLabel,
  treeTitle,
  triggerProps,
  ...treeSelectProps
}: MeuFormTreeSelectProps<TFieldValues, TValue>) {
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
  const localDisabled = Boolean(triggerDisabled || treeSelectProps.disabled);
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
  const currentValue = Array.isArray(field.value) ? (field.value as TValue[]) : [];
  const optionRegistry = collectOptions(treeSelectProps.options);
  const selectedOptions = currentValue
    .map((item) => optionRegistry.get(item))
    .filter((item): item is TreeSelectOption<TValue> => item !== undefined);
  const formattedValue = formatValue
    ? formatValue(currentValue, selectedOptions)
    : defaultFormattedValue(selectedOptions);
  const disabled = Boolean(field.disabled || localDisabled);
  const titleContent = treeTitle === undefined ? label : treeTitle;
  const hasTitle = titleContent !== undefined && titleContent !== null && titleContent !== "";

  function changeOpen(nextOpen: boolean, details: { reason: TreeSelectOpenChangeReason }) {
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
        aria-readonly={readOnly || undefined}
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
          if (!event.defaultPrevented) changeOpen(true, { reason: "trigger" });
        }}
      />
      <HiddenFormValues disabled={disabled} name={field.name} values={currentValue} />
      <TreeSelect<TValue>
        {...treeSelectProps}
        {...(hasTitle ? { title: titleContent } : { "aria-label": treeAriaLabel || "Tree Select" })}
        disabled={disabled}
        open={resolvedOpen}
        readOnly={readOnly}
        returnFocusRef={triggerRef}
        {...(treeAriaLabel === undefined ? {} : { treeAriaLabel })}
        value={currentValue}
        onCancel={(details) => {
          markOpenCycleTouched();
          if (onCancel) onCancel(details);
        }}
        onConfirm={(nextValue, options) => {
          if (!readOnly) {
            field.onChange(nextValue);
          }
          markOpenCycleTouched();
          if (onConfirm) onConfirm(nextValue, options);
        }}
        onOpenChange={(nextOpen, details) => changeOpen(nextOpen, details)}
      />
    </Field>
  );
}
