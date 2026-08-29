import { keyframes, style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

const indeterminateMotion = keyframes({
  from: { transform: "translate3d(-100%, 0, 0)" },
  to: { transform: "translate3d(250%, 0, 0)" }
});

const indeterminateMotionRtl = keyframes({
  from: { transform: "translate3d(250%, 0, 0)" },
  to: { transform: "translate3d(-100%, 0, 0)" }
});

export const root = style({
  display: "grid",
  width: "100%",
  minWidth: 0,
  gap: "var(--meu-space-2)",
  color: "var(--meu-color-ink)",
  fontFamily: "var(--meu-font-ui)"
});

export const header = style({
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: "var(--meu-space-3)",
  minWidth: 0,
  fontSize: 14,
  lineHeight: "20px"
});

export const label = style({
  minWidth: 0,
  color: "var(--meu-color-ink)",
  fontWeight: 500,
  overflowWrap: "anywhere"
});

export const value = style({
  flex: "none",
  color: "var(--meu-color-muted)",
  fontVariantNumeric: "tabular-nums"
});

export const track = recipe({
  base: {
    position: "relative",
    width: "100%",
    overflow: "hidden",
    boxSizing: "border-box",
    background: "var(--meu-color-subtle)",
    border: "1px solid transparent",
    borderRadius: "var(--meu-radius-round)",
    "@media": {
      "(forced-colors: active)": { borderColor: "GrayText" }
    }
  },
  variants: {
    size: {
      small: { height: 4 },
      medium: { height: 8 },
      large: { height: 12 }
    }
  },
  defaultVariants: { size: "medium" }
});

export const fill = recipe({
  base: {
    height: "100%",
    borderRadius: "inherit",
    transformOrigin: "left center",
    willChange: "transform",
    "@media": {
      "(prefers-reduced-motion: reduce)": {
        animation: "none",
        transitionDuration: "1ms"
      },
      "(forced-colors: active)": {
        background: "Highlight",
        forcedColorAdjust: "none"
      }
    },
    selectors: {
      '[dir="rtl"] &': { transformOrigin: "right center" }
    }
  },
  variants: {
    state: {
      determinate: {
        width: "100%",
        transform: "scaleX(var(--meu-progress-scale))",
        transition: "transform var(--meu-motion-enter) var(--meu-motion-ease-standard)",
        selectors: {
          '[data-meu-motion="reduced"] &': {
            transitionDuration: "0ms"
          }
        }
      },
      indeterminate: {
        width: "40%",
        transform: "translate3d(75%, 0, 0)",
        animation: `${indeterminateMotion} 1.2s var(--meu-motion-ease-standard) infinite`,
        selectors: {
          '[dir="rtl"] &': {
            animationName: indeterminateMotionRtl
          },
          '[data-meu-motion="reduced"] &': {
            animation: "none",
            transitionDuration: "0ms"
          }
        }
      }
    },
    tone: {
      accent: { background: "var(--meu-color-accent)" },
      success: { background: "var(--meu-color-success)" },
      warning: { background: "var(--meu-color-warning)" },
      danger: { background: "var(--meu-color-danger)" }
    }
  },
  defaultVariants: { state: "determinate", tone: "accent" }
});
