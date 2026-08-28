import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const root = style({
  position: "relative",
  width: "100%",
  minWidth: 0,
  overflow: "hidden",
  background: "var(--meu-color-surface)",
  WebkitTapHighlightColor: "transparent",
  touchAction: "pan-y"
});

export const actions = recipe({
  base: {
    position: "absolute",
    zIndex: 0,
    top: 0,
    bottom: 0,
    display: "flex",
    minWidth: 0
  },
  variants: {
    side: {
      left: { left: 0 },
      right: { right: 0 }
    }
  }
});

export const actionButton = recipe({
  base: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 72,
    minHeight: 44,
    height: "100%",
    padding: "var(--meu-space-2) var(--meu-space-4)",
    boxSizing: "border-box",
    border: "1px solid transparent",
    borderRadius: 0,
    font: "inherit",
    fontWeight: 600,
    lineHeight: 1.25,
    cursor: "pointer",
    whiteSpace: "nowrap",
    WebkitTapHighlightColor: "transparent",
    selectors: {
      "&:focus": {
        zIndex: 1,
        outline: "2px solid var(--meu-color-surface)",
        outlineOffset: -4
      },
      "&:active:not(:disabled)": { filter: "brightness(0.92)" },
      "&:disabled": {
        cursor: "not-allowed",
        color: "var(--meu-color-muted)",
        background: "var(--meu-color-subtle)"
      }
    },
    "@media": {
      "(forced-colors: active)": {
        color: "ButtonText",
        background: "ButtonFace",
        borderColor: "ButtonText"
      }
    }
  },
  variants: {
    tone: {
      neutral: { color: "var(--meu-color-surface)", background: "var(--meu-color-ink)" },
      accent: {
        color: "var(--meu-color-accent-contrast)",
        background: "var(--meu-color-accent)"
      },
      success: {
        color: "var(--meu-color-success-contrast)",
        background: "var(--meu-color-success)"
      },
      warning: {
        color: "var(--meu-color-warning-contrast)",
        background: "var(--meu-color-warning)"
      },
      danger: {
        color: "var(--meu-color-danger-contrast)",
        background: "var(--meu-color-danger)"
      }
    }
  },
  defaultVariants: { tone: "neutral" }
});

export const content = style({
  position: "relative",
  zIndex: 1,
  minWidth: 0,
  background: "var(--meu-color-surface)",
  transform: "translate3d(var(--meu-swipe-actions-offset, 0px), 0, 0)",
  transition: "transform var(--meu-motion-exit) var(--meu-motion-ease-standard)",
  willChange: "transform",
  selectors: {
    "[data-dragging='true'] &": { transition: "none" },
    "[data-disabled='true'] &": { cursor: "default" }
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "1ms" }
  }
});

export const keyboardAction = style({
  position: "absolute",
  top: 4,
  zIndex: 3,
  minWidth: 132,
  minHeight: 44,
  padding: "0 var(--meu-space-3)",
  color: "var(--meu-color-accent-contrast)",
  background: "var(--meu-color-accent)",
  border: 0,
  borderRadius: "var(--meu-radius-control)",
  boxShadow: "var(--meu-shadow-floating)",
  font: "inherit",
  cursor: "pointer",
  opacity: 0,
  pointerEvents: "none",
  transform: "translate3d(0, calc(-100% - var(--meu-space-2)), 0)",
  transition: [
    "transform var(--meu-motion-exit) var(--meu-motion-ease-standard)",
    "opacity var(--meu-motion-exit) var(--meu-motion-ease-standard)"
  ].join(", "),
  whiteSpace: "nowrap",
  selectors: {
    "&:focus": {
      opacity: 1,
      pointerEvents: "auto",
      outline: "2px solid var(--meu-color-surface)",
      outlineOffset: -4,
      transform: "translate3d(0, 0, 0)"
    },
    "&:disabled": { cursor: "not-allowed", opacity: 0 }
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "1ms" },
    "(forced-colors: active)": {
      color: "ButtonText",
      background: "ButtonFace",
      border: "1px solid ButtonText"
    }
  }
});

export const keyboardActionLeft = style({ left: 4 });
export const keyboardActionRight = style({ right: 4 });
