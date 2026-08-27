"use client";

import { CheckboxGroup, Field } from "@meu/mobile";
import type { CheckboxGroupProps, CheckboxValue } from "@meu/mobile";
import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, Path, UseControllerProps } from "react-hook-form";
import type { ReactNode } from "react";

export type MeuFormCheckboxGroupProps<
  TFieldValues extends FieldValues,
  TValue extends CheckboxValue = CheckboxValue
> = Omit<CheckboxGroupProps<TValue>, "defaultValue" | "name" | "onChange" | "value"> & {
  description?: ReactNode;
  label?: ReactNode;
  name: Path<TFieldValues>;
  required?: boolean;
  rules?: UseControllerProps<TFieldValues, Path<TFieldValues>>["rules"];
};

export function MeuFormCheckboxGroup<
  TFieldValues extends FieldValues,
  TValue extends CheckboxValue = CheckboxValue
>({
  description,
  label,
  name,
  required = false,
  rules,
  ...groupProps
}: MeuFormCheckboxGroupProps<TFieldValues, TValue>) {
  const { control } = useFormContext<TFieldValues>();

  return (
    <Controller
      control={control}
      name={name}
      {...(rules ? { rules } : {})}
      render={({ field, fieldState }) => {
        const currentValue = Array.isArray(field.value) ? (field.value as TValue[]) : [];
        return (
          <Field
            label={label}
            description={description}
            required={required}
            error={fieldState.error ? fieldState.error.message : undefined}
          >
            <CheckboxGroup<TValue>
              {...groupProps}
              name={field.name}
              ref={field.ref}
              value={currentValue}
              onChange={field.onChange}
              status={fieldState.invalid ? "error" : "default"}
            />
          </Field>
        );
      }}
    />
  );
}
