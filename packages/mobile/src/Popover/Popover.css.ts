import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const floating = recipe({
  base: {
    zIndex: 1050,
    boxSizing: "border-box",
    width: "max-content",
    minWidth: 120,
    maxWidth: "min(320px, calc(100vw - 32px))",
    maxHeight: "min(70vh, 480px)",
    overflow: "auto",
    overscrollBehavior: "contain",
    WebkitOverflowScrolling: "touch",
    padding: "var(--meu-space-3)",
    color: "var(--meu-color-ink)",
    background: "var(--meu-color-surface)",
    border: "1px solid var(--meu-color-border)",
    borderRadius: "var(--meu-radius-surface)",
    boxShadow: "var(--meu-shadow-floating)",
    fontFamily: "var(--meu-font-ui)",
    fontSize: "var(--meu-font-label-font-size)",
    lineHeight: "var(--meu-font-label-line-height)",
    overflowWrap: "anywhere",
    wordBreak: "break-word",
    outline: "none",
    transform: "scale(0.96)",
    opacity: 0,
    transitionProperty: "transform, opacity",
    transitionDuration: "var(--meu-motion-exit)",
    transitionTimingFunction: "var(--meu-motion-ease-standard)",
    selectors: {
      "&[data-placement^='top']": { transformOrigin: "bottom center" },
      "&[data-placement^='right']": { transformOrigin: "left center" },
      "&[data-placement^='bottom']": { transformOrigin: "top center" },
      "&[data-placement^='left']": { transformOrigin: "right center" },
      "&[data-reference-hidden='true']": { visibility: "hidden" }
    },
    "@media": {
      "(prefers-reduced-motion: reduce)": {
        transform: "none",
        transitionDuration: "1ms"
      },
      "(forced-colors: active)": {
        color: "CanvasText",
        background: "Canvas",
        borderColor: "CanvasText",
        boxShadow: "none"
      }
    }
  },
  variants: {
    state: {
      open: {
        pointerEvents: "auto",
        transform: "scale(1)",
        opacity: 1,
        transitionDuration: "var(--meu-motion-enter)"
      },
      closed: { pointerEvents: "none" }
    }
  },
  defaultVariants: { state: "closed" }
});

export const arrow = style({
  fill: "var(--meu-color-surface)",
  stroke: "var(--meu-color-border)",
  pointerEvents: "none",
  "@media": {
    "(forced-colors: active)": { fill: "Canvas", stroke: "CanvasText" }
  }
});
