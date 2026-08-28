import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode, Ref } from "react";

import type { OverlayContainer } from "../overlayTypes";

export type NumberKeyboardMode = "number" | "decimal";
export type NumberKeyboardInputSource = "digit" | "decimal" | "extra";
export type NumberKeyboardOpenChangeReason = "close-button" | "confirm" | "escape";

export type NumberKeyboardInputDetails = {
  source: NumberKeyboardInputSource;
};

export type NumberKeyboardDeleteDetails = {
  repeated: boolean;
};

export type NumberKeyboardOpenChangeDetails = {
  reason: NumberKeyboardOpenChangeReason;
};

export type NumberKeyboardExtraKey = {
  ariaLabel?: string;
  disabled?: boolean;
  label: ReactNode;
  value: string;
};

export type NumberKeyboardTriggerStatus = "default" | "error";

export type NumberKeyboardTriggerProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-required" | "children" | "value"
> & {
  open?: boolean;
  placeholder?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
  status?: NumberKeyboardTriggerStatus;
  value?: ReactNode;
};

export type NumberKeyboardProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "onInput" | "onMouseDown" | "role" | "title"
> & {
  backspaceLabel?: string;
  closeLabel?: string;
  closeOnConfirm?: boolean;
  closeOnEscape?: boolean;
  confirmDisabled?: boolean;
  confirmLabel?: string | null;
  container?: OverlayContainer;
  defaultOpen?: boolean;
  deleteRepeat?: boolean;
  disabled?: boolean;
  extraKey?: NumberKeyboardExtraKey | null;
  forceMount?: boolean;
  mode?: NumberKeyboardMode;
  onConfirm?: () => void;
  onDelete?: (details: NumberKeyboardDeleteDetails) => void;
  onInput?: (value: string, details: NumberKeyboardInputDetails) => void;
  onOpenChange?: (open: boolean, details: NumberKeyboardOpenChangeDetails) => void;
  open?: boolean;
  randomOrder?: boolean;
  ref?: Ref<HTMLDivElement>;
  safeArea?: boolean;
  showCloseButton?: boolean;
  title?: string;
};
