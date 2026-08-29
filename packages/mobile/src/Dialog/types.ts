import type { HTMLAttributes, ReactNode, Ref, RefObject } from "react";

import type { MaskOpacity } from "../Mask";
import type { OverlayContainer } from "../overlayTypes";

/**
 * Semantic and visual emphasis for a dialog action.
 *
 * @public
 */
export type DialogActionTone = "neutral" | "accent" | "danger";
/**
 * Dialog action arrangement. `auto` stacks three or more actions.
 *
 * @public
 */
export type DialogActionLayout = "auto" | "horizontal" | "vertical";

/**
 * One native-button action displayed by {@link Dialog}.
 *
 * @public
 */
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

/**
 * Details reported when a dialog requests dismissal.
 *
 * @public
 */
export type DialogOpenChangeDetails =
  | {
      /** Indicates that Escape requested dismissal. */
      reason: "escape";
    }
  | {
      /** Indicates that the backdrop requested dismissal. */
      reason: "mask";
    }
  | {
      /** Key of the action that completed before dismissal. */
      actionKey: string;
      /** Indicates that an action requested dismissal. */
      reason: "action";
    };

type DialogSemantics =
  | {
      /** Required alert message announced with the title when the dialog opens. */
      description: ReactNode;
      /** Uses interruptive alert-dialog semantics. @defaultValue "alertdialog" */
      role?: "alertdialog";
    }
  | {
      /** Optional supporting content linked with `aria-describedby`. */
      description?: ReactNode;
      /** Uses standard dialog semantics for interactive or non-urgent content. */
      role: "dialog";
    };

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

/**
 * Props accepted by {@link Dialog}.
 *
 * @public
 */
export type DialogProps = DialogBaseProps & DialogSemantics;

type WithoutOpenState<T> = T extends unknown
  ? Omit<T, "defaultOpen" | "onOpenChange" | "open">
  : never;

/**
 * Options accepted by {@link DialogApi.show}.
 *
 * @public
 */
export type DialogShowOptions = WithoutOpenState<DialogProps>;

/**
 * Handle returned for one imperative dialog instance.
 *
 * @public
 */
export type DialogController = {
  /** Closes this imperative dialog. */
  close: () => void;
};

type DialogPromptBase = Omit<
  Extract<DialogShowOptions, { description: ReactNode; role?: "alertdialog" }>,
  "actions" | "role"
>;

/**
 * Options accepted by {@link DialogApi.alert}.
 *
 * @public
 */
export type DialogAlertOptions = DialogPromptBase & {
  /** Confirm-button content. Defaults to localized “OK” text. */
  confirmText?: ReactNode;
  /** Runs before resolution; returning `false` or rejecting keeps the alert open. */
  onConfirm?: () => boolean | void | Promise<boolean | void>;
};

/**
 * Options accepted by {@link DialogApi.confirm}.
 *
 * @public
 */
export type DialogConfirmOptions = DialogPromptBase & {
  /** Cancel-button content. Defaults to localized “Cancel” text. */
  cancelText?: ReactNode;
  /** Confirm-button content. Defaults to localized “Confirm” text. */
  confirmText?: ReactNode;
  /** Semantic and visual emphasis for the confirm action. @defaultValue "accent" */
  confirmTone?: "accent" | "danger";
  /** Runs before cancellation; returning `false` or rejecting keeps the dialog open. */
  onCancel?: () => boolean | void | Promise<boolean | void>;
  /** Runs before confirmation; returning `false` or rejecting keeps the dialog open. */
  onConfirm?: () => boolean | void | Promise<boolean | void>;
};

/**
 * Imperative dialog API exposed by {@link useDialog}.
 *
 * @public
 */
export type DialogApi = {
  /** Opens a one-action alert and resolves after confirmation or dismissal. */
  alert: (options: DialogAlertOptions) => Promise<void>;
  /** Closes every imperative dialog owned by this provider. */
  clear: () => void;
  /** Opens a confirmation dialog and resolves `true` only after a successful confirm action. */
  confirm: (options: DialogConfirmOptions) => Promise<boolean>;
  /** Opens an imperative dialog and returns a controller for that instance. */
  show: (options: DialogShowOptions) => DialogController;
};

/**
 * Props accepted by {@link DialogProvider}.
 *
 * @public
 */
export type DialogProviderProps = {
  /** Application subtree that receives the imperative dialog API. */
  children: ReactNode;
};
