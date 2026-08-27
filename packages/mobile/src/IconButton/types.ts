import type { ButtonHTMLAttributes, ReactNode } from "react";

export type IconButtonSize = "small" | "medium" | "large";
export type IconButtonTone = "accent" | "neutral" | "danger";
export type IconButtonVariant = "solid" | "outline" | "ghost";

export type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-label" | "children"
> & {
  "aria-label": string;
  children: ReactNode;
  loading?: boolean;
  size?: IconButtonSize;
  tone?: IconButtonTone;
  variant?: IconButtonVariant;
};
