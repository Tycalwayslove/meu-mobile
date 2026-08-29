"use client";

import { Field, Rate } from "@meu/mobile";
import type { RateProps } from "@meu/mobile";
import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import type { ReactNode } from "react";

import type { MeuNumberFieldPath } from "./adapter-types";

/**
 * Props for a rating control bound to a numeric React Hook Form field.
 *
 * @public
 */
export type MeuFormRateProps<TFieldValues extends FieldValues> = Omit<
  RateProps,
  "defaultValue" | "name" | "onBlur" | "onChange" | "value"
> & {
  /** Supporting content rendered with the field and associated with the rating control. */
  description?: ReactNode;
  /** Visible field label rendered by the surrounding `Field`. */
  label?: ReactNode;
  /** Path of the numeric React Hook Form field controlled by this rating input. */
  name: MeuNumberFieldPath<TFieldValues>;
  /** Called after React Hook Form marks the field as touched; receives the control's blur event. */
  onBlur?: RateProps["onBlur"];
  /** Called after the form value changes; receives the next numeric rating. */
  onChange?: RateProps["onChange"];
  /** Shows the required affordance and sets the rating input's native `required` state. */
  required?: boolean;
  /** React Hook Form validation and value-processing rules registered for this field. */
  rules?: UseControllerProps<TFieldValues, MeuNumberFieldPath<TFieldValues>>["rules"];
};

/**
 * Binds a rating control's value, validation state, and focus target to React Hook Form.
 *
 * @public
 */
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
      {...(rateProps.disabled !== undefined ? { disabled: rateProps.disabled } : {})}
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
