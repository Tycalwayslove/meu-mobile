"use client";

import { Field, Switch } from "@meu/mobile";
import type { SwitchProps } from "@meu/mobile";
import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import type { ReactNode } from "react";

import type { MeuBooleanFieldPath } from "./adapter-types";

export type MeuFormSwitchProps<TFieldValues extends FieldValues> = Omit<
  SwitchProps,
  "checked" | "defaultChecked" | "name" | "onBlur" | "onChange"
> & {
  description?: ReactNode;
  label?: ReactNode;
  name: MeuBooleanFieldPath<TFieldValues>;
  onBlur?: SwitchProps["onBlur"];
  onChange?: SwitchProps["onChange"];
  required?: boolean;
  rules?: UseControllerProps<TFieldValues, MeuBooleanFieldPath<TFieldValues>>["rules"];
};

export function MeuFormSwitch<TFieldValues extends FieldValues>({
  description,
  label,
  name,
  onBlur,
  onChange,
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
            disabled={Boolean(switchProps.disabled || field.disabled)}
            name={field.name}
            ref={field.ref}
            required={required}
            checked={field.value === true}
            onBlur={(event) => {
              field.onBlur();
              if (onBlur) onBlur(event);
            }}
            onChange={(nextChecked, event) => {
              field.onChange(nextChecked);
              if (onChange) onChange(nextChecked, event);
            }}
            status={fieldState.invalid ? "error" : "default"}
          />
        </Field>
      )}
    />
  );
}
