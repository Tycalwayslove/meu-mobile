import { globalStyle, style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const layer = recipe({
  base: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1120,
    boxSizing: "border-box",
    width: "100%",
    height: "100%",
    minHeight: "100vh",
    color: "var(--meu-color-ink)",
    fontFamily: "var(--meu-font-ui)",
    transition: "opacity var(--meu-motion-enter) var(--meu-motion-ease-standard)"
  },
  variants: {
    state: {
      open: { opacity: 1, pointerEvents: "auto" },
      closed: {
        opacity: 0,
        pointerEvents: "none",
        transitionDuration: "var(--meu-motion-exit)"
      }
    }
  },
  defaultVariants: { state: "open" }
});

export const dialog = style({
  position: "relative",
  zIndex: 1,
  width: "100%",
  height: "100%",
  minHeight: "100vh",
  overflow: "hidden",
  boxSizing: "border-box",
  outline: "none"
});

export const gallery = style({ width: "100%", height: "100%", color: "inherit" });

globalStyle(`${gallery} [data-meu-carousel-viewport]`, { height: "100%" });
globalStyle(`${gallery} [data-meu-carousel-track]`, { height: "100%", touchAction: "none" });
globalStyle(`${gallery} [data-meu-carousel-slide]`, { height: "100%" });
globalStyle(`${gallery} [data-meu-carousel-controls] button`, {
  color: "var(--meu-color-ink)",
  background: "var(--meu-color-surface)",
  borderColor: "var(--meu-color-border)"
});
globalStyle(`${dialog}[data-controls="minimal"] [data-meu-carousel-controls]`, {
  display: "none"
});

export const slideStage = style({
  position: "relative",
  display: "grid",
  width: "100%",
  height: "100%",
  minHeight: 0,
  placeItems: "center",
  overflow: "hidden",
  boxSizing: "border-box",
  padding: "72px var(--meu-space-3) 104px",
  touchAction: "none",
  userSelect: "none",
  WebkitUserSelect: "none",
  WebkitTapHighlightColor: "transparent"
});

export const media = style({
  position: "relative",
  display: "grid",
  width: "100%",
  height: "100%",
  minWidth: 0,
  minHeight: 0,
  placeItems: "center",
  transform:
    "translate3d(var(--meu-image-viewer-x), var(--meu-image-viewer-y), 0) scale(var(--meu-image-viewer-scale))",
  transformOrigin: "center center",
  transition: "transform var(--meu-motion-enter) var(--meu-motion-ease-standard)",
  willChange: "transform",
  selectors: {
    '&[data-interacting="true"]': { transitionDuration: "0ms" }
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "1ms" }
  }
});

export const image = style({
  width: "100%",
  height: "100%",
  maxWidth: "100%",
  maxHeight: "100%",
  background: "transparent"
});

globalStyle(`${image} img`, { objectFit: "contain" });

export const stateMessage = style({
  display: "grid",
  width: "min(72vw, 280px)",
  minHeight: 120,
  placeItems: "center",
  boxSizing: "border-box",
  padding: "var(--meu-space-4)",
  color: "var(--meu-color-ink)",
  background: "var(--meu-color-surface)",
  border: "1px solid var(--meu-color-border)",
  borderRadius: "var(--meu-radius-surface)",
  fontSize: 14,
  lineHeight: 1.5,
  textAlign: "center"
});

const floatingControl = {
  display: "grid",
  width: 44,
  height: 44,
  minWidth: 44,
  minHeight: 44,
  placeItems: "center",
  boxSizing: "border-box" as const,
  padding: 0,
  color: "var(--meu-color-ink)",
  background: "var(--meu-color-surface)",
  border: "1px solid var(--meu-color-border)",
  borderRadius: "var(--meu-radius-round)",
  boxShadow: "var(--meu-shadow-floating)",
  font: "inherit",
  fontSize: 18,
  fontWeight: 700,
  lineHeight: 1,
  cursor: "pointer",
  selectors: {
    "&:focus": { outline: "2px solid var(--meu-color-accent)", outlineOffset: 2 },
    "&:active:not(:disabled)": { transform: "scale(0.96)" },
    "&:disabled": { cursor: "not-allowed", opacity: 0.42 }
  }
};

export const closeButton = style({
  ...floatingControl,
  position: "absolute",
  zIndex: 4,
  top: "calc(var(--meu-space-3) + env(safe-area-inset-top, 0px))",
  right: "var(--meu-space-3)"
});

export const counter = style({
  position: "absolute",
  zIndex: 3,
  top: "calc(var(--meu-space-3) + env(safe-area-inset-top, 0px))",
  left: "50%",
  minHeight: 44,
  boxSizing: "border-box",
  padding: "0 var(--meu-space-3)",
  color: "var(--meu-color-ink)",
  background: "var(--meu-color-surface)",
  border: "1px solid var(--meu-color-border)",
  borderRadius: "var(--meu-radius-round)",
  fontSize: 14,
  fontWeight: 650,
  lineHeight: "42px",
  transform: "translateX(-50%)",
  whiteSpace: "nowrap"
});

export const zoomControls = style({
  position: "absolute",
  zIndex: 4,
  right: "var(--meu-space-3)",
  bottom: "calc(var(--meu-space-3) + env(safe-area-inset-bottom, 0px))",
  display: "flex",
  gap: "var(--meu-space-2)"
});

export const zoomButton = style(floatingControl);

export const scaleValue = style({
  minWidth: 52,
  paddingInline: "var(--meu-space-2)",
  fontSize: 12
});

export const footer = style({
  position: "absolute",
  zIndex: 3,
  right: 180,
  bottom: "calc(var(--meu-space-3) + env(safe-area-inset-bottom, 0px))",
  left: "var(--meu-space-3)",
  minHeight: 44,
  boxSizing: "border-box",
  padding: "var(--meu-space-2) var(--meu-space-3)",
  color: "var(--meu-color-ink)",
  background: "var(--meu-color-surface)",
  border: "1px solid var(--meu-color-border)",
  borderRadius: "var(--meu-radius-surface)",
  fontSize: 13,
  lineHeight: 1.45
});

export const empty = style({
  position: "absolute",
  inset: 0,
  display: "grid",
  placeItems: "center",
  boxSizing: "border-box",
  padding: "var(--meu-space-6)",
  color: "var(--meu-color-muted)",
  textAlign: "center"
});
