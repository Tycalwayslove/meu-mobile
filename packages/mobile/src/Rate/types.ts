import type { InputHTMLAttributes, ReactNode } from "react";

export type RateSize = "small" | "medium" | "large";
export type RateStatus = "default" | "error";

/** Props accepted by {@link Rate}. Native range attributes are forwarded in interactive mode. */
export type RateProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "defaultValue" | "max" | "min" | "onChange" | "size" | "step" | "type" | "value"
> & {
  /** Lets a pointer activation on the current rating clear it to zero. @defaultValue true */
  allowClear?: boolean;
  /** Uses 0.5 rather than 1 as the rating increment. @defaultValue false */
  allowHalf?: boolean;
  /** Decorative glyph rendered for every rating item. It must not contain interactive content. */
  character?: ReactNode;
  /** Positive number of rating items. Non-finite values fall back to 5. @defaultValue 5 */
  count?: number;
  /** Initial value for an uncontrolled rating. It is clamped and aligned to the increment. */
  defaultValue?: number;
  /** Returns localized text announced for the current value. */
  getValueLabel?: (value: number, count: number) => string;
  /** Runs when pointer or keyboard interaction commits a different rating. */
  onChange?: (value: number) => void;
  /** Presents a labelled, non-interactive meter while retaining hidden form value/ref semantics. */
  readOnly?: boolean;
  /** Visual and touch-target size. @defaultValue "medium" */
  size?: RateSize;
  /** Visual validation state. Field errors and `aria-invalid` also activate error styling. */
  status?: RateStatus;
  /** Controlled rating. It is clamped and aligned to the active increment. */
  value?: number;
};
