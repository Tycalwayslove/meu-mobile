import type { HTMLAttributes, Key, PointerEvent as ReactPointerEvent, ReactNode, Ref } from "react";

/** Physical action rail. @public */
export type SwipeActionsSide = "left" | "right";

/** Visual action emphasis. @public */
export type SwipeActionsActionTone = "neutral" | "accent" | "success" | "warning" | "danger";

/** Location of a pressed action. @public */
export type SwipeActionsActionPressDetails = {
  /** Zero-based index within its side. */
  index: number;
  /** Physical rail containing the action. */
  side: SwipeActionsSide;
};

/** Returning false vetoes automatic close. @public */
export type SwipeActionsActionResult = boolean | void | Promise<boolean | void>;

/** Native-button action displayed in a rail. Keys must be unique across that rail. @public */
export type SwipeActionsAction = {
  /** Accessible name when the visual label alone is insufficient. */
  "aria-label"?: string;
  /** Per-action override for root `closeOnAction`. */
  closeOnPress?: boolean;
  /** Disables this action. */
  disabled?: boolean;
  /** Stable identity used for rendering and event details. */
  key: Key;
  /** Visible button content. */
  label: ReactNode;
  /** Action handler; false keeps the rail open. */
  onPress?: (details: SwipeActionsActionPressDetails) => SwipeActionsActionResult;
  /** Visual emphasis. @defaultValue "neutral" */
  tone?: SwipeActionsActionTone;
};

/** Why a rail-open state request occurred. @public */
export type SwipeActionsOpenChangeDetails =
  | { reason: "swipe" | "keyboard" | "content" | "outside" | "escape" }
  | { actionKey: Key; reason: "action" };

/** Props for horizontal swipe action rails with native keyboard alternatives. @public */
export type SwipeActionsProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  | "children"
  | "defaultValue"
  | "onChange"
  | "onClickCapture"
  | "onKeyDownCapture"
  | "onLostPointerCapture"
  | "onPointerCancel"
  | "onPointerDown"
  | "onPointerMove"
  | "onPointerUp"
> & {
  /** Foreground content translated to reveal the rails. */
  children: ReactNode;
  /** Closes after successful handlers unless one returns false. @defaultValue true */
  closeOnAction?: boolean;
  /** Closes when pointer or focus moves outside. @defaultValue true */
  closeOnOutsidePress?: boolean;
  /** Initially open physical rail for uncontrolled use. */
  defaultOpenSide?: SwipeActionsSide | null;
  /** Disables reveal, swipe and every action. @defaultValue false */
  disabled?: boolean;
  /** Physical-left action rail. */
  leftActions?: ReadonlyArray<SwipeActionsAction>;
  /** Accessible name for the left action group. */
  leftActionsLabel?: string;
  /** Optional root-level action handler, called after the item handler. */
  onAction?: (
    action: SwipeActionsAction,
    details: SwipeActionsActionPressDetails
  ) => SwipeActionsActionResult;
  onActionError?: (error: unknown, action: SwipeActionsAction) => void;
  onClickCapture?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onKeyDownCapture?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  /** Root lost-pointer-capture observer; internal cancellation runs afterward. */
  onLostPointerCapture?: (event: ReactPointerEvent<HTMLDivElement>) => void;
  /** Called when an interaction requests a different open rail. */
  onOpenSideChange?: (
    side: SwipeActionsSide | null,
    details: SwipeActionsOpenChangeDetails
  ) => void;
  onPointerCancel?: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerDown?: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove?: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp?: (event: ReactPointerEvent<HTMLDivElement>) => void;
  /** Authoritative physical rail for controlled use. */
  openSide?: SwipeActionsSide | null;
  /** Fraction of rail width required to open/close, clamped to 0.1–0.9. @defaultValue 0.35 */
  openThreshold?: number;
  /** Root element ref. */
  ref?: Ref<HTMLDivElement>;
  /** Accessible name for the focus-visible left reveal button. */
  revealLeftLabel?: string;
  /** Accessible name for the focus-visible right reveal button. */
  revealRightLabel?: string;
  /** Physical-right action rail. */
  rightActions?: ReadonlyArray<SwipeActionsAction>;
  /** Accessible name for the right action group. */
  rightActionsLabel?: string;
};
