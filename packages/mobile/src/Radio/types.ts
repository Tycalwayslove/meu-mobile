import type { HTMLAttributes, InputHTMLAttributes, ReactNode, Ref } from "react";

export type RadioSize = "small" | "medium" | "large";
export type RadioStatus = "default" | "error";
export type RadioValue = string | number;

export type RadioProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "checked" | "children" | "defaultChecked" | "onChange" | "size" | "type" | "value"
> & {
  checked?: boolean;
  children?: ReactNode;
  defaultChecked?: boolean;
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
  size?: RadioSize;
  status?: RadioStatus;
  value?: RadioValue;
};

export type RadioGroupProps<TValue extends RadioValue = RadioValue> = Omit<
  HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onChange"
> & {
  children: ReactNode;
  defaultValue?: TValue;
  direction?: "horizontal" | "vertical";
  disabled?: boolean;
  name?: string;
  onChange?: (value: TValue, event: React.ChangeEvent<HTMLInputElement>) => void;
  ref?: Ref<HTMLDivElement>;
  required?: boolean;
  status?: RadioStatus;
  value?: TValue | null;
};
