"use client";

import { Field, PasscodeInput } from "@meu/mobile";
import { useRef } from "react";
import { useController, useFormContext } from "react-hook-form";
import type { FieldValues, Path, UseControllerProps } from "react-hook-form";
import type { FocusEvent, ReactNode } from "react";

import type { PasscodeInputChangeDetails, PasscodeInputProps, PasscodeInputRef } from "@meu/mobile";

/**
 * Props for a passcode input whose string value is stored in React Hook Form.
 *
 * @public
 */
export type MeuFormPasscodeInputProps<TFieldValues extends FieldValues> = Omit<
  PasscodeInputProps,
  "defaultValue" | "name" | "onBlur" | "onChange" | "ref" | "status" | "value"
> & {
  /** Supporting content rendered with the field and associated with the passcode input. */
  description?: ReactNode;
  /** Visible field label rendered by the surrounding `Field`. */
  label?: ReactNode;
  /** React Hook Form field path that stores the passcode string. */
  name: Path<TFieldValues>;
  /** Called after React Hook Form marks the field as touched; receives the hidden input blur event. */
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  /** Called after the form value changes; receives the complete passcode and edit details. */
  onChange?: (value: string, details: PasscodeInputChangeDetails) => void;
  /** Shows the required affordance and sets the hidden input's native `required` state. */
  required?: boolean;
  /** React Hook Form validation and value-processing rules registered for this field. */
  rules?: UseControllerProps<TFieldValues, Path<TFieldValues>>["rules"];
};

/**
 * Binds a passcode input's value, validation state, and hidden input ref to React Hook Form.
 *
 * @public
 */
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
    ...(disabled !== undefined ? { disabled } : {}),
    name,
    ...(rules ? { rules } : {})
  });
  const value = typeof field.value === "string" ? field.value : "";

  return (
    <Field
      label={label}
      labelAssociation="native"
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
