"use client";

import { Field, RadioGroup } from "@meu/mobile";
import type { RadioGroupProps, RadioValue } from "@meu/mobile";
import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, Path, UseControllerProps } from "react-hook-form";
import type { ReactNode } from "react";

export type MeuFormRadioGroupProps<
  TFieldValues extends FieldValues,
  TValue extends RadioValue = RadioValue
> = Omit<RadioGroupProps<TValue>, "defaultValue" | "name" | "onChange" | "value"> & {
  description?: ReactNode;
  label?: ReactNode;
  name: Path<TFieldValues>;
  required?: boolean;
  rules?: UseControllerProps<TFieldValues, Path<TFieldValues>>["rules"];
};

export function MeuFormRadioGroup<
  TFieldValues extends FieldValues,
  TValue extends RadioValue = RadioValue
>({
  description,
  label,
  name,
  required = false,
  rules,
  ...groupProps
}: MeuFormRadioGroupProps<TFieldValues, TValue>) {
  const { control } = useFormContext<TFieldValues>();

  return (
    <Controller
      control={control}
      name={name}
      {...(rules ? { rules } : {})}
      render={({ field, fieldState }) => {
        const fieldValue = field.value;
        const currentValue =
          typeof fieldValue === "string" || typeof fieldValue === "number"
            ? (fieldValue as TValue)
            : null;
        return (
          <Field
            label={label}
            description={description}
            required={required}
            error={fieldState.error ? fieldState.error.message : undefined}
          >
            <RadioGroup<TValue>
              {...groupProps}
              name={field.name}
              ref={field.ref}
              value={currentValue}
              onChange={(nextValue) => field.onChange(nextValue)}
              status={fieldState.invalid ? "error" : "default"}
            />
          </Field>
        );
      }}
    />
  );
}
