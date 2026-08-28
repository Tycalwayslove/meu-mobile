"use client";

import { Field, Selector } from "@meu/mobile";
import type { SelectorProps, SelectorValue } from "@meu/mobile";
import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import type { ReactNode } from "react";

import type { MeuCollectionFieldPath } from "./adapter-types";

export type MeuFormSelectorProps<
  TFieldValues extends FieldValues,
  TValue extends SelectorValue = SelectorValue
> = Omit<SelectorProps<TValue>, "defaultValue" | "name" | "onChange" | "value"> & {
  description?: ReactNode;
  label?: ReactNode;
  name: MeuCollectionFieldPath<TFieldValues, TValue>;
  onChange?: SelectorProps<TValue>["onChange"];
  required?: boolean;
  rules?: UseControllerProps<TFieldValues, MeuCollectionFieldPath<TFieldValues, TValue>>["rules"];
};

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
      name={name}
      {...(rules ? { rules } : {})}
      render={({ field, fieldState }) => (
        <Field
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
            status={fieldState.invalid ? "error" : "default"}
          />
        </Field>
      )}
    />
  );
}
