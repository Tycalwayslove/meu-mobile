import type { HTMLAttributes, ReactNode, Ref, RefObject } from "react";

import type { MaskOpacity } from "../Mask";
import type { OverlayContainer } from "../overlayTypes";

export type DialogActionTone = "neutral" | "accent" | "danger";
export type DialogActionLayout = "auto" | "horizontal" | "vertical";

export type DialogAction = {
  autoFocus?: boolean;
  closeOnPress?: boolean;
  disabled?: boolean;
  key: string;
  label: ReactNode;
  onPress?: () => boolean | void | Promise<boolean | void>;
  tone?: DialogActionTone;
};

export type DialogOpenChangeDetails =
  { reason: "escape" } | { reason: "mask" } | { actionKey: string; reason: "action" };

type DialogSemantics =
  { description: ReactNode; role?: "alertdialog" } | { description?: ReactNode; role: "dialog" };

type DialogBaseProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  | "aria-describedby"
  | "aria-label"
  | "aria-labelledby"
  | "children"
  | "dangerouslySetInnerHTML"
  | "role"
  | "title"
> & {
  actionLayout?: DialogActionLayout;
  actions: ReadonlyArray<DialogAction>;
  children?: ReactNode;
  closeOnEscape?: boolean;
  closeOnMaskClick?: boolean;
  container?: OverlayContainer;
  defaultOpen?: boolean;
  forceMount?: boolean;
  lockScroll?: boolean;
  maskOpacity?: MaskOpacity;
  onActionError?: (error: unknown, action: DialogAction) => void;
  onOpenChange?: (open: boolean, details: DialogOpenChangeDetails) => void;
  open?: boolean;
  ref?: Ref<HTMLDivElement>;
  restoreFocus?: boolean;
  returnFocusRef?: RefObject<HTMLElement | null>;
  title: ReactNode;
};

export type DialogProps = DialogBaseProps & DialogSemantics;

type WithoutOpenState<T> = T extends unknown
  ? Omit<T, "defaultOpen" | "onOpenChange" | "open">
  : never;

export type DialogShowOptions = WithoutOpenState<DialogProps>;

export type DialogController = {
  close: () => void;
};

type DialogPromptBase = Omit<
  Extract<DialogShowOptions, { description: ReactNode; role?: "alertdialog" }>,
  "actions" | "role"
>;

export type DialogAlertOptions = DialogPromptBase & {
  confirmText?: ReactNode;
  onConfirm?: () => boolean | void | Promise<boolean | void>;
};

export type DialogConfirmOptions = DialogPromptBase & {
  cancelText?: ReactNode;
  confirmText?: ReactNode;
  confirmTone?: "accent" | "danger";
  onCancel?: () => boolean | void | Promise<boolean | void>;
  onConfirm?: () => boolean | void | Promise<boolean | void>;
};

export type DialogApi = {
  alert: (options: DialogAlertOptions) => Promise<void>;
  clear: () => void;
  confirm: (options: DialogConfirmOptions) => Promise<boolean>;
  show: (options: DialogShowOptions) => DialogController;
};

export type DialogProviderProps = {
  children: ReactNode;
};
