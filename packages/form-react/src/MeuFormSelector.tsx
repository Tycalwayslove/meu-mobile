"use client";

import { Field, Selector } from "@meu/mobile";
import type { SelectorProps, SelectorValue } from "@meu/mobile";
import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, Path, UseControllerProps } from "react-hook-form";
import type { ReactNode } from "react";

export type MeuFormSelectorProps<
  TFieldValues extends FieldValues,
  TValue extends SelectorValue = SelectorValue
> = Omit<SelectorProps<TValue>, "defaultValue" | "name" | "onChange" | "value"> & {
  description?: ReactNode;
  label?: ReactNode;
  name: Path<TFieldValues>;
  required?: boolean;
  rules?: UseControllerProps<TFieldValues, Path<TFieldValues>>["rules"];
};

export function MeuFormSelector<
  TFieldValues extends FieldValues,
  TValue extends SelectorValue = SelectorValue
>({
  description,
  label,
  name,
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
            name={field.name}
            ref={field.ref}
            value={Array.isArray(field.value) ? (field.value as TValue[]) : []}
            onChange={(nextValue) => field.onChange(nextValue)}
            status={fieldState.invalid ? "error" : "default"}
          />
        </Field>
      )}
    />
  );
}
