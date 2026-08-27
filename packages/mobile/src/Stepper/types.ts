import type { InputHTMLAttributes } from "react";

export type StepperSize = "small" | "medium" | "large";
export type StepperStatus = "default" | "error";

export type StepperProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "defaultValue" | "onChange" | "size" | "type" | "value"
> & {
  allowEmpty?: boolean;
  decrementAriaLabel?: string;
  defaultValue?: number | null;
  incrementAriaLabel?: string;
  max?: number;
  min?: number;
  onChange?: (value: number | null) => void;
  precision?: number;
  size?: StepperSize;
  status?: StepperStatus;
  step?: number;
  value?: number | null;
};
