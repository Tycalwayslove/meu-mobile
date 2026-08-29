/**
 * Portal target, lazy target resolver, or `null` to render an overlay in place.
 *
 * @public
 */
export type OverlayContainer = HTMLElement | (() => HTMLElement) | null;
/**
 * User control that requested a generic overlay dismissal.
 *
 * @public
 */
export type OverlayDismissReason = "mask" | "escape" | "close-button";
/**
 * Metadata emitted with a generic overlay visibility-change request.
 *
 * @public
 */
export type OverlayOpenChangeDetails = {
  /** Dismissal control that requested the overlay to close. */
  reason: OverlayDismissReason;
};
