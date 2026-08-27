import type { HTMLAttributes, ReactNode, Ref } from "react";

export type SelectorSize = "small" | "medium" | "large";
export type SelectorStatus = "default" | "error";
export type SelectorValue = string | number;

export type SelectorOption<TValue extends SelectorValue = SelectorValue> = {
  description?: ReactNode;
  disabled?: boolean;
  label: ReactNode;
  value: TValue;
};

export type SelectorProps<TValue extends SelectorValue = SelectorValue> = Omit<
  HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onChange"
> & {
  allowClear?: boolean;
  columns?: number;
  defaultValue?: TValue[];
  disabled?: boolean;
  multiple?: boolean;
  name?: string;
  onChange?: (value: TValue[], options: SelectorOption<TValue>[]) => void;
  options: SelectorOption<TValue>[];
  ref?: Ref<HTMLDivElement>;
  required?: boolean;
  showCheckMark?: boolean;
  size?: SelectorSize;
  status?: SelectorStatus;
  value?: TValue[];
};
