"use client";

import { Field, Selector } from "@meu/mobile";
import type { SelectorProps, SelectorValue } from "@meu/mobile";
import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import type { ReactNode } from "react";

import type { MeuCollectionFieldPath } from "./adapter-types";

/**
 * Props for a selector bound to an array-valued React Hook Form field.
 *
 * @public
 */
export type MeuFormSelectorProps<
  TFieldValues extends FieldValues,
  TValue extends SelectorValue = SelectorValue
> = Omit<SelectorProps<TValue>, "defaultValue" | "name" | "onChange" | "value"> & {
  /** Supporting content rendered with the field and associated with the selector. */
  description?: ReactNode;
  /** Visible field label rendered by the surrounding `Field`. */
  label?: ReactNode;
  /** Path of the array-valued React Hook Form field controlled by this selector. */
  name: MeuCollectionFieldPath<TFieldValues, TValue>;
  /** Called after the form value changes; receives selected values and their option records. */
  onChange?: SelectorProps<TValue>["onChange"];
  /** Shows the required affordance and sets the selector's native `required` state. */
  required?: boolean;
  /** React Hook Form validation and value-processing rules registered for this field. */
  rules?: UseControllerProps<TFieldValues, MeuCollectionFieldPath<TFieldValues, TValue>>["rules"];
};

/**
 * Binds a selector's values, validation state, and focus target to React Hook Form.
 *
 * @public
 */
export function MeuFormSelector<
  TFieldValues extends FieldValues,
  TValue extends SelectorValue = SelectorValue
>({
  description,
  label,
  name,
  onBlur,
  onChange,
  required = false,
  rules,
  ...selectorProps
}: MeuFormSelectorProps<TFieldValues, TValue>) {
  const { control } = useFormContext<TFieldValues>();

  return (
    <Controller
      control={control}
      {...(selectorProps.disabled !== undefined ? { disabled: selectorProps.disabled } : {})}
      name={name}
      {...(rules ? { rules } : {})}
      render={({ field, fieldState }) => (
        <Field
          data-meu-form-field={field.name}
          label={label}
          description={description}
          required={required}
          error={fieldState.error ? fieldState.error.message : undefined}
        >
          <Selector<TValue>
            {...selectorProps}
            disabled={Boolean(selectorProps.disabled || field.disabled)}
            name={field.name}
            ref={field.ref}
            required={required}
            value={Array.isArray(field.value) ? (field.value as TValue[]) : []}
            onBlur={(event) => {
              if (event.currentTarget.contains(event.relatedTarget)) return;
              field.onBlur();
              if (onBlur) onBlur(event);
            }}
            onChange={(nextValue, options) => {
              field.onChange(nextValue);
              if (onChange) onChange(nextValue, options);
            }}
            status={fieldState.invalid || selectorProps.status === "error" ? "error" : "default"}
          />
        </Field>
      )}
    />
  );
}
