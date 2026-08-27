import type { HTMLAttributes, ReactNode, Ref } from "react";

import type { OverlayContainer, OverlayOpenChangeDetails } from "../overlayTypes";

export type MaskOpacity = "thin" | "default" | "thick" | number;

export type MaskProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "onClick"> & {
  children?: ReactNode;
  container?: OverlayContainer;
  defaultOpen?: boolean;
  dismissible?: boolean;
  forceMount?: boolean;
  lockScroll?: boolean;
  onOpenChange?: (open: boolean, details: OverlayOpenChangeDetails) => void;
  open?: boolean;
  opacity?: MaskOpacity;
  ref?: Ref<HTMLDivElement>;
};
