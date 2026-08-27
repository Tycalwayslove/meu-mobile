import type { HTMLAttributes, InputHTMLAttributes, ReactNode, Ref } from "react";

export type CheckboxSize = "small" | "medium" | "large";
export type CheckboxStatus = "default" | "error";
export type CheckboxValue = string | number;

export type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "checked" | "children" | "defaultChecked" | "onChange" | "size" | "type" | "value"
> & {
  checked?: boolean;
  children?: ReactNode;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
  size?: CheckboxSize;
  status?: CheckboxStatus;
  value?: CheckboxValue;
};

export type CheckboxGroupProps<TValue extends CheckboxValue = CheckboxValue> = Omit<
  HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onChange"
> & {
  children: ReactNode;
  defaultValue?: TValue[];
  direction?: "horizontal" | "vertical";
  disabled?: boolean;
  name?: string;
  onChange?: (value: TValue[]) => void;
  ref?: Ref<HTMLDivElement>;
  status?: CheckboxStatus;
  value?: TValue[];
};
