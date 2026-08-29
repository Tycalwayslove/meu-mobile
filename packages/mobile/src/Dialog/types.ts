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
  /** Prefers this enabled action for initial focus; the first preferred action wins. */
  autoFocus?: boolean;
  /** Keeps the dialog open after a successful action when set to `false`. @defaultValue true */
  closeOnPress?: boolean;
  /** Disables activation and excludes the action from initial-focus selection. */
  disabled?: boolean;
  /** Unique, stable identity used for rendering, pending state, and close details. */
  key: string;
  /** Visible action label. */
  label: ReactNode;
  /**
   * Runs at most once while any action is pending. Returning `false` or rejecting keeps the
   * dialog open; rejection is reported through `onActionError` when supplied.
   */
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
  /**
   * Portal target; `null` renders in place. When a resolver starts returning another target,
   * pass a new resolver identity so focus trapping rebinds to the moved panel.
   */
  container?: OverlayContainer;
  /** Initial uncontrolled visibility. @defaultValue false */
  defaultOpen?: boolean;
  /** Keeps a closed dialog mounted and inaccessible. @defaultValue false */
  forceMount?: boolean;
  /** Locks document scrolling while open. @defaultValue true */
  lockScroll?: boolean;
  /** Backdrop opacity. @defaultValue "default" */
  maskOpacity?: MaskOpacity;
  /**
   * Receives a current action's rejection while the dialog stays open. Without this callback,
   * the component contains the rejection instead of creating an unhandled promise.
   */
  onActionError?: (error: unknown, action: DialogAction) => void;
  /** Reports user-originated close requests with their exact source. */
  onOpenChange?: (open: boolean, details: DialogOpenChangeDetails) => void;
  /** Controlled visibility; close interactions only call `onOpenChange`. */
  open?: boolean;
  /** Ref to the dialog panel. */
  ref?: Ref<HTMLDivElement>;
  /** Restores focus after closing. @defaultValue true */
  restoreFocus?: boolean;
  /** Explicit focus restoration target; disconnected targets are ignored. */
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
  /** Idempotently closes this imperative dialog. */
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
  /**
   * Opens a one-action alert. A mounted provider resolves it after committing the closed state;
   * provider unmount resolves it during cleanup. Exit DOM removal may finish later.
   */
  alert: (options: DialogAlertOptions) => Promise<void>;
  /** Closes every imperative dialog owned by this provider. */
  clear: () => void;
  /**
   * Opens a confirmation dialog. It resolves `true` only after confirmation; cancellation,
   * dismissal, clearing, and provider unmount resolve `false`. A mounted provider commits the
   * closed state before resolving; exit DOM removal may finish later.
   */
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
