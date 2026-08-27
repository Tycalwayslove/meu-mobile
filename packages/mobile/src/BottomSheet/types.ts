import type { HTMLAttributes, ReactNode, Ref, RefObject } from "react";

import type { MaskOpacity } from "../Mask";
import type { OverlayContainer } from "../overlayTypes";

export type BottomSheetSnapPoint = number | "content";

export type BottomSheetOpenChangeReason = "escape" | "mask" | "close-button" | "drag";

export type BottomSheetOpenChangeDetails = { reason: BottomSheetOpenChangeReason };

export type BottomSheetSnapChangeReason = "drag" | "handle";

export type BottomSheetSnapChangeDetails = {
  index: number;
  reason: BottomSheetSnapChangeReason;
};

type BottomSheetAccessibleName =
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

type BottomSheetBaseProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "aria-label" | "aria-labelledby" | "children" | "title"
> & {
  children: ReactNode;
  closeLabel?: string;
  closeOnEscape?: boolean;
  closeOnMaskClick?: boolean;
  container?: OverlayContainer;
  defaultOpen?: boolean;
  defaultSnapPoint?: BottomSheetSnapPoint;
  dragHandle?: boolean;
  dragHandleLabel?: string;
  dragToDismiss?: boolean;
  forceMount?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  lockScroll?: boolean;
  maskOpacity?: MaskOpacity;
  onOpenChange?: (open: boolean, details: BottomSheetOpenChangeDetails) => void;
  onSnapPointChange?: (
    snapPoint: BottomSheetSnapPoint,
    details: BottomSheetSnapChangeDetails
  ) => void;
  open?: boolean;
  ref?: Ref<HTMLDivElement>;
  restoreFocus?: boolean;
  returnFocusRef?: RefObject<HTMLElement | null>;
  safeArea?: boolean;
  showCloseButton?: boolean;
  snapPoint?: BottomSheetSnapPoint;
  snapPoints?: ReadonlyArray<BottomSheetSnapPoint>;
};

export type BottomSheetProps = BottomSheetBaseProps & BottomSheetAccessibleName;
