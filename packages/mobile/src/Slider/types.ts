import type { ChangeEvent, InputHTMLAttributes, ReactNode } from "react";

/**
 * Visual and touch-target size for Slider.
 *
 * @public
 */
export type SliderSize = "small" | "medium" | "large";
/**
 * Visual validation state for Slider.
 *
 * @public
 */
export type SliderStatus = "default" | "error";

/**
 * A decorative label anchored to one value on the slider track.
 *
 * @public
 */
export type SliderMark = {
  /** Optional visual label. Marks are presentation-only and are not announced as choices. */
  label?: ReactNode;
  /** Numeric position. Values outside the effective min/max range are not rendered. */
  value: number;
};

/**
 * Props accepted by {@link Slider}. Native range attributes are forwarded unless specialized here.
 *
 * @public
 */
export type SliderProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "defaultValue" | "max" | "min" | "onChange" | "readOnly" | "size" | "step" | "type" | "value"
> & {
  /** Initial value for an uncontrolled slider. It is clamped and snapped to the effective step. */
  defaultValue?: number;
  /** Formats the optional visual value output. It does not replace the slider's accessible value. */
  formatValue?: (value: number) => ReactNode;
  /** Decorative track marks. */
  marks?: SliderMark[];
  /** Upper bound. Reversed bounds are ordered; an off-grid maximum resolves to the last reachable step. @defaultValue 100 */
  max?: number;
  /** Lower bound. Reversed finite bounds are normalized into ascending order. @defaultValue 0 */
  min?: number;
  /** Runs for every committed native range change. */
  onChange?: (value: number, event: ChangeEvent<HTMLInputElement>) => void;
  /** Runs once when a pointer or value-changing keyboard interaction finishes. */
  onChangeComplete?: (value: number, event: ChangeEvent<HTMLInputElement>) => void;
  /** Presents a labelled, non-interactive meter while retaining a hidden native form value and input ref. @defaultValue false */
  readOnly?: boolean;
  /** Shows the current formatted value beside the track. @defaultValue false */
  showValue?: boolean;
  /** Visual and touch-target size. @defaultValue "medium" */
  size?: SliderSize;
  /** Visual validation state that emits `aria-invalid="true"`; caller grammar/spelling tokens are otherwise preserved on the native range. */
  status?: SliderStatus;
  /** Positive numeric increment. Invalid values fall back to 1. @defaultValue 1 */
  step?: number;
  /** Controlled value. It is clamped and snapped before rendering. */
  value?: number;
};
