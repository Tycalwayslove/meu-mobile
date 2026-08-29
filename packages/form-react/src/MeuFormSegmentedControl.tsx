"use client";

import { Field, SegmentedControl } from "@meu/mobile";
import type {
  SegmentedControlBaseProps,
  SegmentedControlRadioProps,
  SegmentedControlValue
} from "@meu/mobile";
import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import type { ReactNode } from "react";

import type { MeuSelectionFieldPath } from "./adapter-types";

type MeuFormSegmentedRadioProps<TValue extends SegmentedControlValue> =
  SegmentedControlBaseProps<TValue> & SegmentedControlRadioProps<TValue>;

/**
 * Props for a segmented control bound to a scalar React Hook Form field.
 *
 * @public
 */
export type MeuFormSegmentedControlProps<
  TFieldValues extends FieldValues,
  TValue extends SegmentedControlValue = SegmentedControlValue
> = Omit<
  MeuFormSegmentedRadioProps<TValue>,
  "defaultValue" | "mode" | "name" | "onChange" | "value"
> & {
  /** Supporting content rendered with the field and associated with the segmented control. */
  description?: ReactNode;
  /** Visible group label rendered by the surrounding `Field`. */
  label?: ReactNode;
  /** Path of the scalar React Hook Form field controlled by this segmented control. */
  name: MeuSelectionFieldPath<TFieldValues, TValue>;
  /** Called after the form value changes; receives the selected value and input event. */
  onChange?: MeuFormSegmentedRadioProps<TValue>["onChange"];
  /** Shows the required affordance and sets the control's native `required` state. */
  required?: boolean;
  /** React Hook Form validation and value-processing rules registered for this field. */
  rules?: UseControllerProps<TFieldValues, MeuSelectionFieldPath<TFieldValues, TValue>>["rules"];
};

/**
 * Binds a segmented control's selection, validation state, and focus target to React Hook Form.
 *
 * @public
 */
export function MeuFormSegmentedControl<
  TFieldValues extends FieldValues,
  TValue extends SegmentedControlValue = SegmentedControlValue
>({
  description,
  label,
  name,
  onBlur,
  onChange,
  required = false,
  rules,
  ...segmentedControlProps
}: MeuFormSegmentedControlProps<TFieldValues, TValue>) {
  const { control } = useFormContext<TFieldValues>();

  return (
    <Controller
      control={control}
      {...(segmentedControlProps.disabled !== undefined
        ? { disabled: segmentedControlProps.disabled }
        : {})}
      name={name}
      {...(rules ? { rules } : {})}
      render={({ field, fieldState }) => (
        <Field
          label={label}
          description={description}
          required={required}
          error={fieldState.error ? fieldState.error.message : undefined}
        >
          <SegmentedControl<TValue>
            {...segmentedControlProps}
            disabled={Boolean(segmentedControlProps.disabled || field.disabled)}
            mode="radiogroup"
            name={field.name}
            ref={field.ref}
            required={required}
            value={
              typeof field.value === "string" || typeof field.value === "number"
                ? field.value
                : null
            }
            onBlur={(event) => {
              if (event.currentTarget.contains(event.relatedTarget)) return;
              field.onBlur();
              if (onBlur) onBlur(event);
            }}
            onChange={(nextValue, event) => {
              field.onChange(nextValue);
              if (onChange) onChange(nextValue, event);
            }}
            status={fieldState.invalid ? "error" : "default"}
          />
        </Field>
      )}
    />
  );
}
