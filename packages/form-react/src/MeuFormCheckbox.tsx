"use client";

import { Checkbox, Field } from "@meu/mobile";
import type { CheckboxProps } from "@meu/mobile";
import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, Path, UseControllerProps } from "react-hook-form";
import type { ReactNode } from "react";

export type MeuFormCheckboxProps<TFieldValues extends FieldValues> = Omit<
  CheckboxProps,
  "checked" | "defaultChecked" | "name" | "onBlur" | "onChange"
> & {
  description?: ReactNode;
  label?: ReactNode;
  name: Path<TFieldValues>;
  required?: boolean;
  rules?: UseControllerProps<TFieldValues, Path<TFieldValues>>["rules"];
};

export function MeuFormCheckbox<TFieldValues extends FieldValues>({
  description,
  label,
  name,
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
            name={field.name}
            ref={field.ref}
            checked={field.value === true}
            onBlur={field.onBlur}
            onChange={(nextChecked) => field.onChange(nextChecked)}
            status={fieldState.invalid ? "error" : "default"}
          />
        </Field>
      )}
    />
  );
}
