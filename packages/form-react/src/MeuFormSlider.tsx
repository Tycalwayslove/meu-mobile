"use client";

import { Field, Slider } from "@meu/mobile";
import type { SliderProps } from "@meu/mobile";
import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, Path, UseControllerProps } from "react-hook-form";
import type { ReactNode } from "react";

export type MeuFormSliderProps<TFieldValues extends FieldValues> = Omit<
  SliderProps,
  "defaultValue" | "name" | "onBlur" | "onChange" | "value"
> & {
  description?: ReactNode;
  label?: ReactNode;
  name: Path<TFieldValues>;
  required?: boolean;
  rules?: UseControllerProps<TFieldValues, Path<TFieldValues>>["rules"];
};

export function MeuFormSlider<TFieldValues extends FieldValues>({
  description,
  label,
  name,
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
              name={field.name}
              ref={field.ref}
              value={currentValue}
              onBlur={field.onBlur}
              onChange={(nextValue) => field.onChange(nextValue)}
              status={fieldState.invalid ? "error" : "default"}
            />
          </Field>
        );
      }}
    />
  );
}
