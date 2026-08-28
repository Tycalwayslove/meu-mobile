import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const layer = recipe({
  base: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1020
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
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    width: "100%",
    maxHeight: "90vh",
    boxSizing: "border-box",
    overflow: "hidden",
    color: "var(--meu-color-ink)",
    background: "var(--meu-color-surface)",
    borderRadius: "var(--meu-radius-sheet) var(--meu-radius-sheet) 0 0",
    boxShadow: "var(--meu-shadow-floating)",
    fontFamily: "var(--meu-font-ui)",
    outline: "none",
    willChange: "transform",
    transitionProperty: "transform",
    transitionDuration: "var(--meu-motion-enter)",
    transitionTimingFunction: "var(--meu-motion-ease-standard)",
    selectors: {
      "&[data-dragging='true']": { transitionDuration: "0ms", userSelect: "none" }
    },
    "@media": {
      "(prefers-reduced-motion: reduce)": { transitionDuration: "1ms" },
      "(forced-colors: active)": {
        color: "CanvasText",
        background: "Canvas",
        boxShadow: "none"
      }
    }
  },
  variants: {
    safeArea: {
      true: { paddingBottom: "env(safe-area-inset-bottom, 0px)" },
      false: {}
    },
    state: {
      open: { transform: "translate3d(0, var(--meu-bottom-sheet-offset, 0px), 0)" },
      closed: {
        transform: "translate3d(0, 100%, 0)",
        transitionDuration: "var(--meu-motion-exit)"
      }
    }
  },
  defaultVariants: { safeArea: true, state: "closed" }
});

export const dragHandle = style({
  position: "relative",
  flex: "0 0 44px",
  width: "100%",
  minHeight: 44,
  padding: 0,
  color: "var(--meu-color-muted)",
  background: "transparent",
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
    "&:active": { cursor: "grabbing" }
  }
});

export const header = style({
  display: "flex",
  flex: "0 0 auto",
  alignItems: "center",
  minHeight: 44,
  padding: "0 var(--meu-space-3)",
  borderBottom: "1px solid var(--meu-color-border)"
});

export const title = style({
  minWidth: 0,
  flex: "1 1 auto",
  margin: 0,
  padding: "var(--meu-space-2) 0",
  fontSize: "var(--meu-font-title-font-size)",
  fontWeight: "var(--meu-font-title-font-weight)",
  lineHeight: "var(--meu-font-title-line-height)",
  overflowWrap: "anywhere",
  wordBreak: "break-word"
});

export const closeButton = style({
  display: "grid",
  flex: "0 0 44px",
  placeItems: "center",
  width: 44,
  height: 44,
  marginInlineStart: "auto",
  padding: 0,
  color: "var(--meu-color-muted)",
  background: "transparent",
  border: 0,
  borderRadius: "var(--meu-radius-round)",
  cursor: "pointer",
  selectors: {
    "&:focus": { outline: "2px solid var(--meu-color-accent)", outlineOffset: 2 }
  },
  "@media": {
    "(hover: hover)": {
      selectors: { "&:hover": { background: "var(--meu-color-subtle)" } }
    }
  }
});

export const body = style({
  minWidth: 0,
  minHeight: 0,
  flex: "1 1 auto",
  overflowX: "hidden",
  overflowY: "auto",
  overscrollBehavior: "contain",
  WebkitOverflowScrolling: "touch"
});

export const content = style({ minWidth: 0 });
