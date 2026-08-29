import type { HTMLAttributes, ReactNode, Ref, RefObject } from "react";

import type { MaskOpacity } from "../Mask";
import type { OverlayContainer } from "../overlayTypes";

/**
 * Viewport fraction or measured content height used as a sheet stop.
 *
 * @public
 */
export type BottomSheetSnapPoint = number | "content";

/**
 * Interaction that requested a bottom sheet to close.
 *
 * @public
 */
export type BottomSheetOpenChangeReason = "escape" | "mask" | "close-button" | "drag";

/**
 * Details reported with a bottom-sheet open-state request.
 *
 * @public
 */
export type BottomSheetOpenChangeDetails = {
  /** Interaction that requested the sheet to close. */
  reason: BottomSheetOpenChangeReason;
};

/**
 * Interaction that selected a bottom-sheet snap point.
 *
 * @public
 */
export type BottomSheetSnapChangeReason = "drag" | "handle";

/**
 * Details reported after the active snap point changes.
 *
 * @public
 */
export type BottomSheetSnapChangeDetails = {
  /** Zero-based index of the resolved snap point after sorting by rendered height. */
  index: number;
  /** Interaction that selected the snap point. */
  reason: BottomSheetSnapChangeReason;
};

type BottomSheetAccessibleName =
  | {
      /** Visible heading used as the sheet's accessible name when no ARIA name is supplied. */
      title: ReactNode;
      /** Explicit accessible name; overrides the title-derived name. */
      "aria-label"?: string;
      /** ID of an external element that names the sheet. */
      "aria-labelledby"?: string;
    }
  | {
      /** Omitted when the sheet is named directly with `aria-label`. */
      title?: undefined;
      /** Accessible name required when no visible title is rendered. */
      "aria-label": string;
      "aria-labelledby"?: never;
    }
  | {
      /** Omitted when an external element supplies the accessible name. */
      title?: undefined;
      "aria-label"?: never;
      /** ID of the external element that names the sheet. */
      "aria-labelledby": string;
    };

type BottomSheetBaseProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "aria-label" | "aria-labelledby" | "children" | "title"
> & {
  /** Sheet body rendered inside the focus-trapped dialog. */
  children: ReactNode;
  /** Accessible label for the optional close button. Defaults to localized “Close” text. */
  closeLabel?: string;
  /** Whether Escape requests dismissal. @defaultValue true */
  closeOnEscape?: boolean;
  /** Whether pressing the backdrop requests dismissal. @defaultValue false */
  closeOnMaskClick?: boolean;
  /** Portal host, or a resolver that returns it. Defaults to the configured overlay container or `document.body`. */
  container?: OverlayContainer;
  /** Initial open state when `open` is uncontrolled. @defaultValue false */
  defaultOpen?: boolean;
  /** Initial snap point when `snapPoint` is uncontrolled; defaults to the tallest valid point. */
  defaultSnapPoint?: BottomSheetSnapPoint;
  /** Shows the handle used to move among snap points. @defaultValue true */
  dragHandle?: boolean;
  /** Accessible label for the drag handle. Defaults to localized “Adjust sheet height” text. */
  dragHandleLabel?: string;
  /** Allows a downward drag below the smallest snap point to dismiss the sheet. @defaultValue true */
  dragToDismiss?: boolean;
  /** Keeps the sheet mounted while closed, which preserves its subtree state. @defaultValue false */
  forceMount?: boolean;
  /** Element to focus when the sheet opens; otherwise the focus trap chooses the first focusable element. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Prevents document scrolling while the sheet is open. @defaultValue true */
  lockScroll?: boolean;
  /** Backdrop opacity preset or numeric opacity. @defaultValue "default" */
  maskOpacity?: MaskOpacity;
  /** Called when user interaction requests an open-state change; controlled consumers must update `open`. */
  onOpenChange?: (open: boolean, details: BottomSheetOpenChangeDetails) => void;
  /** Called after dragging or activating the handle selects a valid snap point. */
  onSnapPointChange?: (
    snapPoint: BottomSheetSnapPoint,
    details: BottomSheetSnapChangeDetails
  ) => void;
  /** Controlled open state; pair with `onOpenChange` to accept dismissal requests. */
  open?: boolean;
  /** Ref to the sheet panel element. */
  ref?: Ref<HTMLDivElement>;
  /** Returns focus to the prior or explicit return target after the sheet closes. @defaultValue true */
  restoreFocus?: boolean;
  /** Explicit focus-return target; otherwise the element focused before opening is used. */
  returnFocusRef?: RefObject<HTMLElement | null>;
  /** Adds bottom safe-area padding to the sheet body. @defaultValue true */
  safeArea?: boolean;
  /** Shows a close button in the sheet header. @defaultValue false */
  showCloseButton?: boolean;
  /** Controlled active snap point; values not present in `snapPoints` resolve to the nearest rendered height. */
  snapPoint?: BottomSheetSnapPoint;
  /** Available heights: fractions in `(0, 1]` use viewport height, and `"content"` uses measured content height. @defaultValue ["content"] */
  snapPoints?: ReadonlyArray<BottomSheetSnapPoint>;
};

/**
 * Props accepted by {@link BottomSheet}.
 *
 * @public
 */
export type BottomSheetProps = BottomSheetBaseProps & BottomSheetAccessibleName;
