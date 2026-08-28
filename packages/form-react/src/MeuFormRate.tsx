"use client";

import { Field, Rate } from "@meu/mobile";
import type { RateProps } from "@meu/mobile";
import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import type { ReactNode } from "react";

import type { MeuNumberFieldPath } from "./adapter-types";

export type MeuFormRateProps<TFieldValues extends FieldValues> = Omit<
  RateProps,
  "defaultValue" | "name" | "onBlur" | "onChange" | "value"
> & {
  description?: ReactNode;
  label?: ReactNode;
  name: MeuNumberFieldPath<TFieldValues>;
  onBlur?: RateProps["onBlur"];
  onChange?: RateProps["onChange"];
  required?: boolean;
  rules?: UseControllerProps<TFieldValues, MeuNumberFieldPath<TFieldValues>>["rules"];
};

export function MeuFormRate<TFieldValues extends FieldValues>({
  description,
  label,
  name,
  onBlur,
  onChange,
  required = false,
  rules,
  ...rateProps
}: MeuFormRateProps<TFieldValues>) {
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
          <Rate
            {...rateProps}
            disabled={Boolean(rateProps.disabled || field.disabled)}
            name={field.name}
            ref={field.ref}
            required={required}
            value={typeof field.value === "number" ? field.value : 0}
            onBlur={(event) => {
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
      )}
    />
  );
}
