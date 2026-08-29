import type { HTMLAttributes, ReactElement, ReactNode, Ref, RefObject } from "react";

import type { OverlayContainer } from "../overlayTypes";

/**
 * Preferred panel placement before collision handling.
 *
 * @public
 */
export type PopoverPlacement =
  | "top"
  | "top-start"
  | "top-end"
  | "right"
  | "right-start"
  | "right-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end";

/**
 * Trigger behavior managed by Popover.
 *
 * @public
 */
export type PopoverTrigger = "click" | "manual";

/**
 * Interaction that requested a popover visibility change.
 *
 * @public
 */
export type PopoverOpenChangeReason = "trigger" | "escape" | "outside" | "focus-out";

/**
 * Metadata emitted with a popover visibility request.
 *
 * @public
 */
export type PopoverOpenChangeDetails = {
  /** Interaction that requested the visibility change. */
  reason: PopoverOpenChangeReason;
};

/**
 * Focusable element shape accepted as the Popover trigger.
 *
 * @public
 */
export type PopoverTriggerElement = ReactElement<{
  disabled?: boolean;
  id?: string;
  ref?: Ref<HTMLElement>;
}>;

type PopoverAccessibleName =
  | {
      /** Direct accessible name for the popover panel. */
      "aria-label": string;
      /** Mutually exclusive with `aria-label`. */
      "aria-labelledby"?: never;
    }
  | {
      /** Mutually exclusive with `aria-labelledby`. */
      "aria-label"?: never;
      /** ID of the element that labels the popover panel. */
      "aria-labelledby": string;
    };

type PopoverBaseProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "aria-label" | "aria-labelledby" | "children" | "content" | "dangerouslySetInnerHTML" | "role"
> & {
  /** Renders a position-aware arrow. @defaultValue true */
  arrow?: boolean;
  /** Moves focus into the panel when opened. @defaultValue true */
  autoFocus?: boolean;
  /** Single focusable element that accepts a ref and event props. */
  children: PopoverTriggerElement;
  /** Enables Escape dismissal. @defaultValue true */
  closeOnEscape?: boolean;
  /** Dismisses when focus leaves trigger and panel. @defaultValue false */
  closeOnFocusOut?: boolean;
  /** Dismisses on an outside pointerdown. @defaultValue true */
  closeOnOutsideClick?: boolean;
  /** Portal target; `null` renders next to the trigger. */
  container?: OverlayContainer;
  /** Interactive popover body. */
  content: ReactNode;
  /** Initial uncontrolled visibility. @defaultValue false */
  defaultOpen?: boolean;
  /** Keeps a closed panel mounted after hydration. @defaultValue false */
  forceMount?: boolean;
  /** Preferred focus target inside the panel. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Non-negative trigger-to-panel distance. @defaultValue 10 */
  offset?: number;
  /** Reports visibility requests with the interaction reason. */
  onOpenChange?: (open: boolean, details: PopoverOpenChangeDetails) => void;
  /** Controlled visibility. */
  open?: boolean;
  /** Preferred placement before collision handling. @defaultValue "top" */
  placement?: PopoverPlacement;
  /** Ref to the floating panel. */
  ref?: Ref<HTMLDivElement>;
  /** Restores trigger focus when appropriate. @defaultValue true */
  restoreFocus?: boolean;
  /** Click-managed or caller-managed trigger behavior. @defaultValue "click" */
  trigger?: PopoverTrigger;
  /** Non-negative collision padding. @defaultValue 16 */
  viewportPadding?: number;
};

/**
 * Props for the anchored non-modal dialog.
 *
 * @public
 */
export type PopoverProps = PopoverBaseProps & PopoverAccessibleName;
