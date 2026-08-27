import type { HTMLAttributes, ReactNode, Ref, RefObject } from "react";

import type { MaskOpacity } from "../Mask";
import type { OverlayContainer } from "../overlayTypes";

export type ActionMenuActionTone = "neutral" | "danger";

export type ActionMenuConfirmation = {
  cancelText?: ReactNode;
  confirmText?: ReactNode;
  description?: ReactNode;
  title?: ReactNode;
};

export type ActionMenuAction = {
  closeOnPress?: boolean;
  confirmation?: ActionMenuConfirmation;
  description?: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
  key: string;
  label: ReactNode;
  onPress?: () => boolean | void | Promise<boolean | void>;
  tone?: ActionMenuActionTone;
};

export type ActionMenuOpenChangeDetails =
  { reason: "cancel" | "escape" | "mask" } | { actionKey: string; reason: "action" };

export type ActionMenuCloseDetails =
  ActionMenuOpenChangeDetails | { reason: "clear" | "programmatic" };

type ActionMenuAccessibleName =
  | {
      title: ReactNode;
      "aria-label"?: string;
      "aria-labelledby"?: string;
    }
  | {
      title?: undefined;
      "aria-label": string;
      "aria-labelledby"?: never;
    }
  | {
      title?: undefined;
      "aria-label"?: never;
      "aria-labelledby": string;
    };

type ActionMenuBaseProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "aria-label" | "aria-labelledby" | "children" | "title"
> & {
  actions: ReadonlyArray<ActionMenuAction>;
  cancelText?: ReactNode | null;
  closeOnAction?: boolean;
  closeOnEscape?: boolean;
  closeOnMaskClick?: boolean;
  container?: OverlayContainer;
  defaultOpen?: boolean;
  description?: ReactNode;
  forceMount?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  lockScroll?: boolean;
  maskOpacity?: MaskOpacity;
  onAction?: (action: ActionMenuAction, index: number) => boolean | void | Promise<boolean | void>;
  onActionError?: (error: unknown, action: ActionMenuAction) => void;
  onOpenChange?: (open: boolean, details: ActionMenuOpenChangeDetails) => void;
  open?: boolean;
  ref?: Ref<HTMLDivElement>;
  restoreFocus?: boolean;
  returnFocusRef?: RefObject<HTMLElement | null>;
  safeArea?: boolean;
};

export type ActionMenuProps = ActionMenuBaseProps & ActionMenuAccessibleName;

type WithoutOpenState<T> = T extends unknown
  ? Omit<T, "defaultOpen" | "onOpenChange" | "open">
  : never;

export type ActionMenuShowOptions = WithoutOpenState<ActionMenuProps> & {
  onClose?: (details: ActionMenuCloseDetails) => void;
};

export type ActionMenuController = {
  close: () => void;
};

export type ActionMenuApi = {
  clear: () => void;
  show: (options: ActionMenuShowOptions) => ActionMenuController;
};

export type ActionMenuProviderProps = {
  children: ReactNode;
};
