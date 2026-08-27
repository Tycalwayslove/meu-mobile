import type { TextareaHTMLAttributes } from "react";

export type TextAreaAutoSize =
  | boolean
  | {
      maxRows?: number;
      minRows?: number;
    };

export type TextAreaStatus = "default" | "error";
export type TextAreaSize = "small" | "medium" | "large";

export type TextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "children"> & {
  autoSize?: TextAreaAutoSize;
  showCount?: boolean;
  size?: TextAreaSize;
  status?: TextAreaStatus;
};
