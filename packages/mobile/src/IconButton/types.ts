import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Available control sizes. Every size preserves a 44px minimum target.
 *
 * @public
 */
export type IconButtonSize = "small" | "medium" | "large";

/**
 * Semantic action tones.
 *
 * @public
 */
export type IconButtonTone = "accent" | "neutral" | "danger";

/**
 * Visual emphasis without changing native button semantics.
 *
 * @public
 */
export type IconButtonVariant = "solid" | "outline" | "ghost";

/**
 * Props for an icon-only native action button.
 *
 * @public
 */
export type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-label" | "aria-labelledby" | "children"
> & {
  /** Decorative icon content. Its accessible subtree is hidden because the button owns the name. */
  children: ReactNode;
  /**
   * Marks the action busy, replaces the icon with a progress ring and disables interaction.
   *
   * @defaultValue `false`
   */
  loading?: boolean;
  /**
   * Controls the square control size.
   *
   * @defaultValue `"medium"`
   */
  size?: IconButtonSize;
  /**
   * Communicates action emphasis or destructive intent.
   *
   * @defaultValue `"neutral"`
   */
  tone?: IconButtonTone;
  /**
   * Controls visual emphasis.
   *
   * @defaultValue `"ghost"`
   */
  variant?: IconButtonVariant;
} & (
    | {
        /** Direct accessible name for the icon-only action. */
        "aria-label": string;
        "aria-labelledby"?: never;
      }
    | {
        "aria-label"?: never;
        /** ID of visible or visually hidden text that names the action. */
        "aria-labelledby": string;
      }
  );
