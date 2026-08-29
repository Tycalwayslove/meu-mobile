import type { HTMLAttributes, ReactNode, Ref, RefObject } from "react";

import type { MaskOpacity } from "../Mask";
import type { OverlayContainer, OverlayOpenChangeDetails } from "../overlayTypes";

/**
 * Screen edge from which a Popup enters.
 *
 * @public
 */
export type PopupPosition = "top" | "right" | "bottom" | "left";

type PopupAccessibleName =
  | {
      /** Direct accessible name for the dialog. */
      "aria-label": string;
      /** Mutually exclusive with `aria-label`. */
      "aria-labelledby"?: never;
    }
  | {
      /** Mutually exclusive with `aria-labelledby`. */
      "aria-label"?: never;
      /** ID of the element that labels the dialog. */
      "aria-labelledby": string;
    };

type PopupBaseProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "aria-label" | "aria-labelledby" | "children"
> & {
  /** Dialog body. */
  children: ReactNode;
  /** Accessible name for the optional close button; defaults to the configured locale. */
  closeLabel?: string;
  /** Lets Escape request closure while the popup is open. @defaultValue true */
  closeOnEscape?: boolean;
  /** Lets a mask press request closure. @defaultValue false */
  closeOnMaskClick?: boolean;
  /** Portal target; `null` renders next to the caller. Defaults to ConfigProvider's target. */
  container?: OverlayContainer;
  /** Initial open state for uncontrolled usage. @defaultValue false */
  defaultOpen?: boolean;
  /** Keeps the closed dialog mounted and hidden after hydration. @defaultValue false */
  forceMount?: boolean;
  /** Preferred element to receive focus when the dialog opens. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Prevents document-body scrolling while open. @defaultValue true */
  lockScroll?: boolean;
  /** Renders the modal backdrop. @defaultValue true */
  mask?: boolean;
  /** Backdrop opacity token. @defaultValue "default" */
  maskOpacity?: MaskOpacity;
  /** Reports requested controlled or uncontrolled visibility changes and their cause. */
  onOpenChange?: (open: boolean, details: OverlayOpenChangeDetails) => void;
  /** Controlled open state. */
  open?: boolean;
  /** Screen edge from which the panel enters. @defaultValue "bottom" */
  position?: PopupPosition;
  /** Ref to the dialog panel rather than the portal layer. */
  ref?: Ref<HTMLDivElement>;
  /** Restores focus after the dialog closes when focus remains inside it. @defaultValue true */
  restoreFocus?: boolean;
  /** Explicit focus-restoration target; otherwise the previously focused element is used. */
  returnFocusRef?: RefObject<HTMLElement | null>;
  /** Applies the corresponding device safe-area inset. @defaultValue true */
  safeArea?: boolean;
  /** Renders a native close button in the panel. @defaultValue false */
  showCloseButton?: boolean;
};

/**
 * Props for the modal edge panel.
 *
 * @public
 */
export type PopupProps = PopupBaseProps & PopupAccessibleName;
