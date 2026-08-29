import { recipe } from "@vanilla-extract/recipes";
import { style } from "@vanilla-extract/css";

export const layer = recipe({
  base: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1000
  },
  variants: {
    state: {
      open: { pointerEvents: "auto" },
      closed: { pointerEvents: "none" }
    }
  },
  defaultVariants: { state: "closed" }
});

export const panel = recipe({
  base: {
    position: "absolute",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    maxWidth: "100%",
    maxHeight: "100%",
    boxSizing: "border-box",
    overflow: "hidden",
    color: "var(--meu-color-ink)",
    background: "var(--meu-color-surface)",
    boxShadow: "var(--meu-shadow-floating)",
    fontFamily: "var(--meu-font-ui)",
    outline: "none",
    transitionProperty: "transform",
    transitionDuration: "var(--meu-motion-enter)",
    transitionTimingFunction: "var(--meu-motion-ease-standard)",
    "@media": {
      "(prefers-reduced-motion: reduce)": { transitionDuration: "1ms" },
      "(forced-colors: active)": {
        border: "1px solid CanvasText",
        boxShadow: "none",
        forcedColorAdjust: "auto"
      }
    }
  },
  variants: {
    position: {
      top: {
        top: 0,
        right: 0,
        left: 0,
        maxHeight: "90vh",
        borderRadius: "0 0 var(--meu-radius-sheet) var(--meu-radius-sheet)"
      },
      right: {
        top: 0,
        right: 0,
        bottom: 0,
        width: "88vw",
        maxWidth: 420,
        borderRadius: "var(--meu-radius-sheet) 0 0 var(--meu-radius-sheet)"
      },
      bottom: {
        right: 0,
        bottom: 0,
        left: 0,
        maxHeight: "90vh",
        borderRadius: "var(--meu-radius-sheet) var(--meu-radius-sheet) 0 0"
      },
      left: {
        top: 0,
        bottom: 0,
        left: 0,
        width: "88vw",
        maxWidth: 420,
        borderRadius: "0 var(--meu-radius-sheet) var(--meu-radius-sheet) 0"
      }
    },
    state: {
      open: { transform: "translate3d(0, 0, 0)" },
      closed: { transitionDuration: "var(--meu-motion-exit)" }
    },
    safeArea: {
      true: {},
      false: {}
    }
  },
  compoundVariants: [
    {
      variants: { position: "top", state: "closed" },
      style: { transform: "translate3d(0, -100%, 0)" }
    },
    {
      variants: { position: "right", state: "closed" },
      style: { transform: "translate3d(100%, 0, 0)" }
    },
    {
      variants: { position: "bottom", state: "closed" },
      style: { transform: "translate3d(0, 100%, 0)" }
    },
    {
      variants: { position: "left", state: "closed" },
      style: { transform: "translate3d(-100%, 0, 0)" }
    },
    {
      variants: { position: "top", safeArea: true },
      style: { paddingTop: "env(safe-area-inset-top, 0px)" }
    },
    {
      variants: { position: "right", safeArea: true },
      style: { paddingRight: "env(safe-area-inset-right, 0px)" }
    },
    {
      variants: { position: "bottom", safeArea: true },
      style: { paddingBottom: "env(safe-area-inset-bottom, 0px)" }
    },
    {
      variants: { position: "left", safeArea: true },
      style: { paddingLeft: "env(safe-area-inset-left, 0px)" }
    }
  ],
  defaultVariants: { position: "bottom", safeArea: true, state: "closed" }
});

export const closeButton = style({
  position: "absolute",
  top: "var(--meu-space-2)",
  right: "var(--meu-space-2)",
  zIndex: 2,
  display: "grid",
  placeItems: "center",
  width: 44,
  height: 44,
  padding: 0,
  color: "var(--meu-color-muted)",
  background: "transparent",
  border: 0,
  borderRadius: "var(--meu-radius-round)",
  cursor: "pointer",
  selectors: {
    "&:focus": { outline: "2px solid var(--meu-color-accent)", outlineOffset: 2 },
    "&:disabled": { cursor: "not-allowed", opacity: 0.5 },
    "[dir='rtl'] &": { right: "auto", left: "var(--meu-space-2)" }
  },
  "@media": {
    "(hover: hover)": {
      selectors: { "&:hover:not(:disabled)": { background: "var(--meu-color-subtle)" } }
    },
    "(forced-colors: active)": {
      color: "ButtonText",
      border: "1px solid ButtonText",
      forcedColorAdjust: "auto"
    }
  }
});

export const body = style({
  minWidth: 0,
  minHeight: 0,
  maxHeight: "100%",
  overflowX: "hidden",
  overflowY: "auto",
  overscrollBehavior: "contain",
  WebkitOverflowScrolling: "touch"
});
