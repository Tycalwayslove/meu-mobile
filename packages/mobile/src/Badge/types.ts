import type { HTMLAttributes, ReactNode, Ref } from "react";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger";

export type BadgeProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  "children" | "content" | "dangerouslySetInnerHTML"
> & {
  /** Draws a surface-colored separator around an overlaid marker. @defaultValue false */
  bordered?: boolean;
  /** Optional anchor content. Without children, the badge renders inline. */
  children?: ReactNode;
  /** Count or short status content. Numeric values are truncated, clamped to zero, and participate in max/zero handling. */
  content?: ReactNode;
  /** Renders a compact status dot and hides content. @defaultValue false */
  dot?: boolean;
  /** Accessible meaning for a dot or replacement name for count content. */
  label?: string;
  /** Numeric overflow threshold. Finite values are truncated and clamped to zero. */
  max?: number;
  /** Logical inline/end and block/start marker offsets in CSS pixels. Non-finite values become zero. */
  offset?: readonly [x: number, y: number];
  /** Ref to the stable badge wrapper. */
  ref?: Ref<HTMLSpanElement>;
  /** Keeps numeric zero visible. @defaultValue false */
  showZero?: boolean;
  /** Semantic visual tone. Meaningful statuses still require text or `label`. @defaultValue "danger" */
  tone?: BadgeTone;
};
