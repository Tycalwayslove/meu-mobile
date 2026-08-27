import { style } from "@vanilla-extract/css";

export const root = style({
  position: "relative",
  width: "100%",
  minWidth: 0,
  overflow: "hidden",
  color: "var(--meu-color-ink)",
  fontFamily: "var(--meu-font-ui)"
});

export const viewport = style({
  width: "100%",
  overflow: "hidden",
  borderRadius: "inherit"
});

export const track = style({
  display: "flex",
  gap: "var(--meu-carousel-gap)",
  touchAction: "pan-y pinch-zoom",
  WebkitTapHighlightColor: "transparent"
});

export const slide = style({
  position: "relative",
  flex: "0 0 100%",
  minWidth: 0,
  boxSizing: "border-box",
  selectors: {
    '&[data-active="false"]': { pointerEvents: "none" }
  }
});

export const controls = style({
  position: "absolute",
  inset: 0,
  zIndex: 2,
  pointerEvents: "none"
});

const controlBase = {
  position: "absolute" as const,
  display: "grid",
  placeItems: "center",
  width: 44,
  height: 44,
  boxSizing: "border-box" as const,
  padding: 0,
  color: "var(--meu-color-ink)",
  background: "var(--meu-color-surface)",
  border: "1px solid var(--meu-color-border)",
  borderRadius: "var(--meu-radius-round)",
  boxShadow: "var(--meu-shadow-floating)",
  font: "inherit",
  cursor: "pointer",
  pointerEvents: "auto" as const,
  transition:
    "color var(--meu-motion-exit) var(--meu-motion-ease-standard), background var(--meu-motion-exit) var(--meu-motion-ease-standard), opacity var(--meu-motion-exit) var(--meu-motion-ease-standard), transform var(--meu-motion-exit) var(--meu-motion-ease-standard)",
  selectors: {
    "&:focus": {
      outline: "2px solid var(--meu-color-accent)",
      outlineOffset: 2
    },
    "&:active:not(:disabled)": { transform: "scale(0.96)" },
    "&:disabled": { cursor: "not-allowed", opacity: 0.42 }
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "1ms" }
  }
};

export const previousButton = style({
  ...controlBase,
  top: "50%",
  left: "var(--meu-space-3)",
  transform: "translateY(-50%)",
  selectors: {
    ...controlBase.selectors,
    "&:active:not(:disabled)": { transform: "translateY(-50%) scale(0.96)" }
  }
});

export const nextButton = style({
  ...controlBase,
  top: "50%",
  right: "var(--meu-space-3)",
  transform: "translateY(-50%)",
  selectors: {
    ...controlBase.selectors,
    "&:active:not(:disabled)": { transform: "translateY(-50%) scale(0.96)" }
  }
});

export const nextIcon = style({ transform: "rotate(180deg)" });

export const rotationButton = style({
  ...controlBase,
  top: "var(--meu-space-3)",
  right: "var(--meu-space-3)",
  fontSize: 13,
  fontWeight: 700,
  lineHeight: 1
});

export const indicator = style({
  position: "absolute",
  right: 64,
  bottom: "var(--meu-space-3)",
  left: 64,
  zIndex: 1,
  display: "flex",
  justifyContent: "center",
  pointerEvents: "none"
});
