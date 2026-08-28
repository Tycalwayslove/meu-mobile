"use client";

import { Field, Slider } from "@meu/mobile";
import type { SliderProps } from "@meu/mobile";
import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import type { ReactNode } from "react";

import type { MeuNumberFieldPath } from "./adapter-types";

export type MeuFormSliderProps<TFieldValues extends FieldValues> = Omit<
  SliderProps,
  "defaultValue" | "name" | "onBlur" | "onChange" | "value"
> & {
  description?: ReactNode;
  label?: ReactNode;
  name: MeuNumberFieldPath<TFieldValues>;
  onBlur?: SliderProps["onBlur"];
  onChange?: SliderProps["onChange"];
  required?: boolean;
  rules?: UseControllerProps<TFieldValues, MeuNumberFieldPath<TFieldValues>>["rules"];
};

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
      name={name}
      {...(rules ? { rules } : {})}
      render={({ field, fieldState }) => {
        const fallback = sliderProps.min === undefined ? 0 : sliderProps.min;
        const currentValue = typeof field.value === "number" ? field.value : fallback;
        return (
          <Field
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
