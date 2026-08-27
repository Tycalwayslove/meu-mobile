"use client";

import { Field, Switch } from "@meu/mobile";
import type { SwitchProps } from "@meu/mobile";
import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, Path, UseControllerProps } from "react-hook-form";
import type { ReactNode } from "react";

export type MeuFormSwitchProps<TFieldValues extends FieldValues> = Omit<
  SwitchProps,
  "checked" | "defaultChecked" | "name" | "onBlur" | "onChange"
> & {
  description?: ReactNode;
  label?: ReactNode;
  name: Path<TFieldValues>;
  required?: boolean;
  rules?: UseControllerProps<TFieldValues, Path<TFieldValues>>["rules"];
};

export function MeuFormSwitch<TFieldValues extends FieldValues>({
  description,
  label,
  name,
  required = false,
  rules,
  ...switchProps
}: MeuFormSwitchProps<TFieldValues>) {
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
          <Switch
            {...switchProps}
            name={field.name}
            ref={field.ref}
            checked={field.value === true}
            onBlur={field.onBlur}
            onChange={(nextChecked) => field.onChange(nextChecked)}
            status={fieldState.invalid ? "error" : "default"}
          />
        </Field>
      )}
    />
  );
}
