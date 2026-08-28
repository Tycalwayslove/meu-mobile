"use client";

import { Field, SegmentedControl } from "@meu/mobile";
import type { SegmentedControlProps, SegmentedControlValue } from "@meu/mobile";
import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import type { ReactNode } from "react";

import type { MeuSelectionFieldPath } from "./adapter-types";

export type MeuFormSegmentedControlProps<
  TFieldValues extends FieldValues,
  TValue extends SegmentedControlValue = SegmentedControlValue
> = Omit<SegmentedControlProps<TValue>, "defaultValue" | "name" | "onChange" | "value"> & {
  description?: ReactNode;
  label?: ReactNode;
  name: MeuSelectionFieldPath<TFieldValues, TValue>;
  onChange?: SegmentedControlProps<TValue>["onChange"];
  required?: boolean;
  rules?: UseControllerProps<TFieldValues, MeuSelectionFieldPath<TFieldValues, TValue>>["rules"];
};

export function MeuFormSegmentedControl<
  TFieldValues extends FieldValues,
  TValue extends SegmentedControlValue = SegmentedControlValue
>({
  description,
  label,
  name,
  onBlur,
  onChange,
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
            disabled={Boolean(segmentedControlProps.disabled || field.disabled)}
            name={field.name}
            ref={field.ref}
            required={required}
            value={
              typeof field.value === "string" || typeof field.value === "number"
                ? field.value
                : null
            }
            onBlur={(event) => {
              if (event.currentTarget.contains(event.relatedTarget)) return;
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
      )}
    />
  );
}
