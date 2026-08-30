import type { HTMLAttributes, ReactNode, Ref, RefObject } from "react";

import type { MaskOpacity } from "../Mask";
import type { OverlayContainer } from "../overlayTypes";

/**
 * Semantic emphasis applied to an action-menu item.
 *
 * @public
 */
export type ActionMenuActionTone = "neutral" | "danger";

/**
 * Copy used by an action's confirmation dialog.
 *
 * @public
 */
export type ActionMenuConfirmation = {
  /** Content for the secondary button that returns to the action menu. */
  cancelText?: ReactNode;
  /** Content for the button that approves the pending action. */
  confirmText?: ReactNode;
  /** Supporting copy shown in the confirmation dialog. */
  description?: ReactNode;
  /** Heading announced as the confirmation dialog's accessible name. */
  title?: ReactNode;
};

/**
 * One selectable action displayed by {@link ActionMenu}.
 *
 * @public
 */
export type ActionMenuAction = {
  /** Whether a successful press closes the menu; the menu-level `closeOnAction` must also be enabled. @defaultValue true */
  closeOnPress?: boolean;
  /** Overrides the confirmation dialog copy; providing it also requires confirmation for a neutral action. */
  confirmation?: ActionMenuConfirmation;
  /** Secondary content displayed below the action label. */
  description?: ReactNode;
  /** Prevents the action from receiving interaction. @defaultValue false */
  disabled?: boolean;
  /** Graphic displayed before the action label. */
  icon?: ReactNode;
  /** Stable identity used for rendering, pending state, and action callbacks. */
  key: string;
  /** Primary content of the action button. */
  label: ReactNode;
  /** Runs before the menu-level `onAction`; returning `false` or rejecting keeps the menu open. */
  onPress?: () => boolean | void | Promise<boolean | void>;
  /** Visual and semantic emphasis; dangerous actions always require confirmation. @defaultValue "neutral" */
  tone?: ActionMenuActionTone;
};

/**
 * Details reported when a declarative action menu requests an open-state change.
 *
 * @public
 */
export type ActionMenuOpenChangeDetails =
  | {
      /** Interaction that requested dismissal. */
      reason: "cancel" | "escape" | "mask";
    }
  | {
      /** Key of the action that completed before dismissal. */
      actionKey: string;
      /** Indicates that an action requested dismissal. */
      reason: "action";
    };

/**
 * Details reported when an imperative action menu closes.
 *
 * @public
 */
export type ActionMenuCloseDetails =
  | ActionMenuOpenChangeDetails
  | {
      /** Provider operation that closed an imperative menu. */
      reason: "clear" | "programmatic";
    };

type ActionMenuAccessibleName =
  | {
      /** Visible heading used as the dialog's accessible name when no ARIA name is supplied. */
      title: ReactNode;
      /** Explicit accessible name; overrides the title-derived name. */
      "aria-label"?: string;
      /** ID of an external element that names the menu. */
      "aria-labelledby"?: string;
    }
  | {
      /** Omitted when the menu is named directly with `aria-label`. */
      title?: undefined;
      /** Accessible name required when no visible title is rendered. */
      "aria-label": string;
      "aria-labelledby"?: never;
    }
  | {
      /** Omitted when an external element supplies the accessible name. */
      title?: undefined;
      "aria-label"?: never;
      /** ID of the external element that names the menu. */
      "aria-labelledby": string;
    };

type ActionMenuBaseProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "aria-label" | "aria-labelledby" | "children" | "title"
> & {
  /** Ordered actions; neutral actions render before dangerous actions while callback indexes retain this array's order. */
  actions: ReadonlyArray<ActionMenuAction>;
  /** Cancel-button content, or `null` to hide the button. Defaults to the configured locale's cancel text. */
  cancelText?: ReactNode | null;
  /** Whether successful actions may dismiss the menu. Individual actions can opt out with `closeOnPress`. @defaultValue true */
  closeOnAction?: boolean;
  /** Whether Escape dismisses the menu when no action or confirmation is pending. @defaultValue true */
  closeOnEscape?: boolean;
  /** Whether pressing the backdrop dismisses the menu when no action or confirmation is pending. @defaultValue true */
  closeOnMaskClick?: boolean;
  /** Portal host, or a resolver that returns it. Defaults to the configured overlay container or `document.body`. */
  container?: OverlayContainer;
  /** Initial open state when `open` is uncontrolled. @defaultValue false */
  defaultOpen?: boolean;
  /** Supporting content announced through `aria-describedby`. */
  description?: ReactNode;
  /** Keeps the popup mounted while closed, which preserves its subtree state. @defaultValue false */
  forceMount?: boolean;
  /** Element to focus when the menu opens; otherwise the first enabled neutral action is preferred. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Prevents document scrolling while the menu is open. @defaultValue true */
  lockScroll?: boolean;
  /** Backdrop opacity preset or numeric opacity. @defaultValue "default" */
  maskOpacity?: MaskOpacity;
  /** Runs after the selected action's `onPress`; returning `false` or rejecting keeps the menu open. */
  onAction?: (action: ActionMenuAction, index: number) => boolean | void | Promise<boolean | void>;
  /** Handles an error thrown by an action callback; when absent, the error is rethrown. */
  onActionError?: (error: unknown, action: ActionMenuAction) => void;
  /** Called when user interaction requests an open-state change, with the interaction reason and action key when relevant. */
  onOpenChange?: (open: boolean, details: ActionMenuOpenChangeDetails) => void;
  /** Controlled open state; pair with `onOpenChange` to accept dismissal requests. */
  open?: boolean;
  /** Ref to the ActionMenu content root inside the popup panel. */
  ref?: Ref<HTMLDivElement>;
  /** Returns focus to the prior or explicit return target after the menu closes. @defaultValue true */
  restoreFocus?: boolean;
  /** Explicit focus-return target; otherwise the element focused before opening is used. */
  returnFocusRef?: RefObject<HTMLElement | null>;
  /** Adds bottom safe-area padding to the sheet. @defaultValue true */
  safeArea?: boolean;
};

/**
 * Props accepted by {@link ActionMenu}.
 *
 * @public
 */
export type ActionMenuProps = ActionMenuBaseProps & ActionMenuAccessibleName;

type WithoutOpenState<T> = T extends unknown
  ? Omit<T, "defaultOpen" | "onOpenChange" | "open">
  : never;

/**
 * Options accepted by {@link ActionMenuApi.show}.
 *
 * @public
 */
export type ActionMenuShowOptions = WithoutOpenState<ActionMenuProps> & {
  /** Called once when this imperative menu closes, including provider `clear()` and controller closure. */
  onClose?: (details: ActionMenuCloseDetails) => void;
};

/**
 * Handle returned for one imperative action-menu instance.
 *
 * @public
 */
export type ActionMenuController = {
  /** Closes this imperative menu and reports a `programmatic` reason. */
  close: () => void;
};

/**
 * Imperative action-menu API exposed by {@link useActionMenu}.
 *
 * @public
 */
export type ActionMenuApi = {
  /** Closes every imperative menu created by this provider. */
  clear: () => void;
  /** Opens an imperative menu and returns a controller for that instance. */
  show: (options: ActionMenuShowOptions) => ActionMenuController;
};

/**
 * Props accepted by {@link ActionMenuProvider}.
 *
 * @public
 */
export type ActionMenuProviderProps = {
  /** Application subtree that receives the imperative action-menu API. */
  children: ReactNode;
};
