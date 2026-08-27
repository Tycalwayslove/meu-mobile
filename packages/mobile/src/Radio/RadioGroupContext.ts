import { createContext, useContext } from "react";
import type { ChangeEvent } from "react";

import type { RadioStatus, RadioValue } from "./types";

export type RadioGroupContextValue = {
  disabled: boolean;
  isSelected: (value: RadioValue) => boolean;
  name: string;
  required: boolean;
  select: (value: RadioValue, event: ChangeEvent<HTMLInputElement>) => void;
  status: RadioStatus;
};

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export function useRadioGroupContext(): RadioGroupContextValue | null {
  return useContext(RadioGroupContext);
}
