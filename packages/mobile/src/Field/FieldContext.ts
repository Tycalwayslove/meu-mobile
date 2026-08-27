import { createContext, useContext } from "react";

export type FieldContextValue = {
  controlId: string;
  describedBy: string | undefined;
  invalid: boolean;
  labelId: string | undefined;
};

export const FieldContext = createContext<FieldContextValue | null>(null);

export function useFieldContext(): FieldContextValue | null {
  return useContext(FieldContext);
}
