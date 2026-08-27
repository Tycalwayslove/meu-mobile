import type { HTMLAttributes, ReactNode, Ref } from "react";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger";

export type BadgeProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  "children" | "content" | "dangerouslySetInnerHTML"
> & {
  bordered?: boolean;
  children?: ReactNode;
  content?: ReactNode;
  dot?: boolean;
  label?: string;
  max?: number;
  offset?: readonly [x: number, y: number];
  ref?: Ref<HTMLSpanElement>;
  showZero?: boolean;
  tone?: BadgeTone;
};
