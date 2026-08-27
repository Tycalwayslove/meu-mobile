export type OverlayContainer = HTMLElement | (() => HTMLElement) | null;
export type OverlayDismissReason = "mask" | "escape" | "close-button";
export type OverlayOpenChangeDetails = { reason: OverlayDismissReason };
