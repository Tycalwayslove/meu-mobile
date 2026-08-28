"use client";

import { CheckboxGroup, Field } from "@meu/mobile";
import type { CheckboxGroupProps, CheckboxValue } from "@meu/mobile";
import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import type { ReactNode } from "react";

import type { MeuCollectionFieldPath } from "./adapter-types";

export type MeuFormCheckboxGroupProps<
  TFieldValues extends FieldValues,
  TValue extends CheckboxValue = CheckboxValue
> = Omit<CheckboxGroupProps<TValue>, "defaultValue" | "name" | "onChange" | "value"> & {
  description?: ReactNode;
  label?: ReactNode;
  name: MeuCollectionFieldPath<TFieldValues, TValue>;
  onChange?: CheckboxGroupProps<TValue>["onChange"];
  required?: boolean;
  rules?: UseControllerProps<TFieldValues, MeuCollectionFieldPath<TFieldValues, TValue>>["rules"];
};

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
