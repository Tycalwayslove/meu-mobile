"use client";

import { Field, SearchField } from "@meu/mobile";
import type { SearchFieldProps } from "@meu/mobile";
import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, Path, UseControllerProps } from "react-hook-form";
import type { ReactNode } from "react";

export type MeuFormSearchFieldProps<TFieldValues extends FieldValues> = Omit<
  SearchFieldProps,
  "defaultValue" | "name" | "onBlur" | "onChange" | "value"
> & {
  description?: ReactNode;
  label?: ReactNode;
  name: Path<TFieldValues>;
  required?: boolean;
  rules?: UseControllerProps<TFieldValues, Path<TFieldValues>>["rules"];
};

export function MeuFormSearchField<TFieldValues extends FieldValues>({
  description,
  label,
  name,
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
            name={field.name}
            ref={field.ref}
            value={typeof field.value === "string" ? field.value : ""}
            onBlur={field.onBlur}
            onChange={field.onChange}
            status={fieldState.invalid ? "error" : "default"}
          />
        </Field>
      )}
    />
  );
}
