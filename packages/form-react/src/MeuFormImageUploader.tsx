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

/**
 * Props for an image uploader whose item array is stored in React Hook Form.
 *
 * @public
 */
export type MeuFormImageUploaderProps<TFieldValues extends FieldValues> = Omit<
  ImageUploaderProps,
  "defaultValue" | "name" | "onBlur" | "onChange" | "ref" | "status" | "value"
> & {
  /** Supporting content rendered with the field and associated with the uploader. */
  description?: ReactNode;
  /** Visible field label rendered by the surrounding `Field`. */
  label?: ReactNode;
  /** React Hook Form field path that stores the current uploader item array. */
  name: Path<TFieldValues>;
  /** Called after React Hook Form marks the field as touched; receives the file input blur event. */
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  /** Called after the form value and touched state update; receives all items and change details. */
  onChange?: (items: ImageUploaderItem[], details: ImageUploaderChangeDetails) => void;
  /** Shows the required affordance; enforce required validation through `rules` when needed. */
  required?: boolean;
  /** React Hook Form validation and value-processing rules registered for this field. */
  rules?: UseControllerProps<TFieldValues, Path<TFieldValues>>["rules"];
};

/**
 * Binds an image uploader's items, validation state, and input ref to React Hook Form.
 *
 * @public
 */
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
