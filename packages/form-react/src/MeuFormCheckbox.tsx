"use client";

import { Checkbox, Field } from "@meu/mobile";
import type { CheckboxProps } from "@meu/mobile";
import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import type { ReactNode } from "react";

import type { MeuBooleanFieldPath } from "./adapter-types";

export type MeuFormCheckboxProps<TFieldValues extends FieldValues> = Omit<
  CheckboxProps,
  "checked" | "defaultChecked" | "name" | "onBlur" | "onChange"
> & {
  description?: ReactNode;
  label?: ReactNode;
  name: MeuBooleanFieldPath<TFieldValues>;
  onBlur?: CheckboxProps["onBlur"];
  onChange?: CheckboxProps["onChange"];
  required?: boolean;
  rules?: UseControllerProps<TFieldValues, MeuBooleanFieldPath<TFieldValues>>["rules"];
};

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
