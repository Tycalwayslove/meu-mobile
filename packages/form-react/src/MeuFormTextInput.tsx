"use client";

import { Field, TextInput } from "@meu/mobile";
import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, Path, UseControllerProps } from "react-hook-form";
import type { ReactNode } from "react";

import type { TextInputProps } from "@meu/mobile";

export type MeuFormTextInputProps<TFieldValues extends FieldValues> = Omit<
  TextInputProps,
  "defaultValue" | "name" | "onBlur" | "onChange" | "value"
> & {
  description?: ReactNode;
  label?: ReactNode;
  name: Path<TFieldValues>;
  required?: boolean;
  rules?: UseControllerProps<TFieldValues, Path<TFieldValues>>["rules"];
};

export function MeuFormTextInput<TFieldValues extends FieldValues>({
  description,
  label,
  name,
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
            {...field}
            status={fieldState.invalid ? "error" : "default"}
          />
        </Field>
      )}
    />
  );
}
