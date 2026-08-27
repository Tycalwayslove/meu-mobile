import type { HTMLAttributes, Key, PointerEvent as ReactPointerEvent, ReactNode, Ref } from "react";

export type SwipeActionsSide = "left" | "right";

export type SwipeActionsActionTone = "neutral" | "accent" | "success" | "warning" | "danger";

export type SwipeActionsActionPressDetails = {
  index: number;
  side: SwipeActionsSide;
};

export type SwipeActionsActionResult = boolean | void | Promise<boolean | void>;

export type SwipeActionsAction = {
  "aria-label"?: string;
  closeOnPress?: boolean;
  disabled?: boolean;
  key: Key;
  label: ReactNode;
  onPress?: (details: SwipeActionsActionPressDetails) => SwipeActionsActionResult;
  tone?: SwipeActionsActionTone;
};

export type SwipeActionsOpenChangeDetails =
  | { reason: "swipe" | "keyboard" | "content" | "outside" | "escape" }
  | { actionKey: Key; reason: "action" };

export type SwipeActionsProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  | "children"
  | "defaultValue"
  | "onChange"
  | "onClickCapture"
  | "onKeyDownCapture"
  | "onPointerCancel"
  | "onPointerDown"
  | "onPointerMove"
  | "onPointerUp"
> & {
  children: ReactNode;
  closeOnAction?: boolean;
  closeOnOutsidePress?: boolean;
  defaultOpenSide?: SwipeActionsSide | null;
  disabled?: boolean;
  leftActions?: ReadonlyArray<SwipeActionsAction>;
  leftActionsLabel?: string;
  onAction?: (
    action: SwipeActionsAction,
    details: SwipeActionsActionPressDetails
  ) => SwipeActionsActionResult;
  onActionError?: (error: unknown, action: SwipeActionsAction) => void;
  onClickCapture?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onKeyDownCapture?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  onOpenSideChange?: (
    side: SwipeActionsSide | null,
    details: SwipeActionsOpenChangeDetails
  ) => void;
  onPointerCancel?: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerDown?: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove?: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp?: (event: ReactPointerEvent<HTMLDivElement>) => void;
  openSide?: SwipeActionsSide | null;
  openThreshold?: number;
  ref?: Ref<HTMLDivElement>;
  revealLeftLabel?: string;
  revealRightLabel?: string;
  rightActions?: ReadonlyArray<SwipeActionsAction>;
  rightActionsLabel?: string;
};
