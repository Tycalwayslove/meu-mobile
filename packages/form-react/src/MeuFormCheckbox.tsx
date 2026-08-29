"use client";

import { Checkbox, Field } from "@meu/mobile";
import type { CheckboxProps } from "@meu/mobile";
import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import type { ReactNode } from "react";

import type { MeuBooleanFieldPath } from "./adapter-types";

/**
 * Props for a checkbox bound to a boolean React Hook Form field.
 *
 * @public
 */
export type MeuFormCheckboxProps<TFieldValues extends FieldValues> = Omit<
  CheckboxProps,
  "checked" | "defaultChecked" | "name" | "onBlur" | "onChange"
> & {
  /** Supporting content rendered with the field and associated with the checkbox. */
  description?: ReactNode;
  /** Visible field label rendered by the surrounding `Field`. */
  label?: ReactNode;
  /** Path of the boolean React Hook Form field that controls the checked state. */
  name: MeuBooleanFieldPath<TFieldValues>;
  /** Called after React Hook Form marks the field as touched; receives the checkbox blur event. */
  onBlur?: CheckboxProps["onBlur"];
  /** Called after the form value changes; receives the checked state and native change event. */
  onChange?: CheckboxProps["onChange"];
  /** Shows the required affordance and sets the checkbox's native `required` state. */
  required?: boolean;
  /** React Hook Form validation and value-processing rules registered for this field. */
  rules?: UseControllerProps<TFieldValues, MeuBooleanFieldPath<TFieldValues>>["rules"];
};

/**
 * Binds a checkbox's checked state, validation state, and focus target to React Hook Form.
 *
 * @public
 */
export function MeuFormCheckbox<TFieldValues extends FieldValues>({
  description,
  label,
  name,
  onBlur,
  onChange,
  required = false,
  rules,
  ...checkboxProps
}: MeuFormCheckboxProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>();

  return (
    <Controller
      control={control}
      name={name}
      {...(rules ? { rules } : {})}
      render={({ field, fieldState }) => (
        <Field
          label={label}
          description={description}
          required={required}
          error={fieldState.error ? fieldState.error.message : undefined}
        >
          <Checkbox
            {...checkboxProps}
            disabled={Boolean(checkboxProps.disabled || field.disabled)}
            name={field.name}
            ref={field.ref}
            required={required}
            checked={field.value === true}
            onBlur={(event) => {
              field.onBlur();
              if (onBlur) onBlur(event);
            }}
            onChange={(nextChecked, event) => {
              field.onChange(nextChecked);
              if (onChange) onChange(nextChecked, event);
            }}
            status={fieldState.invalid ? "error" : "default"}
          />
        </Field>
      )}
    />
  );
}
