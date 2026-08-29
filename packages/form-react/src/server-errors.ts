import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

import { firstFieldInMeuForm, getMeuFormRoot } from "./form-root-registry";

const appliedServerFields = new WeakMap<object, Set<string>>();

/** @public */
export type MeuFormServerErrors<TFieldValues extends FieldValues> = Partial<
  Record<Path<TFieldValues>, string>
>;

/** @public */
export type ApplyMeuFormErrorsOptions = {
  /** Clears server errors written by the previous call before applying this response. @defaultValue true */
  clearPrevious?: boolean;
  /**
   * Focuses the first invalid registered field in DOM order after applying server errors.
   *
   * @defaultValue true
   */
  shouldFocusFirst?: boolean;
};

/**
 * Applies server validation messages and focuses the first registered invalid field in the owning
 * MeuForm's DOM order.
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
  const clearPrevious = options.clearPrevious !== false;
  const previousFields = appliedServerFields.get(form);
  if (clearPrevious && previousFields) {
    for (const field of previousFields) {
      const fieldPath = field as Path<TFieldValues>;
      const currentError = form.getFieldState(fieldPath).error;
      if (currentError && currentError.type === "server") form.clearErrors(fieldPath);
    }
  }
  const invalidFields: Path<TFieldValues>[] = [];
  const trackedFields = clearPrevious ? new Set<string>() : new Set(previousFields);

  for (const [field, message] of Object.entries(errors)) {
    if (typeof message === "string" && message.length > 0) {
      const fieldPath = field as Path<TFieldValues>;
      form.setError(fieldPath, { type: "server", message });
      invalidFields.push(fieldPath);
      trackedFields.add(fieldPath);
    }
  }
  appliedServerFields.set(form, trackedFields);

  let firstField = invalidFields[0];
  if (shouldFocusFirst && invalidFields.length > 0) {
    const controlName = firstFieldInMeuForm(form, new Set(invalidFields));
    if (controlName) firstField = controlName as Path<TFieldValues>;
    else if (getMeuFormRoot(form)) firstField = undefined;
  }

  if (shouldFocusFirst && firstField) form.setFocus(firstField);
  return firstField;
}
