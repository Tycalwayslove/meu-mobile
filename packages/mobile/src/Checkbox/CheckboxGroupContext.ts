import { createContext, useContext } from "react";

import type { CheckboxStatus, CheckboxValue } from "./types";

export type CheckboxGroupContextValue = {
  disabled: boolean;
  isSelected: (value: CheckboxValue) => boolean;
  name: string | undefined;
  status: CheckboxStatus;
  toggle: (value: CheckboxValue, checked: boolean) => void;
};

export const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null);

export function useCheckboxGroupContext(): CheckboxGroupContextValue | null {
  return useContext(CheckboxGroupContext);
}
