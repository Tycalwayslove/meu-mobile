import type { HTMLAttributes, MouseEventHandler, ReactNode, Ref } from "react";

export type TagTone = "neutral" | "accent" | "success" | "warning" | "danger";
export type TagVariant = "solid" | "soft" | "outline";
export type TagSize = "small" | "medium" | "large";
export type TagRef = HTMLSpanElement | HTMLButtonElement;

export type TagProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  "children" | "dangerouslySetInnerHTML" | "onClick"
> & {
  children: ReactNode;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  ref?: Ref<TagRef>;
  rounded?: boolean;
  size?: TagSize;
  tone?: TagTone;
  variant?: TagVariant;
};
