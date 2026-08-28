import type { HTMLAttributes, ReactNode, Ref, RefObject } from "react";

import type { MaskOpacity } from "../Mask";
import type { OverlayContainer } from "../overlayTypes";

/** Semantic and visual emphasis for a dialog action. */
export type DialogActionTone = "neutral" | "accent" | "danger";
/** Dialog action arrangement. `auto` stacks three or more actions. */
export type DialogActionLayout = "auto" | "horizontal" | "vertical";

export type DialogAction = {
  /** Prefers this enabled action as the initial focus target. */
  autoFocus?: boolean;
  /** Set false to keep the dialog open after success. @defaultValue true */
  closeOnPress?: boolean;
  /** Disables activation. */
  disabled?: boolean;
  /** Stable action identity used in events and rendering. */
  key: string;
  /** Visible action label. */
  label: ReactNode;
  /** Runs once; false or rejection keeps the dialog open. */
  onPress?: () => boolean | void | Promise<boolean | void>;
  /** Action tone. @defaultValue "neutral" */
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
  /** Action arrangement. @defaultValue "auto" */
  actionLayout?: DialogActionLayout;
  /** Native-button actions; keys must be unique. */
  actions: ReadonlyArray<DialogAction>;
  /** Optional interactive or supporting body. */
  children?: ReactNode;
  /** Enables Escape dismissal. @defaultValue true */
  closeOnEscape?: boolean;
  /** Enables backdrop dismissal. @defaultValue false */
  closeOnMaskClick?: boolean;
  /** Portal target; `null` renders in place. */
  container?: OverlayContainer;
  /** Initial uncontrolled visibility. @defaultValue false */
  defaultOpen?: boolean;
  /** Keeps a closed dialog mounted and inaccessible. @defaultValue false */
  forceMount?: boolean;
  /** Locks document scrolling while open. @defaultValue true */
  lockScroll?: boolean;
  /** Backdrop opacity. @defaultValue "default" */
  maskOpacity?: MaskOpacity;
  /** Receives rejected action errors. */
  onActionError?: (error: unknown, action: DialogAction) => void;
  /** Reports dismissal and successful action requests. */
  onOpenChange?: (open: boolean, details: DialogOpenChangeDetails) => void;
  /** Controlled visibility. */
  open?: boolean;
  /** Ref to the dialog panel. */
  ref?: Ref<HTMLDivElement>;
  /** Restores focus after closing. @defaultValue true */
  restoreFocus?: boolean;
  /** Explicit focus restoration target. */
  returnFocusRef?: RefObject<HTMLElement | null>;
  /** Required visible title and accessible name. */
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
