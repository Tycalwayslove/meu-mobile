"use client";

import { Field, ImageUploader } from "@meu/mobile";
import { useRef } from "react";
import { useController, useFormContext } from "react-hook-form";
import type { FieldValues, Path, UseControllerProps } from "react-hook-form";
import type { FocusEvent, ReactNode } from "react";

import type {
  ImageUploaderChangeDetails,
  ImageUploaderItem,
  ImageUploaderProps,
  ImageUploaderRef
} from "@meu/mobile";

export type MeuFormImageUploaderProps<TFieldValues extends FieldValues> = Omit<
  ImageUploaderProps,
  "defaultValue" | "name" | "onBlur" | "onChange" | "ref" | "status" | "value"
> & {
  description?: ReactNode;
  label?: ReactNode;
  name: Path<TFieldValues>;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  onChange?: (items: ImageUploaderItem[], details: ImageUploaderChangeDetails) => void;
  required?: boolean;
  rules?: UseControllerProps<TFieldValues, Path<TFieldValues>>["rules"];
};

export function MeuFormImageUploader<TFieldValues extends FieldValues>({
  description,
  disabled,
  label,
  name,
  onBlur,
  onChange,
  required = false,
  rules,
  ...uploaderProps
}: MeuFormImageUploaderProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>();
  const uploaderRef = useRef<ImageUploaderRef | null>(null);
  const { field, fieldState } = useController({
    control,
    name,
    ...(rules ? { rules } : {})
  });
  const items = Array.isArray(field.value) ? (field.value as ImageUploaderItem[]) : [];

  return (
    <Field
      label={label}
      description={description}
      required={required}
      error={fieldState.error ? fieldState.error.message : undefined}
    >
      <ImageUploader
        {...uploaderProps}
        ref={(handle) => {
          uploaderRef.current = handle;
          field.ref(handle ? handle.input : null);
        }}
        name={field.name}
        disabled={Boolean(disabled || field.disabled)}
        status={fieldState.invalid ? "error" : "default"}
        value={items}
        onChange={(nextItems, details) => {
          field.onChange(nextItems);
          field.onBlur();
          if (onChange) onChange(nextItems, details);
        }}
        onBlur={(event) => {
          field.onBlur();
          if (onBlur) onBlur(event);
        }}
      />
    </Field>
  );
}
