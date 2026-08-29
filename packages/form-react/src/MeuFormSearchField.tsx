"use client";

import { Field, SearchField } from "@meu/mobile";
import type { SearchFieldProps } from "@meu/mobile";
import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import type { ReactNode } from "react";

import type { MeuStringFieldPath } from "./adapter-types";

/**
 * Props for a search input bound to a string-valued React Hook Form field.
 *
 * @public
 */
export type MeuFormSearchFieldProps<TFieldValues extends FieldValues> = Omit<
  SearchFieldProps,
  "defaultValue" | "name" | "onBlur" | "onChange" | "value"
> & {
  /** Supporting content rendered with the field and associated with the search input. */
  description?: ReactNode;
  /** Visible field label rendered by the surrounding `Field`. */
  label?: ReactNode;
  /** Path of the string-valued React Hook Form field controlled by this search input. */
  name: MeuStringFieldPath<TFieldValues>;
  /** Called after React Hook Form marks the field as touched; receives the input blur event. */
  onBlur?: SearchFieldProps["onBlur"];
  /** Called after the form value changes; receives the new string and change-source details. */
  onChange?: SearchFieldProps["onChange"];
  /** Shows the required affordance and sets the input's native `required` state. */
  required?: boolean;
  /** React Hook Form validation and value-processing rules registered for this field. */
  rules?: UseControllerProps<TFieldValues, MeuStringFieldPath<TFieldValues>>["rules"];
};

/**
 * Binds a search input's value, validation state, and focus target to React Hook Form.
 *
 * @public
 */
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
