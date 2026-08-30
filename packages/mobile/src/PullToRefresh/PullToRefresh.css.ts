import { style } from "@vanilla-extract/css";

export const root = style({
  position: "relative",
  minWidth: 0,
  overscrollBehaviorY: "contain"
});

export const indicator = style({
  position: "absolute",
  top: 0,
  right: 0,
  left: 0,
  zIndex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "var(--meu-pull-to-refresh-threshold)",
  minWidth: 0,
  paddingInline: "var(--meu-space-3)",
  boxSizing: "border-box",
  color: "var(--meu-color-muted)",
  background: "var(--meu-color-subtle)",
  fontSize: 13,
  lineHeight: 1.4,
  overflowWrap: "anywhere",
  textAlign: "center",
  pointerEvents: "none",
  transform: "translate3d(0, calc(-100% + var(--meu-pull-to-refresh-distance)), 0)",
  transition: "transform var(--meu-motion-exit) var(--meu-motion-ease-standard)"
});

export const content = style({
  position: "relative",
  zIndex: 0,
  minWidth: 0,
  transform: "translate3d(0, var(--meu-pull-to-refresh-distance), 0)",
  transition: "transform var(--meu-motion-exit) var(--meu-motion-ease-standard)",
  willChange: "transform"
});

export const keyboardAction = style({
  position: "absolute",
  top: "var(--meu-space-2)",
  left: "50%",
  zIndex: 3,
  minWidth: 120,
  maxWidth: "calc(100% - var(--meu-space-8))",
  minHeight: 44,
  padding: "var(--meu-space-2) var(--meu-space-4)",
  color: "var(--meu-color-accent-contrast)",
  background: "var(--meu-color-accent)",
  border: 0,
  borderRadius: "var(--meu-radius-control)",
  boxShadow: "var(--meu-shadow-floating)",
  boxSizing: "border-box",
  font: "inherit",
  overflowWrap: "anywhere",
  textAlign: "center",
  whiteSpace: "normal",
  cursor: "pointer",
  opacity: 0,
  pointerEvents: "none",
  transform: "translate3d(-50%, calc(-100% - var(--meu-space-4)), 0)",
  transition:
    "transform var(--meu-motion-exit) var(--meu-motion-ease-standard), opacity var(--meu-motion-exit) var(--meu-motion-ease-standard)",
  selectors: {
    "&:focus": {
      opacity: 1,
      outline: "2px solid var(--meu-color-accent)",
      outlineOffset: 2,
      pointerEvents: "auto",
      transform: "translate3d(-50%, 0, 0)"
    },
    "&:disabled": { cursor: "not-allowed", opacity: 0 }
  },
  "@media": {
    "(forced-colors: active)": {
      color: "ButtonText",
      background: "ButtonFace",
      border: "1px solid ButtonText"
    }
  }
});

export const motion = style({
  selectors: {
    [`${root}[data-dragging="true"] &`]: { transitionDuration: "0ms" }
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "1ms" }
  }
});
