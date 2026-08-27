import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

export type MeuFormServerErrors<TFieldValues extends FieldValues> = Partial<
  Record<Path<TFieldValues>, string>
>;

export function applyMeuFormErrors<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  errors: MeuFormServerErrors<TFieldValues>
): void {
  for (const [field, message] of Object.entries(errors)) {
    if (typeof message === "string" && message.length > 0) {
      form.setError(field as Path<TFieldValues>, { type: "server", message });
    }
  }
}
