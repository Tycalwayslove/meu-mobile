import type { HTMLAttributes, ReactNode, Ref } from "react";

import type { OverlayContainer, OverlayOpenChangeDetails } from "../overlayTypes";

/**
 * Preset or custom backdrop opacity. Numeric values are clamped to 0–1.
 *
 * @public
 */
export type MaskOpacity = "thin" | "default" | "thick" | number;

/**
 * Props for a portal-aware modal backdrop.
 *
 * @public
 */
export type MaskProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "onClick"> & {
  /** Decorative content centered above the backdrop and hidden from assistive technology. */
  children?: ReactNode;
  /** Portal target; `null` renders in place. */
  container?: OverlayContainer;
  /** Initial uncontrolled visibility. @defaultValue true */
  defaultOpen?: boolean;
  /** Allows pointer dismissal through the backdrop. @defaultValue false */
  dismissible?: boolean;
  /** Keeps a closed node mounted but hidden. @defaultValue false */
  forceMount?: boolean;
  /** Locks document scrolling while open. @defaultValue true */
  lockScroll?: boolean;
  /** Reports visibility requests and their reason. */
  onOpenChange?: (open: boolean, details: OverlayOpenChangeDetails) => void;
  /** Controlled visibility. */
  open?: boolean;
  /** Backdrop opacity preset or a finite 0–1 value. @defaultValue "default" */
  opacity?: MaskOpacity;
  /** Ref to the rendered mask root. */
  ref?: Ref<HTMLDivElement>;
};
