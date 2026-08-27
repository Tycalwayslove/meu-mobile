import type { InputHTMLAttributes } from "react";

export type SearchFieldSize = "small" | "medium" | "large";
export type SearchFieldStatus = "default" | "error";

export type SearchFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "defaultValue" | "onChange" | "size" | "type" | "value"
> & {
  clearable?: boolean;
  defaultValue?: string;
  loading?: boolean;
  onChange?: (value: string) => void;
  onClear?: () => void;
  onSearch?: (value: string) => void;
  size?: SearchFieldSize;
  status?: SearchFieldStatus;
  value?: string;
};
