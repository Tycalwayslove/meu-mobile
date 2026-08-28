import type { HTMLAttributes, ReactNode, Ref } from "react";

/** Progress track thickness. @public */
export type ProgressSize = "small" | "medium" | "large";
/** Semantic color treatment. Do not rely on color alone to communicate state. @public */
export type ProgressTone = "accent" | "success" | "warning" | "danger";

/** Props for a determinate or indeterminate progress indicator. @public */
export type ProgressProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Announces value changes politely. Leave false for frequently updating progress. @defaultValue false */
  announce?: boolean;
  /** Formats the adjacent visible value without changing the numeric range. */
  formatValue?: (value: number) => ReactNode;
  /** Omits `aria-valuenow` and renders an ongoing activity treatment. @defaultValue false */
  indeterminate?: boolean;
  /** Visible task label. A localized accessible fallback is used when omitted. */
  label?: ReactNode;
  /** Root element ref. */
  ref?: Ref<HTMLDivElement>;
  /** Shows the formatted determinate value next to the label. @defaultValue false */
  showValue?: boolean;
  /** Track thickness. @defaultValue "medium" */
  size?: ProgressSize;
  /** Semantic color treatment. @defaultValue "accent" */
  tone?: ProgressTone;
  /** Determinate percentage. Non-finite values become 0 and finite values are clamped to 0–100. @defaultValue 0 */
  value?: number;
  /** Accessible value text when the numeric percentage is insufficient. */
  valueText?: string;
};
