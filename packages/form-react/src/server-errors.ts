import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

export type MeuFormServerErrors<TFieldValues extends FieldValues> = Partial<
  Record<Path<TFieldValues>, string>
>;

export type ApplyMeuFormErrorsOptions = {
  shouldFocusFirst?: boolean;
};

export function applyMeuFormErrors<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  errors: MeuFormServerErrors<TFieldValues>,
  options: ApplyMeuFormErrorsOptions = {}
): Path<TFieldValues> | undefined {
  const shouldFocusFirst = options.shouldFocusFirst !== false;
  let firstField: Path<TFieldValues> | undefined;

  for (const [field, message] of Object.entries(errors)) {
    if (typeof message === "string" && message.length > 0) {
      const fieldPath = field as Path<TFieldValues>;
      const shouldFocus = shouldFocusFirst && firstField === undefined;
      form.setError(fieldPath, { type: "server", message }, { shouldFocus });
      if (firstField === undefined) {
        firstField = fieldPath;
      }
    }
  }

  return firstField;
}
