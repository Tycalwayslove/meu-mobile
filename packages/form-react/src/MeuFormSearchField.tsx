"use client";

import { Field, SearchField } from "@meu/mobile";
import type { SearchFieldProps } from "@meu/mobile";
import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import type { ReactNode } from "react";

import type { MeuStringFieldPath } from "./adapter-types";

export type MeuFormSearchFieldProps<TFieldValues extends FieldValues> = Omit<
  SearchFieldProps,
  "defaultValue" | "name" | "onBlur" | "onChange" | "value"
> & {
  description?: ReactNode;
  label?: ReactNode;
  name: MeuStringFieldPath<TFieldValues>;
  onBlur?: SearchFieldProps["onBlur"];
  onChange?: SearchFieldProps["onChange"];
  required?: boolean;
  rules?: UseControllerProps<TFieldValues, MeuStringFieldPath<TFieldValues>>["rules"];
};

export function MeuFormSearchField<TFieldValues extends FieldValues>({
  description,
  label,
  name,
  onBlur,
  onChange,
  required = false,
  rules,
  ...searchFieldProps
}: MeuFormSearchFieldProps<TFieldValues>) {
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
          <SearchField
            {...searchFieldProps}
            disabled={Boolean(searchFieldProps.disabled || field.disabled)}
            name={field.name}
            ref={field.ref}
            required={required}
            value={typeof field.value === "string" ? field.value : ""}
            onBlur={(event) => {
              field.onBlur();
              if (onBlur) onBlur(event);
            }}
            onChange={(nextValue, details) => {
              field.onChange(nextValue);
              if (onChange) onChange(nextValue, details);
            }}
            status={fieldState.invalid ? "error" : "default"}
          />
        </Field>
      )}
    />
  );
}
