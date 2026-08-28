import { createContext, useContext } from "react";

/** Accessibility state shared by Field-aware controls. */
export type FieldContextValue = {
  /** Stable id assigned to the field's primary control. */
  controlId: string;
  /** Space-separated ids for Field description and validation feedback. */
  describedBy: string | undefined;
  /** Whether the field currently fails validation. */
  invalid: boolean;
  /** Id of the visible label, used by composite controls through `aria-labelledby`. */
  labelId: string | undefined;
  /** Whether user input is required before submission. */
  required: boolean;
};

export const FieldContext = createContext<FieldContextValue | null>(null);

/** Returns the nearest Field accessibility state, or `null` outside a Field. */
export function useFieldContext(): FieldContextValue | null {
  return useContext(FieldContext);
}
