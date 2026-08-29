"use client";

import { Field, TextArea } from "@meu/mobile";
import type { TextAreaProps } from "@meu/mobile";
import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import type { ReactNode } from "react";

import type { MeuStringFieldPath } from "./adapter-types";

/**
 * Props for a text area bound to a string-valued React Hook Form field.
 *
 * @public
 */
export type MeuFormTextAreaProps<TFieldValues extends FieldValues> = Omit<
  TextAreaProps,
  "defaultValue" | "name" | "onBlur" | "onChange" | "value"
> & {
  /** Supporting content rendered with the field and associated with the text area. */
  description?: ReactNode;
  /** Visible field label rendered by the surrounding `Field`. */
  label?: ReactNode;
  /** Path of the string-valued React Hook Form field controlled by this text area. */
  name: MeuStringFieldPath<TFieldValues>;
  /** Called after React Hook Form marks the field as touched; receives the textarea blur event. */
  onBlur?: TextAreaProps["onBlur"];
  /** Called after React Hook Form receives the edited value; receives the native change event. */
  onChange?: TextAreaProps["onChange"];
  /** Shows the required affordance and sets the textarea's native `required` state. */
  required?: boolean;
  /** React Hook Form validation and value-processing rules registered for this field. */
  rules?: UseControllerProps<TFieldValues, MeuStringFieldPath<TFieldValues>>["rules"];
};

/**
 * Binds a text area's value, validation state, and focus target to React Hook Form.
 *
 * @public
 */
export function MeuFormTextArea<TFieldValues extends FieldValues>({
  description,
  label,
  name,
  onBlur,
  onChange,
  required = false,
  rules,
  ...textAreaProps
}: MeuFormTextAreaProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>();

  return (
    <Controller
      control={control}
      {...(textAreaProps.disabled !== undefined ? { disabled: textAreaProps.disabled } : {})}
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
          <TextArea
            {...textAreaProps}
            disabled={Boolean(textAreaProps.disabled || field.disabled)}
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
