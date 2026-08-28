"use client";

import { Field, PasscodeInput } from "@meu/mobile";
import { useRef } from "react";
import { useController, useFormContext } from "react-hook-form";
import type { FieldValues, Path, UseControllerProps } from "react-hook-form";
import type { FocusEvent, ReactNode } from "react";

import type { PasscodeInputChangeDetails, PasscodeInputProps, PasscodeInputRef } from "@meu/mobile";

export type MeuFormPasscodeInputProps<TFieldValues extends FieldValues> = Omit<
  PasscodeInputProps,
  "defaultValue" | "name" | "onBlur" | "onChange" | "ref" | "status" | "value"
> & {
  description?: ReactNode;
  label?: ReactNode;
  name: Path<TFieldValues>;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  onChange?: (value: string, details: PasscodeInputChangeDetails) => void;
  required?: boolean;
  rules?: UseControllerProps<TFieldValues, Path<TFieldValues>>["rules"];
};

export function MeuFormPasscodeInput<TFieldValues extends FieldValues>({
  description,
  disabled,
  label,
  name,
  onBlur,
  onChange,
  required = false,
  rules,
  ...inputProps
}: MeuFormPasscodeInputProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>();
  const passcodeRef = useRef<PasscodeInputRef | null>(null);
  const { field, fieldState } = useController({
    control,
    name,
    ...(rules ? { rules } : {})
  });
  const value = typeof field.value === "string" ? field.value : "";

  return (
    <Field
      label={label}
      description={description}
      required={required}
      error={fieldState.error ? fieldState.error.message : undefined}
    >
      <PasscodeInput
        {...inputProps}
        ref={(handle) => {
          passcodeRef.current = handle;
          field.ref(handle ? handle.input : null);
        }}
        disabled={Boolean(disabled || field.disabled)}
        name={field.name}
        required={required}
        status={fieldState.invalid ? "error" : "default"}
        value={value}
        onChange={(nextValue, details) => {
          field.onChange(nextValue);
          if (onChange) onChange(nextValue, details);
        }}
        onBlur={(event) => {
          field.onBlur();
          if (onBlur) onBlur(event);
        }}
      />
    </Field>
  );
}
