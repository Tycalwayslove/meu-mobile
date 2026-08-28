"use client";

import { Field, RadioGroup } from "@meu/mobile";
import type { RadioGroupProps, RadioValue } from "@meu/mobile";
import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import type { ReactNode } from "react";

import type { MeuSelectionFieldPath } from "./adapter-types";

export type MeuFormRadioGroupProps<
  TFieldValues extends FieldValues,
  TValue extends RadioValue = RadioValue
> = Omit<RadioGroupProps<TValue>, "defaultValue" | "name" | "onChange" | "value"> & {
  description?: ReactNode;
  label?: ReactNode;
  name: MeuSelectionFieldPath<TFieldValues, TValue>;
  onChange?: RadioGroupProps<TValue>["onChange"];
  required?: boolean;
  rules?: UseControllerProps<TFieldValues, MeuSelectionFieldPath<TFieldValues, TValue>>["rules"];
};

export function MeuFormRadioGroup<
  TFieldValues extends FieldValues,
  TValue extends RadioValue = RadioValue
>({
  description,
  label,
  name,
  onBlur,
  onChange,
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
              disabled={Boolean(groupProps.disabled || field.disabled)}
              name={field.name}
              ref={field.ref}
              required={required}
              value={currentValue}
              onBlur={(event) => {
                if (event.currentTarget.contains(event.relatedTarget)) return;
                field.onBlur();
                if (onBlur) onBlur(event);
              }}
              onChange={(nextValue, event) => {
                field.onChange(nextValue);
                if (onChange) onChange(nextValue, event);
              }}
              status={fieldState.invalid ? "error" : "default"}
            />
          </Field>
        );
      }}
    />
  );
}
