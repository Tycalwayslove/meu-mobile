import type { ChangeEvent, InputHTMLAttributes, ReactNode } from "react";

export type SliderSize = "small" | "medium" | "large";
export type SliderStatus = "default" | "error";
export type SliderMark = { label?: ReactNode; value: number };

export type SliderProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "defaultValue" | "max" | "min" | "onChange" | "size" | "step" | "type" | "value"
> & {
  defaultValue?: number;
  formatValue?: (value: number) => ReactNode;
  marks?: SliderMark[];
  max?: number;
  min?: number;
  onChange?: (value: number, event: ChangeEvent<HTMLInputElement>) => void;
  onChangeComplete?: (value: number, event: ChangeEvent<HTMLInputElement>) => void;
  showValue?: boolean;
  size?: SliderSize;
  status?: SliderStatus;
  step?: number;
  value?: number;
};
