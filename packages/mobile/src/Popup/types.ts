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
  | "aria-hidden"
  | "aria-label"
  | "aria-labelledby"
  | "aria-modal"
  | "children"
  | "hidden"
  | "inert"
  | "role"
  | "tabIndex"
> & {
  /** Dialog body. */
  children: ReactNode;
  /** Accessible name for the optional close button; defaults to the configured locale. */
  closeLabel?: string;
  /** Lets Escape request closure while the popup is open. @defaultValue true */
  closeOnEscape?: boolean;
  /** Lets a completed native mask click request closure when `mask` is rendered. @defaultValue false */
  closeOnMaskClick?: boolean;
  /**
   * Portal target; `null` renders next to the caller. Defaults to ConfigProvider's target. When a
   * resolver's destination changes, pass a new resolver identity so focus trapping rebinds.
   */
  container?: OverlayContainer;
  /** Initial open state for uncontrolled usage. @defaultValue false */
  defaultOpen?: boolean;
  /** Keeps the closed dialog mounted, inert and hidden, including during SSR. @defaultValue false */
  forceMount?: boolean;
  /** Preferred visible descendant to receive focus; invalid targets fall back to the first tabbable descendant or panel. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Prevents the current document body from scrolling while open. @defaultValue true */
  lockScroll?: boolean;
  /** Renders the modal backdrop; focus trapping and modal isolation remain active when omitted. @defaultValue true */
  mask?: boolean;
  /** Backdrop opacity token. @defaultValue "default" */
  maskOpacity?: MaskOpacity;
  /** Reports user dismissal requests and their cause; prop-driven visibility changes emit nothing. */
  onOpenChange?: (open: boolean, details: OverlayOpenChangeDetails) => void;
  /** Controlled open state; consumers must accept or reject each dismissal request. */
  open?: boolean;
  /** Physical screen edge from which the panel enters; RTL does not swap left and right. @defaultValue "bottom" */
  position?: PopupPosition;
  /** Ref to the dialog panel rather than the portal layer. */
  ref?: Ref<HTMLDivElement>;
  /** Restores the focus captured when the dialog opened after it closes. @defaultValue true */
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
