import type { HTMLAttributes, ReactNode, Ref, RefObject } from "react";

import type { MaskOpacity } from "../Mask";
import type { OverlayContainer, OverlayOpenChangeDetails } from "../overlayTypes";

export type PopupPosition = "top" | "right" | "bottom" | "left";

type PopupAccessibleName =
  | { "aria-label": string; "aria-labelledby"?: never }
  | { "aria-label"?: never; "aria-labelledby": string };

type PopupBaseProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "aria-label" | "aria-labelledby" | "children"
> & {
  children: ReactNode;
  closeLabel?: string;
  closeOnEscape?: boolean;
  closeOnMaskClick?: boolean;
  container?: OverlayContainer;
  defaultOpen?: boolean;
  forceMount?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  lockScroll?: boolean;
  mask?: boolean;
  maskOpacity?: MaskOpacity;
  onOpenChange?: (open: boolean, details: OverlayOpenChangeDetails) => void;
  open?: boolean;
  position?: PopupPosition;
  ref?: Ref<HTMLDivElement>;
  restoreFocus?: boolean;
  returnFocusRef?: RefObject<HTMLElement | null>;
  safeArea?: boolean;
  showCloseButton?: boolean;
};

export type PopupProps = PopupBaseProps & PopupAccessibleName;
