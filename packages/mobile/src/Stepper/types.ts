import type { InputHTMLAttributes } from "react";

/**
 * Visual and touch-target size for Stepper.
 *
 * @public
 */
export type StepperSize = "small" | "medium" | "large";
/**
 * Visual validation state for Stepper.
 *
 * @public
 */
export type StepperStatus = "default" | "error";

/**
 * Props accepted by {@link Stepper}.
 *
 * @public
 */
export type StepperProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "defaultValue" | "disabled" | "inputMode" | "onChange" | "readOnly" | "size" | "type" | "value"
> & {
  /** Allows an empty draft to commit as `null`. @defaultValue false */
  allowEmpty?: boolean;
  /** Accessible name for the decrement button. Localized by ConfigProvider when omitted. */
  decrementAriaLabel?: string;
  /** Initial uncontrolled value. It is normalized to bounds, step and precision. */
  defaultValue?: number | null;
  /** Disables the input and both buttons; disabled values do not enter FormData. @defaultValue false */
  disabled?: boolean;
  /** Accessible name for the increment button. Localized by ConfigProvider when omitted. */
  incrementAriaLabel?: string;
  /** Soft-keyboard hint for the native text input. @defaultValue "decimal" */
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  /** Inclusive upper bound. Reversed bounds are ordered; an off-grid maximum resolves to the last reachable step. */
  max?: number;
  /** Inclusive lower bound. Reversed finite bounds are normalized into ascending order. */
  min?: number;
  /** Runs after a button, keyboard step, long-press tick, or valid typed value commits. */
  onChange?: (value: number | null) => void;
  /**
   * Decimal places used after step alignment. A value below the precision required by `step` or
   * `min` is promoted so repeated stepping cannot stall; values above 12 are capped and non-finite
   * values fall back to inferred precision.
   */
  precision?: number;
  /** Keeps the value selectable and serializable while blocking typing and every step control. @defaultValue false */
  readOnly?: boolean;
  /** Repeats the pressed step after 500 ms, then every 100 ms until release or cancellation. @defaultValue false */
  repeatOnLongPress?: boolean;
  /** Visual and touch-target size. @defaultValue "medium" */
  size?: StepperSize;
  /** Visual validation state that emits `aria-invalid="true"`; caller grammar/spelling tokens are otherwise preserved on the spinbutton. */
  status?: StepperStatus;
  /** Positive increment. Invalid values fall back to 1. @defaultValue 1 */
  step?: number;
  /** Controlled value. `null` represents an empty field. */
  value?: number | null;
};
