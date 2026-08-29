"use client";

import { CheckboxGroup, Field } from "@meu/mobile";
import type { CheckboxGroupProps, CheckboxValue } from "@meu/mobile";
import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import type { ReactNode } from "react";

import type { MeuCollectionFieldPath } from "./adapter-types";

/**
 * Props for a checkbox group bound to an array-valued React Hook Form field.
 *
 * @public
 */
export type MeuFormCheckboxGroupProps<
  TFieldValues extends FieldValues,
  TValue extends CheckboxValue = CheckboxValue
> = Omit<CheckboxGroupProps<TValue>, "defaultValue" | "name" | "onChange" | "value"> & {
  /** Supporting content rendered with the field and associated with the checkbox group. */
  description?: ReactNode;
  /** Visible group label rendered by the surrounding `Field`. */
  label?: ReactNode;
  /** Path of the array-valued React Hook Form field controlled by this group. */
  name: MeuCollectionFieldPath<TFieldValues, TValue>;
  /** Called after React Hook Form stores the next array; receives the selected values. */
  onChange?: CheckboxGroupProps<TValue>["onChange"];
  /** Shows the required affordance; enforce minimum selection through `rules` when needed. */
  required?: boolean;
  /** React Hook Form validation and value-processing rules registered for this field. */
  rules?: UseControllerProps<TFieldValues, MeuCollectionFieldPath<TFieldValues, TValue>>["rules"];
};

/**
 * Binds a checkbox group's selections, validation state, and focus target to React Hook Form.
 *
 * @public
 */
export function MeuFormCheckboxGroup<
  TFieldValues extends FieldValues,
  TValue extends CheckboxValue = CheckboxValue
>({
  description,
  label,
  name,
  onBlur,
  onChange,
  required = false,
  rules,
  ...groupProps
}: MeuFormCheckboxGroupProps<TFieldValues, TValue>) {
  const { control } = useFormContext<TFieldValues>();

  return (
    <Controller
      control={control}
      {...(groupProps.disabled !== undefined ? { disabled: groupProps.disabled } : {})}
      name={name}
      {...(rules ? { rules } : {})}
      render={({ field, fieldState }) => {
        const currentValue = Array.isArray(field.value) ? (field.value as TValue[]) : [];
        return (
          <Field
            data-meu-form-field={field.name}
            label={label}
            description={description}
            required={required}
            error={fieldState.error ? fieldState.error.message : undefined}
          >
            <CheckboxGroup<TValue>
              {...groupProps}
              disabled={Boolean(groupProps.disabled || field.disabled)}
              name={field.name}
              ref={field.ref}
              value={currentValue}
              onBlur={(event) => {
                if (event.currentTarget.contains(event.relatedTarget)) return;
                field.onBlur();
                if (onBlur) onBlur(event);
              }}
              onChange={(nextValue) => {
                field.onChange(nextValue);
                if (onChange) onChange(nextValue);
              }}
              status={fieldState.invalid ? "error" : "default"}
            />
          </Field>
        );
      }}
    />
  );
}
