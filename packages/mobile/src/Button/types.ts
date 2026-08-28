import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "solid" | "outline" | "ghost" | "text";
export type ButtonTone = "accent" | "neutral" | "danger";
export type ButtonSize = "small" | "medium" | "large";

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  /** Expands the button to the available inline width. @defaultValue false */
  block?: boolean;
  /** Visible button label or composed content. Use IconButton for icon-only actions. */
  children: ReactNode;
  /** Decorative content rendered before the label. */
  leadingIcon?: ReactNode;
  /** Marks the action busy, displays a progress indicator and disables interaction. @defaultValue false */
  loading?: boolean;
  /** Controls the minimum touch target and text scale. @defaultValue "medium" */
  size?: ButtonSize;
  /** Communicates the action emphasis or destructive intent. @defaultValue "accent" */
  tone?: ButtonTone;
  /** Decorative content rendered after the label. */
  trailingIcon?: ReactNode;
  /** Controls visual emphasis without changing native button semantics. @defaultValue "solid" */
  variant?: ButtonVariant;
};
