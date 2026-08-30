import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const imageRoot = recipe({
  base: {
    position: "relative",
    display: "inline-block",
    boxSizing: "border-box",
    maxWidth: "100%",
    overflow: "hidden",
    color: "var(--meu-color-muted)",
    background: "var(--meu-color-subtle)",
    fontFamily: "var(--meu-font-ui)",
    lineHeight: 0,
    verticalAlign: "middle",
    "@media": {
      "(forced-colors: active)": { border: "1px solid CanvasText" }
    }
  },
  variants: {
    radius: {
      none: { borderRadius: 0 },
      control: { borderRadius: "var(--meu-radius-control)" },
      surface: { borderRadius: "var(--meu-radius-surface)" },
      round: { borderRadius: "var(--meu-radius-round)" }
    }
  },
  defaultVariants: { radius: "none" }
});

export const imageElement = recipe({
  base: {
    display: "block",
    width: "100%",
    maxWidth: "100%",
    transition: "opacity var(--meu-motion-enter) var(--meu-motion-ease-standard)",
    selectors: {
      "&[data-pending='true']": { opacity: 0 },
      '[data-meu-motion="reduced"] &': { transitionDuration: "0ms" }
    },
    "@media": {
      "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
      "(forced-colors: active)": { forcedColorAdjust: "auto" }
    }
  },
  variants: {
    fixedHeight: {
      true: { height: "100%" },
      false: { height: "auto" }
    }
  },
  defaultVariants: { fixedHeight: false }
});

export const stateLayer = recipe({
  base: {
    display: "grid",
    placeItems: "center",
    boxSizing: "border-box",
    width: "100%",
    height: "100%",
    minWidth: 44,
    minHeight: 44,
    padding: "var(--meu-space-2)",
    color: "var(--meu-color-muted)",
    fontSize: 12,
    lineHeight: 1.4,
    textAlign: "center",
    wordBreak: "break-word",
    overflowWrap: "anywhere"
  },
  variants: {
    overlay: {
      true: { position: "absolute", inset: 0 },
      false: {}
    }
  },
  defaultVariants: { overlay: false }
});

export const defaultGlyph = style({
  position: "relative",
  display: "block",
  width: 26,
  height: 20,
  boxSizing: "border-box",
  border: "2px solid currentColor",
  borderRadius: 4,
  opacity: 0.72,
  selectors: {
    "&::before": {
      content: "",
      position: "absolute",
      top: 3,
      right: 4,
      width: 4,
      height: 4,
      borderRadius: "50%",
      background: "currentColor"
    },
    "&::after": {
      content: "",
      position: "absolute",
      left: 4,
      bottom: 3,
      width: 13,
      height: 9,
      borderLeft: "2px solid currentColor",
      borderBottom: "2px solid currentColor",
      transform: "skewX(-34deg) rotate(-18deg)"
    }
  }
});
