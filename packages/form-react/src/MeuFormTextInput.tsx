"use client";

import { Field, TextInput } from "@meu/mobile";
import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import type { ReactNode } from "react";

import type { TextInputProps } from "@meu/mobile";
import type { MeuStringFieldPath } from "./adapter-types";

/**
 * Props for a text input bound to a string-valued React Hook Form field.
 *
 * @public
 */
export type MeuFormTextInputProps<TFieldValues extends FieldValues> = Omit<
  TextInputProps,
  "defaultValue" | "name" | "onBlur" | "onChange" | "value"
> & {
  /** Supporting content rendered with the field and associated with the text input. */
  description?: ReactNode;
  /** Visible field label rendered by the surrounding `Field`. */
  label?: ReactNode;
  /** Path of the string-valued React Hook Form field controlled by this input. */
  name: MeuStringFieldPath<TFieldValues>;
  /** Called after React Hook Form marks the field as touched; receives the input blur event. */
  onBlur?: TextInputProps["onBlur"];
  /** Called after React Hook Form receives the edited value; receives the native change event. */
  onChange?: TextInputProps["onChange"];
  /** Shows the required affordance and sets the input's native `required` state. */
  required?: boolean;
  /** React Hook Form validation and value-processing rules registered for this field. */
  rules?: UseControllerProps<TFieldValues, MeuStringFieldPath<TFieldValues>>["rules"];
};

/**
 * Binds a text input's value, validation state, and focus target to React Hook Form.
 *
 * @public
 */
export function MeuFormTextInput<TFieldValues extends FieldValues>({
  description,
  label,
  name,
  onBlur,
  onChange,
  required = false,
  rules,
  ...inputProps
}: MeuFormTextInputProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>();

  return (
    <Controller
      control={control}
      {...(inputProps.disabled !== undefined ? { disabled: inputProps.disabled } : {})}
      name={name}
      {...(rules ? { rules } : {})}
      render={({ field, fieldState }) => (
        <Field
          data-meu-form-field={field.name}
          label={label}
          description={description}
          required={required}
          error={fieldState.error ? fieldState.error.message : undefined}
        >
          <TextInput
            {...inputProps}
            disabled={Boolean(inputProps.disabled || field.disabled)}
            name={field.name}
            ref={field.ref}
            required={required}
            value={typeof field.value === "string" ? field.value : ""}
            onBlur={(event) => {
              field.onBlur();
              if (onBlur) onBlur(event);
            }}
            onChange={(event) => {
              field.onChange(event);
              if (onChange) onChange(event);
            }}
            status={fieldState.invalid ? "error" : "default"}
          />
        </Field>
      )}
    />
  );
}
