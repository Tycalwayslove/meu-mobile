"use client";

import { Field, Rate } from "@meu/mobile";
import type { RateProps } from "@meu/mobile";
import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, Path, UseControllerProps } from "react-hook-form";
import type { ReactNode } from "react";

export type MeuFormRateProps<TFieldValues extends FieldValues> = Omit<
  RateProps,
  "defaultValue" | "name" | "onBlur" | "onChange" | "value"
> & {
  description?: ReactNode;
  label?: ReactNode;
  name: Path<TFieldValues>;
  required?: boolean;
  rules?: UseControllerProps<TFieldValues, Path<TFieldValues>>["rules"];
};

export function MeuFormRate<TFieldValues extends FieldValues>({
  description,
  label,
  name,
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
            name={field.name}
            ref={field.ref}
            value={typeof field.value === "number" ? field.value : 0}
            onBlur={field.onBlur}
            onChange={field.onChange}
            status={fieldState.invalid ? "error" : "default"}
          />
        </Field>
      )}
    />
  );
}
