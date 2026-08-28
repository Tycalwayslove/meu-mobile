"use client";

import { Field, Stepper } from "@meu/mobile";
import type { StepperProps } from "@meu/mobile";
import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import type { ReactNode } from "react";

import type { MeuNumberFieldPath } from "./adapter-types";

export type MeuFormStepperProps<TFieldValues extends FieldValues> = Omit<
  StepperProps,
  "defaultValue" | "name" | "onBlur" | "onChange" | "value"
> & {
  description?: ReactNode;
  label?: ReactNode;
  name: MeuNumberFieldPath<TFieldValues>;
  onBlur?: StepperProps["onBlur"];
  onChange?: StepperProps["onChange"];
  required?: boolean;
  rules?: UseControllerProps<TFieldValues, MeuNumberFieldPath<TFieldValues>>["rules"];
};

export function MeuFormStepper<TFieldValues extends FieldValues>({
  description,
  label,
  name,
  onBlur,
  onChange,
  required = false,
  rules,
  ...stepperProps
}: MeuFormStepperProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>();

  return (
    <Controller
      control={control}
      name={name}
      {...(rules ? { rules } : {})}
      render={({ field, fieldState }) => {
        const fieldValue = field.value;
        const currentValue = typeof fieldValue === "number" ? fieldValue : null;
        return (
          <Field
            label={label}
            description={description}
            required={required}
            error={fieldState.error ? fieldState.error.message : undefined}
          >
            <Stepper
              {...stepperProps}
              disabled={Boolean(stepperProps.disabled || field.disabled)}
              name={field.name}
              ref={field.ref}
              required={required}
              value={currentValue}
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
        );
      }}
    />
  );
}
