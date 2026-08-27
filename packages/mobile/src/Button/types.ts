import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "solid" | "outline" | "ghost" | "text";
export type ButtonTone = "accent" | "neutral" | "danger";
export type ButtonSize = "small" | "medium" | "large";

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  block?: boolean;
  children: ReactNode;
  leadingIcon?: ReactNode;
  loading?: boolean;
  size?: ButtonSize;
  tone?: ButtonTone;
  trailingIcon?: ReactNode;
  variant?: ButtonVariant;
};
