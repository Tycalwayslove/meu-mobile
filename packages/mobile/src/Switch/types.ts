import type { InputHTMLAttributes } from "react";

export type SwitchSize = "small" | "medium" | "large";
export type SwitchStatus = "default" | "error";

export type SwitchProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "checked" | "children" | "defaultChecked" | "onChange" | "size" | "type"
> & {
  checked?: boolean;
  defaultChecked?: boolean;
  loading?: boolean;
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
  size?: SwitchSize;
  status?: SwitchStatus;
};
