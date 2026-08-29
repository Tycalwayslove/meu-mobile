"use client";

import { Field, Slider } from "@meu/mobile";
import type { SliderProps } from "@meu/mobile";
import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import type { ReactNode } from "react";

import type { MeuNumberFieldPath } from "./adapter-types";

/**
 * Props for a slider bound to a numeric React Hook Form field.
 *
 * @public
 */
export type MeuFormSliderProps<TFieldValues extends FieldValues> = Omit<
  SliderProps,
  "defaultValue" | "name" | "onBlur" | "onChange" | "value"
> & {
  /** Supporting content rendered with the field and associated with the slider. */
  description?: ReactNode;
  /** Visible field label rendered by the surrounding `Field`. */
  label?: ReactNode;
  /** Path of the numeric React Hook Form field controlled by this slider. */
  name: MeuNumberFieldPath<TFieldValues>;
  /** Called after React Hook Form marks the field as touched; receives the slider blur event. */
  onBlur?: SliderProps["onBlur"];
  /** Called after the form value changes; receives the next number and input event. */
  onChange?: SliderProps["onChange"];
  /** Shows the required affordance and sets the slider input's native `required` state. */
  required?: boolean;
  /** React Hook Form validation and value-processing rules registered for this field. */
  rules?: UseControllerProps<TFieldValues, MeuNumberFieldPath<TFieldValues>>["rules"];
};

/**
 * Binds a slider's value, validation state, and focus target to React Hook Form.
 *
 * @public
 */
export function MeuFormSlider<TFieldValues extends FieldValues>({
  description,
  label,
  name,
  onBlur,
  onChange,
  required = false,
  rules,
  ...sliderProps
}: MeuFormSliderProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>();

  return (
    <Controller
      control={control}
      {...(sliderProps.disabled !== undefined ? { disabled: sliderProps.disabled } : {})}
      name={name}
      {...(rules ? { rules } : {})}
      render={({ field, fieldState }) => {
        const fallback = sliderProps.min === undefined ? 0 : sliderProps.min;
        const currentValue = typeof field.value === "number" ? field.value : fallback;
        return (
          <Field
            data-meu-form-field={field.name}
            label={label}
            description={description}
            required={required}
            error={fieldState.error ? fieldState.error.message : undefined}
          >
            <Slider
              {...sliderProps}
              disabled={Boolean(sliderProps.disabled || field.disabled)}
              name={field.name}
              ref={field.ref}
              required={required}
              value={currentValue}
              onBlur={(event) => {
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
