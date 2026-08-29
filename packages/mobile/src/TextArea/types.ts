import type { TextareaHTMLAttributes } from "react";

/**
 * Enables content-driven height, optionally bounded by positive row counts.
 *
 * @public
 */
export type TextAreaAutoSize =
  | boolean
  | {
      /** Maximum visible rows before the textarea scrolls. Values below `minRows` are clamped. */
      maxRows?: number;
      /** Minimum visible rows. Non-positive values are ignored. */
      minRows?: number;
    };

/**
 * Validation presentation for TextArea.
 *
 * @public
 */
export type TextAreaStatus = "default" | "error";

/**
 * Visual density and default non-autosize height.
 *
 * @public
 */
export type TextAreaSize = "small" | "medium" | "large";

/**
 * Props for the native Meu Mobile multiline text field.
 *
 * @public
 */
export type TextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "children"> & {
  /** Enables content-driven height and optional row bounds. @defaultValue false */
  autoSize?: TextAreaAutoSize;
  /** Shows a non-live UTF-16 code-unit count associated through `aria-describedby`. */
  showCount?: boolean;
  /** Controls padding, type size, and the default fixed minimum height. @defaultValue "medium" */
  size?: TextAreaSize;
  /** Applies error styling and `aria-invalid="true"`; caller grammar/spelling tokens are otherwise preserved. @defaultValue "default" */
  status?: TextAreaStatus;
};
