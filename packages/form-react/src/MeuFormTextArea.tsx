"use client";

import { Field, TextArea } from "@meu/mobile";
import type { TextAreaProps } from "@meu/mobile";
import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, Path, UseControllerProps } from "react-hook-form";
import type { ReactNode } from "react";

export type MeuFormTextAreaProps<TFieldValues extends FieldValues> = Omit<
  TextAreaProps,
  "defaultValue" | "name" | "onBlur" | "onChange" | "value"
> & {
  description?: ReactNode;
  label?: ReactNode;
  name: Path<TFieldValues>;
  required?: boolean;
  rules?: UseControllerProps<TFieldValues, Path<TFieldValues>>["rules"];
};

export function MeuFormTextArea<TFieldValues extends FieldValues>({
  description,
  label,
  name,
  required = false,
  rules,
  ...textAreaProps
}: MeuFormTextAreaProps<TFieldValues>) {
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
          <TextArea
            {...textAreaProps}
            name={field.name}
            ref={field.ref}
            value={typeof field.value === "string" ? field.value : ""}
            onBlur={field.onBlur}
            onChange={field.onChange}
            status={fieldState.invalid ? "error" : "default"}
          />
        </Field>
      )}
    />
  );
}
