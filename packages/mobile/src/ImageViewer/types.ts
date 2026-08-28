import type { HTMLAttributes, ImgHTMLAttributes, Key, ReactNode, Ref, RefObject } from "react";

import type { OverlayContainer } from "../overlayTypes";

export type ImageViewerControls = "full" | "minimal";
export type ImageViewerOpenChangeReason = "close-button" | "escape";
export type ImageViewerIndexChangeReason = "drag" | "imperative" | "next" | "previous";
export type ImageViewerScaleChangeReason =
  "double-tap" | "pinch" | "reset" | "zoom-in" | "zoom-out";

export type ImageViewerItem = {
  alt: string;
  crossOrigin?: ImgHTMLAttributes<HTMLImageElement>["crossOrigin"];
  key?: Key;
  referrerPolicy?: ImgHTMLAttributes<HTMLImageElement>["referrerPolicy"];
  sizes?: string;
  src: string;
  srcSet?: string;
};

export type ImageViewerOpenChangeDetails = {
  reason: ImageViewerOpenChangeReason;
};

export type ImageViewerIndexChangeDetails = {
  reason: ImageViewerIndexChangeReason;
};

export type ImageViewerScaleChangeDetails = {
  index: number;
  reason: ImageViewerScaleChangeReason;
};

export type ImageViewerRef = {
  goTo: (index: number) => void;
  nativeElement: HTMLDivElement | null;
  next: () => void;
  previous: () => void;
  resetZoom: () => void;
};

export type ImageViewerProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "aria-label" | "children" | "dangerouslySetInnerHTML" | "role"
> & {
  "aria-label"?: string;
  closeLabel?: string;
  closeOnEscape?: boolean;
  container?: OverlayContainer;
  controls?: ImageViewerControls;
  defaultIndex?: number;
  defaultOpen?: boolean;
  doubleTapZoom?: number;
  emptyContent?: ReactNode;
  forceMount?: boolean;
  images: readonly ImageViewerItem[];
  index?: number;
  lockScroll?: boolean;
  loop?: boolean;
  maxZoom?: number;
  nextLabel?: string;
  onIndexChange?: (index: number, details: ImageViewerIndexChangeDetails) => void;
  onOpenChange?: (open: boolean, details: ImageViewerOpenChangeDetails) => void;
  onScaleChange?: (scale: number, details: ImageViewerScaleChangeDetails) => void;
  open?: boolean;
  previousLabel?: string;
  ref?: Ref<ImageViewerRef>;
  renderFooter?: (item: ImageViewerItem, index: number) => ReactNode;
  resetZoomLabel?: string;
  restoreFocus?: boolean;
  returnFocusRef?: RefObject<HTMLElement | null>;
  showCounter?: boolean;
  zoom?: boolean;
  zoomInLabel?: string;
  zoomOutLabel?: string;
};
