import type { HTMLAttributes, ReactNode, Ref } from "react";

export type ProgressSize = "small" | "medium" | "large";
export type ProgressTone = "accent" | "success" | "warning" | "danger";

export type ProgressProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  formatValue?: (value: number) => ReactNode;
  indeterminate?: boolean;
  label?: ReactNode;
  ref?: Ref<HTMLDivElement>;
  showValue?: boolean;
  size?: ProgressSize;
  tone?: ProgressTone;
  value?: number;
};
