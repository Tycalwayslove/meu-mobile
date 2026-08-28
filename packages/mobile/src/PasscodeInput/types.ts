import type { InputHTMLAttributes } from "react";

import type { NumberKeyboardProps } from "../NumberKeyboard";

export type PasscodeInputDirection = "ltr" | "rtl";
export type PasscodeInputStatus = "default" | "error";
export type PasscodeInputChangeSource = "delete" | "keyboard" | "native";

export type PasscodeInputChangeDetails = {
  source: PasscodeInputChangeSource;
};

export type PasscodeInputKeyboardOptions = Omit<
  NumberKeyboardProps,
  | "aria-label"
  | "aria-labelledby"
  | "defaultOpen"
  | "id"
  | "onConfirm"
  | "onDelete"
  | "onInput"
  | "onOpenChange"
  | "open"
  | "ref"
  | "title"
> & {
  closeOnComplete?: boolean;
  keyboardAriaLabel?: string;
  onConfirm?: (value: string) => void;
  title?: string;
};

export type PasscodeInputRef = {
  blur: () => void;
  focus: () => void;
  input: HTMLInputElement | null;
};

export type PasscodeInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "defaultValue" | "dir" | "onChange" | "size" | "type" | "value"
> & {
  caret?: boolean;
  defaultValue?: string;
  direction?: PasscodeInputDirection;
  keyboard?: PasscodeInputKeyboardOptions;
  length?: number;
  mask?: boolean;
  onChange?: (value: string, details: PasscodeInputChangeDetails) => void;
  onComplete?: (value: string) => void;
  separated?: boolean;
  status?: PasscodeInputStatus;
  value?: string;
};
