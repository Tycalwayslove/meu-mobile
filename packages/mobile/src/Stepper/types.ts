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
  "defaultValue" | "onChange" | "size" | "type" | "value"
> & {
  /** Allows an empty draft to commit as `null`. @defaultValue false */
  allowEmpty?: boolean;
  /** Accessible name for the decrement button. Localized by ConfigProvider when omitted. */
  decrementAriaLabel?: string;
  /** Initial uncontrolled value. It is normalized to bounds, step and precision. */
  defaultValue?: number | null;
  /** Accessible name for the increment button. Localized by ConfigProvider when omitted. */
  incrementAriaLabel?: string;
  /** Inclusive upper bound. Reversed bounds are ordered; an off-grid maximum resolves to the last reachable step. */
  max?: number;
  /** Inclusive lower bound. Reversed finite bounds are normalized into ascending order. */
  min?: number;
  /** Runs after a button, keyboard step, or valid typed value commits. */
  onChange?: (value: number | null) => void;
  /** Decimal places used after step alignment. Defaults to the precision implied by step/min. */
  precision?: number;
  /** Visual and touch-target size. @defaultValue "medium" */
  size?: StepperSize;
  /** Visual validation state that emits `aria-invalid="true"`; caller grammar/spelling tokens are otherwise preserved on the spinbutton. */
  status?: StepperStatus;
  /** Positive increment. Invalid values fall back to 1. @defaultValue 1 */
  step?: number;
  /** Controlled value. `null` represents an empty field. */
  value?: number | null;
};
