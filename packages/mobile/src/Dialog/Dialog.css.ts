import { recipe } from "@vanilla-extract/recipes";
import { style } from "@vanilla-extract/css";

export const layer = recipe({
  base: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    padding: "var(--meu-space-6)",
    transition: "opacity var(--meu-motion-enter) var(--meu-motion-ease-standard)",
    "@media": {
      "(prefers-reduced-motion: reduce)": { transitionDuration: "1ms" }
    }
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
  defaultVariants: { state: "closed" }
});

export const panel = recipe({
  base: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    width: "100%",
    maxWidth: 360,
    maxHeight: "calc(100vh - 48px)",
    overflow: "hidden",
    boxSizing: "border-box",
    color: "var(--meu-color-ink)",
    background: "var(--meu-color-surface)",
    border: "1px solid var(--meu-color-border)",
    borderRadius: "var(--meu-radius-sheet)",
    boxShadow: "var(--meu-shadow-floating)",
    fontFamily: "var(--meu-font-ui)",
    outline: "none",
    transition: [
      "opacity var(--meu-motion-enter) var(--meu-motion-ease-standard)",
      "transform var(--meu-motion-enter) var(--meu-motion-ease-standard)"
    ].join(", "),
    "@media": {
      "(prefers-reduced-motion: reduce)": { transitionDuration: "1ms" }
    }
  },
  variants: {
    state: {
      open: { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" },
      closed: {
        opacity: 0,
        transform: "translate3d(0, 8px, 0) scale(0.98)",
        transitionDuration: "var(--meu-motion-exit)"
      }
    }
  },
  defaultVariants: { state: "closed" }
});

export const content = style({
  minHeight: 0,
  padding: "var(--meu-space-6) var(--meu-space-6) var(--meu-space-5)",
  overflowX: "hidden",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch"
});

export const title = style({
  margin: 0,
  color: "var(--meu-color-ink)",
  fontSize: 20,
  fontWeight: 700,
  lineHeight: 1.3,
  letterSpacing: "-0.01em"
});

export const description = style({
  margin: "var(--meu-space-3) 0 0",
  color: "var(--meu-color-muted)",
  fontSize: 15,
  lineHeight: 1.6,
  whiteSpace: "pre-wrap"
});

export const body = style({
  marginTop: "var(--meu-space-4)"
});

export const actions = recipe({
  base: {
    display: "flex",
    gap: "var(--meu-space-3)",
    padding: "0 var(--meu-space-6) var(--meu-space-6)"
  },
  variants: {
    layout: {
      horizontal: { flexDirection: "row" },
      vertical: { flexDirection: "column" }
    }
  },
  defaultVariants: { layout: "horizontal" }
});

export const action = style({
  minWidth: 0,
  flex: "1 1 0"
});
