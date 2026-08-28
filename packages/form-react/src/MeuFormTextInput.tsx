"use client";

import { Field, TextInput } from "@meu/mobile";
import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import type { ReactNode } from "react";

import type { TextInputProps } from "@meu/mobile";
import type { MeuStringFieldPath } from "./adapter-types";

export type MeuFormTextInputProps<TFieldValues extends FieldValues> = Omit<
  TextInputProps,
  "defaultValue" | "name" | "onBlur" | "onChange" | "value"
> & {
  description?: ReactNode;
  label?: ReactNode;
  name: MeuStringFieldPath<TFieldValues>;
  onBlur?: TextInputProps["onBlur"];
  onChange?: TextInputProps["onChange"];
  required?: boolean;
  rules?: UseControllerProps<TFieldValues, MeuStringFieldPath<TFieldValues>>["rules"];
};

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
      name={name}
      {...(rules ? { rules } : {})}
      render={({ field, fieldState }) => (
        <Field
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
