"use client";

import { Field, Stepper } from "@meu/mobile";
import type { StepperProps } from "@meu/mobile";
import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, Path, UseControllerProps } from "react-hook-form";
import type { ReactNode } from "react";

export type MeuFormStepperProps<TFieldValues extends FieldValues> = Omit<
  StepperProps,
  "defaultValue" | "name" | "onBlur" | "onChange" | "value"
> & {
  description?: ReactNode;
  label?: ReactNode;
  name: Path<TFieldValues>;
  required?: boolean;
  rules?: UseControllerProps<TFieldValues, Path<TFieldValues>>["rules"];
};

export function MeuFormStepper<TFieldValues extends FieldValues>({
  description,
  label,
  name,
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
              name={field.name}
              ref={field.ref}
              value={currentValue}
              onBlur={field.onBlur}
              onChange={field.onChange}
              status={fieldState.invalid ? "error" : "default"}
            />
          </Field>
        );
      }}
    />
  );
}
