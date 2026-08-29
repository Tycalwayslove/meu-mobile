"use client";

import { Field, Stepper } from "@meu/mobile";
import type { StepperProps } from "@meu/mobile";
import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import type { ReactNode } from "react";

import type { MeuNumberFieldPath } from "./adapter-types";

/**
 * Props for a stepper bound to a numeric React Hook Form field.
 *
 * @public
 */
export type MeuFormStepperProps<TFieldValues extends FieldValues> = Omit<
  StepperProps,
  "defaultValue" | "name" | "onBlur" | "onChange" | "value"
> & {
  /** Supporting content rendered with the field and associated with the stepper. */
  description?: ReactNode;
  /** Visible field label rendered by the surrounding `Field`. */
  label?: ReactNode;
  /** Path of the numeric React Hook Form field controlled by this stepper. */
  name: MeuNumberFieldPath<TFieldValues>;
  /** Called after React Hook Form marks the field as touched; receives the input blur event. */
  onBlur?: StepperProps["onBlur"];
  /** Called after the form value changes; receives the next numeric value. */
  onChange?: StepperProps["onChange"];
  /** Shows the required affordance and sets the stepper input's native `required` state. */
  required?: boolean;
  /** React Hook Form validation and value-processing rules registered for this field. */
  rules?: UseControllerProps<TFieldValues, MeuNumberFieldPath<TFieldValues>>["rules"];
};

/**
 * Binds a stepper's value, validation state, and focus target to React Hook Form.
 *
 * @public
 */
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
