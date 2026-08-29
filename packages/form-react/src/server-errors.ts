import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

/** @public */
export type MeuFormServerErrors<TFieldValues extends FieldValues> = Partial<
  Record<Path<TFieldValues>, string>
>;

/** @public */
export type ApplyMeuFormErrorsOptions = {
  /**
   * Focuses the first invalid registered field in DOM order after applying server errors.
   *
   * @defaultValue true
   */
  shouldFocusFirst?: boolean;
};

/**
 * Applies server validation messages and focuses the first registered invalid field in DOM order.
 *
 * Import this helper from `@meu/form-react/server` so server-safe code does not cross the client
 * component entry point.
 *
 * @public
 */
export function applyMeuFormErrors<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  errors: MeuFormServerErrors<TFieldValues>,
  options: ApplyMeuFormErrorsOptions = {}
): Path<TFieldValues> | undefined {
  const shouldFocusFirst = options.shouldFocusFirst !== false;
  const invalidFields: Path<TFieldValues>[] = [];

  for (const [field, message] of Object.entries(errors)) {
    if (typeof message === "string" && message.length > 0) {
      const fieldPath = field as Path<TFieldValues>;
      form.setError(fieldPath, { type: "server", message });
      invalidFields.push(fieldPath);
    }
  }

  let firstField = invalidFields[0];
  if (shouldFocusFirst && invalidFields.length > 0 && typeof document !== "undefined") {
    const candidates = new Set<string>(invalidFields);
    const firstControl = Array.from(document.querySelectorAll<HTMLElement>("[name]")).find(
      (element) => candidates.has(element.getAttribute("name") || "")
    );
    const controlName = firstControl ? firstControl.getAttribute("name") : null;
    if (controlName) firstField = controlName as Path<TFieldValues>;
  }

  if (shouldFocusFirst && firstField) form.setFocus(firstField);
  return firstField;
}
