import type { InputHTMLAttributes, ReactNode } from "react";

export type RateSize = "small" | "medium" | "large";
export type RateStatus = "default" | "error";

export type RateProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "defaultValue" | "max" | "min" | "onChange" | "size" | "step" | "type" | "value"
> & {
  allowClear?: boolean;
  allowHalf?: boolean;
  character?: ReactNode;
  count?: number;
  defaultValue?: number;
  getValueLabel?: (value: number, count: number) => string;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: RateSize;
  status?: RateStatus;
  value?: number;
};
