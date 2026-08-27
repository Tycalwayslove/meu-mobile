import type { HTMLAttributes, ReactNode, Ref } from "react";

export type CardVariant = "outlined" | "filled" | "elevated";
export type CardPadding = "none" | "small" | "medium" | "large";

export type CardProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "onClick" | "title"> & {
  children?: ReactNode;
  description?: ReactNode;
  extra?: ReactNode;
  footer?: ReactNode;
  leading?: ReactNode;
  media?: ReactNode;
  padding?: CardPadding;
  ref?: Ref<HTMLDivElement>;
  title?: ReactNode;
  variant?: CardVariant;
};
