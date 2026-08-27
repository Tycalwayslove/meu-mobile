"use client";

import { Field, SegmentedControl } from "@meu/mobile";
import type { SegmentedControlProps, SegmentedControlValue } from "@meu/mobile";
import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, Path, UseControllerProps } from "react-hook-form";
import type { ReactNode } from "react";

export type MeuFormSegmentedControlProps<
  TFieldValues extends FieldValues,
  TValue extends SegmentedControlValue = SegmentedControlValue
> = Omit<SegmentedControlProps<TValue>, "defaultValue" | "name" | "onChange" | "value"> & {
  description?: ReactNode;
  label?: ReactNode;
  name: Path<TFieldValues>;
  required?: boolean;
  rules?: UseControllerProps<TFieldValues, Path<TFieldValues>>["rules"];
};

export function MeuFormSegmentedControl<
  TFieldValues extends FieldValues,
  TValue extends SegmentedControlValue = SegmentedControlValue
>({
  description,
  label,
  name,
  required = false,
  rules,
  ...segmentedControlProps
}: MeuFormSegmentedControlProps<TFieldValues, TValue>) {
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
          <SegmentedControl<TValue>
            {...segmentedControlProps}
            name={field.name}
            ref={field.ref}
            required={required}
            value={
              typeof field.value === "string" || typeof field.value === "number"
                ? field.value
                : null
            }
            onChange={(nextValue) => field.onChange(nextValue)}
            status={fieldState.invalid ? "error" : "default"}
          />
        </Field>
      )}
    />
  );
}
