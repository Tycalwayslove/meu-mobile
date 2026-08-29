import type { HTMLAttributes, ImgHTMLAttributes, Key, ReactNode, Ref, RefObject } from "react";

import type { OverlayContainer } from "../overlayTypes";

/**
 * Amount of visible zoom control chrome.
 *
 * @public
 */
export type ImageViewerControls = "full" | "minimal";
/**
 * Interaction that requested the image viewer to close.
 *
 * @public
 */
export type ImageViewerOpenChangeReason = "close-button" | "escape";
/**
 * Gesture, control, or method that selected an image.
 *
 * @public
 */
export type ImageViewerIndexChangeReason = "drag" | "imperative" | "next" | "previous";
/**
 * Gesture or control that changed the active image's scale.
 *
 * @public
 */
export type ImageViewerScaleChangeReason =
  "double-tap" | "pinch" | "reset" | "zoom-in" | "zoom-out";

/**
 * One image available to {@link ImageViewer}.
 *
 * @public
 */
export type ImageViewerItem = {
  /** Text alternative for the image; an empty value falls back to a localized positional slide label. */
  alt: string;
  /** Native image CORS mode used for this request. */
  crossOrigin?: ImgHTMLAttributes<HTMLImageElement>["crossOrigin"];
  /** Stable React identity; when omitted, the viewer combines `src` and the item index. */
  key?: Key;
  /** Native referrer policy used for this image request. */
  referrerPolicy?: ImgHTMLAttributes<HTMLImageElement>["referrerPolicy"];
  /** Native responsive-size hint used with `srcSet`. */
  sizes?: string;
  /** Primary image URL. */
  src: string;
  /** Native responsive source candidate list. */
  srcSet?: string;
};

/**
 * Details reported with an image-viewer open-state request.
 *
 * @public
 */
export type ImageViewerOpenChangeDetails = {
  /** Interaction that requested the viewer to close. */
  reason: ImageViewerOpenChangeReason;
};

/**
 * Details reported with an active-image request.
 *
 * @public
 */
export type ImageViewerIndexChangeDetails = {
  /** Gesture, control, or imperative method that selected the new image. */
  reason: ImageViewerIndexChangeReason;
};

/**
 * Details reported after the active image's zoom scale changes.
 *
 * @public
 */
export type ImageViewerScaleChangeDetails = {
  /** Zero-based index of the image whose zoom changed. */
  index: number;
  /** Gesture or control that changed the zoom scale. */
  reason: ImageViewerScaleChangeReason;
};

/**
 * Imperative navigation and zoom handle exposed by {@link ImageViewer}.
 *
 * @public
 */
export type ImageViewerRef = {
  /** Requests an image index; values wrap when `loop` is enabled and otherwise clamp to the available range. */
  goTo: (index: number) => void;
  /** Current dialog element, or `null` while it is unmounted. */
  nativeElement: HTMLDivElement | null;
  /** Requests the next image with an `imperative` reason. */
  next: () => void;
  /** Requests the previous image with an `imperative` reason. */
  previous: () => void;
  /** Returns the active image to 100% scale. */
  resetZoom: () => void;
};

/**
 * Props for a modal, navigable, and zoomable image gallery.
 *
 * @public
 */
export type ImageViewerProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "aria-label" | "children" | "dangerouslySetInnerHTML" | "role"
> & {
  /** Accessible name for the modal dialog and gallery. Defaults to localized “Image viewer” text. */
  "aria-label"?: string;
  /** Accessible label for the close button. Defaults to localized text. */
  closeLabel?: string;
  /** Whether Escape requests dismissal. @defaultValue true */
  closeOnEscape?: boolean;
  /** Portal host, or a resolver that returns it. Defaults to the configured overlay container or `document.body`. */
  container?: OverlayContainer;
  /** `full` shows zoom buttons; `minimal` retains gesture and keyboard zoom without those buttons. @defaultValue "full" */
  controls?: ImageViewerControls;
  /** Initial image index when `index` is uncontrolled; clamped to the available items. @defaultValue 0 */
  defaultIndex?: number;
  /** Initial open state when `open` is uncontrolled. @defaultValue false */
  defaultOpen?: boolean;
  /** Scale toggled by double-tap or double-click; clamped between 1 and `maxZoom`. @defaultValue 2 */
  doubleTapZoom?: number;
  /** Content shown when `images` is empty. Defaults to a localized message. */
  emptyContent?: ReactNode;
  /** Keeps the viewer mounted while closed, which preserves its subtree state. @defaultValue false */
  forceMount?: boolean;
  /** Ordered images available for navigation and zoom. */
  images: readonly ImageViewerItem[];
  /** Controlled active image index; pair with `onIndexChange` to accept navigation requests. */
  index?: number;
  /** Prevents document scrolling while the viewer is open. @defaultValue true */
  lockScroll?: boolean;
  /** Wraps navigation across the first and last image. @defaultValue false */
  loop?: boolean;
  /** Maximum zoom scale; finite values below 1 normalize to 1. @defaultValue 3 */
  maxZoom?: number;
  /** Accessible label for the next-image button. Defaults to localized text. */
  nextLabel?: string;
  /** Called when a gesture, navigation control, or imperative method requests another image. */
  onIndexChange?: (index: number, details: ImageViewerIndexChangeDetails) => void;
  /** Called when Escape or the close button requests an open-state change. */
  onOpenChange?: (open: boolean, details: ImageViewerOpenChangeDetails) => void;
  /** Called when the active image's scale changes, with its index and interaction reason. */
  onScaleChange?: (scale: number, details: ImageViewerScaleChangeDetails) => void;
  /** Controlled open state; pair with `onOpenChange` to accept dismissal requests. */
  open?: boolean;
  /** Accessible label for the previous-image button. Defaults to localized text. */
  previousLabel?: string;
  /** Imperative viewer handle for navigation, reset, and access to the dialog element. */
  ref?: Ref<ImageViewerRef>;
  /** Renders footer content for the current item and its zero-based index. */
  renderFooter?: (item: ImageViewerItem, index: number) => ReactNode;
  /** Accessible label for the scale button that resets zoom. Defaults to localized text. */
  resetZoomLabel?: string;
  /** Returns focus to the prior or explicit return target after the viewer closes. @defaultValue true */
  restoreFocus?: boolean;
  /** Explicit focus-return target; otherwise the element focused before opening is used. */
  returnFocusRef?: RefObject<HTMLElement | null>;
  /** Shows a localized current-position counter when images exist. @defaultValue true */
  showCounter?: boolean;
  /** Enables pinch, double-tap, mouse, keyboard, and button zoom. @defaultValue true */
  zoom?: boolean;
  /** Accessible label for the zoom-in button. Defaults to localized text. */
  zoomInLabel?: string;
  /** Accessible label for the zoom-out button. Defaults to localized text. */
  zoomOutLabel?: string;
};
