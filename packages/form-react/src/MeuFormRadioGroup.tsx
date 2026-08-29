"use client";

import { Field, RadioGroup } from "@meu/mobile";
import type { RadioGroupProps, RadioValue } from "@meu/mobile";
import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import type { ReactNode } from "react";

import type { MeuSelectionFieldPath } from "./adapter-types";

/**
 * Props for a radio group bound to a scalar React Hook Form field.
 *
 * @public
 */
export type MeuFormRadioGroupProps<
  TFieldValues extends FieldValues,
  TValue extends RadioValue = RadioValue
> = Omit<RadioGroupProps<TValue>, "defaultValue" | "name" | "onChange" | "value"> & {
  /** Supporting content rendered with the field and associated with the radio group. */
  description?: ReactNode;
  /** Visible group label rendered by the surrounding `Field`. */
  label?: ReactNode;
  /** Path of the scalar React Hook Form field controlled by this group. */
  name: MeuSelectionFieldPath<TFieldValues, TValue>;
  /** Called after the form value changes; receives the selected value and input event. */
  onChange?: RadioGroupProps<TValue>["onChange"];
  /** Shows the required affordance and sets the group's native `required` state. */
  required?: boolean;
  /** React Hook Form validation and value-processing rules registered for this field. */
  rules?: UseControllerProps<TFieldValues, MeuSelectionFieldPath<TFieldValues, TValue>>["rules"];
};

/**
 * Binds a radio group's selection, validation state, and focus target to React Hook Form.
 *
 * @public
 */
export function MeuFormRadioGroup<
  TFieldValues extends FieldValues,
  TValue extends RadioValue = RadioValue
>({
  description,
  label,
  name,
  onBlur,
  onChange,
  required = false,
  rules,
  ...groupProps
}: MeuFormRadioGroupProps<TFieldValues, TValue>) {
  const { control } = useFormContext<TFieldValues>();

  return (
    <Controller
      control={control}
      {...(groupProps.disabled !== undefined ? { disabled: groupProps.disabled } : {})}
      name={name}
      {...(rules ? { rules } : {})}
      render={({ field, fieldState }) => {
        const fieldValue = field.value;
        const currentValue =
          typeof fieldValue === "string" || typeof fieldValue === "number"
            ? (fieldValue as TValue)
            : null;
        return (
          <Field
            data-meu-form-field={field.name}
            label={label}
            description={description}
            required={required}
            error={fieldState.error ? fieldState.error.message : undefined}
          >
            <RadioGroup<TValue>
              {...groupProps}
              disabled={Boolean(groupProps.disabled || field.disabled)}
              name={field.name}
              ref={field.ref}
              required={required}
              value={currentValue}
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
        );
      }}
    />
  );
}
