import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const panel = recipe({
  base: {
    position: "fixed",
    right: 0,
    left: 0,
    zIndex: 900,
    display: "flex",
    width: "100%",
    boxSizing: "border-box",
    overflow: "hidden",
    color: "var(--meu-color-ink)",
    background: "var(--meu-color-surface)",
    boxShadow: "var(--meu-shadow-floating)",
    fontFamily: "var(--meu-font-ui)",
    transform: "translate3d(0, var(--meu-floating-panel-translate, 0px), 0)",
    transitionProperty: "transform",
    transitionDuration: "var(--meu-motion-enter)",
    transitionTimingFunction: "var(--meu-motion-ease-standard)",
    willChange: "transform",
    selectors: {
      "&[data-dragging='true']": { transitionDuration: "0ms", userSelect: "none" },
      "&[data-immediate='true']": { transitionDuration: "0ms" },
      "&[data-measured='false']": { visibility: "hidden" }
    },
    "@media": {
      "(prefers-reduced-motion: reduce)": { transitionDuration: "1ms" }
    }
  },
  variants: {
    placement: {
      bottom: {
        bottom: 0,
        flexDirection: "column",
        borderRadius: "var(--meu-radius-sheet) var(--meu-radius-sheet) 0 0"
      },
      top: {
        top: 0,
        flexDirection: "column",
        borderRadius: "0 0 var(--meu-radius-sheet) var(--meu-radius-sheet)"
      }
    },
    safeArea: {
      false: {},
      true: {}
    }
  },
  compoundVariants: [
    {
      variants: { placement: "bottom", safeArea: true },
      style: { paddingBottom: "env(safe-area-inset-bottom, 0px)" }
    },
    {
      variants: { placement: "top", safeArea: true },
      style: { paddingTop: "env(safe-area-inset-top, 0px)" }
    }
  ],
  defaultVariants: { placement: "bottom", safeArea: true }
});

export const handle = style({
  position: "relative",
  zIndex: 1,
  flex: "0 0 44px",
  width: "100%",
  minHeight: 44,
  padding: 0,
  color: "var(--meu-color-muted)",
  background: "var(--meu-color-surface)",
  border: 0,
  touchAction: "none",
  cursor: "grab",
  selectors: {
    "&::before": {
      position: "absolute",
      top: 18,
      left: "50%",
      width: 40,
      height: 4,
      content: "",
      background: "var(--meu-color-border)",
      borderRadius: "var(--meu-radius-round)",
      transform: "translateX(-50%)"
    },
    "&:focus": { outline: "2px solid var(--meu-color-accent)", outlineOffset: -4 },
    "&:active": { cursor: "grabbing" },
    "&:disabled": { cursor: "not-allowed", opacity: 0.55 }
  }
});

export const body = style({
  minWidth: 0,
  minHeight: 0,
  flex: "1 1 auto",
  overflowX: "hidden",
  overflowY: "auto",
  overscrollBehavior: "contain",
  WebkitOverflowScrolling: "touch",
  selectors: {
    "&[data-content-drag='true']": { touchAction: "pan-x", cursor: "grab" },
    "&[data-content-dragging='true']": { cursor: "grabbing" }
  }
});
