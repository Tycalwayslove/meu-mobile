import { keyframes, style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

const sweep = keyframes({
  from: { transform: "translate3d(-180%, 0, 0)" },
  to: { transform: "translate3d(480%, 0, 0)" }
});

const sweepRtl = keyframes({
  from: { transform: "translate3d(480%, 0, 0)" },
  to: { transform: "translate3d(-180%, 0, 0)" }
});

export const textGroup = style({
  display: "grid",
  width: "var(--meu-skeleton-width)",
  gap: "var(--meu-space-2)"
});

export const block = recipe({
  base: {
    position: "relative",
    display: "block",
    boxSizing: "border-box",
    overflow: "hidden",
    background: "var(--meu-color-subtle)",
    aspectRatio: "var(--meu-skeleton-aspect-ratio)",
    border: "1px solid transparent",
    selectors: {
      "&::after": {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        width: "25%",
        background: "var(--meu-color-surface)",
        content: "",
        opacity: 0
      }
    },
    "@media": {
      "(forced-colors: active)": {
        borderColor: "GrayText",
        background: "Canvas"
      }
    }
  },
  variants: {
    animated: {
      true: {
        selectors: {
          "&::after": {
            opacity: 0.5,
            transform: "translate3d(150%, 0, 0)",
            animation: `${sweep} 1.4s var(--meu-motion-ease-standard) infinite`
          },
          '[dir="rtl"] &::after': {
            animationName: sweepRtl
          },
          '[data-meu-motion="reduced"] &::after': {
            opacity: 0,
            animation: "none"
          }
        },
        "@media": {
          "(prefers-reduced-motion: reduce)": {
            selectors: { "&::after": { opacity: 0, animation: "none" } }
          }
        }
      },
      false: {}
    },
    variant: {
      text: {
        width: "var(--meu-skeleton-line-width)",
        height: "var(--meu-skeleton-height)",
        borderRadius: 4
      },
      rectangle: {
        width: "var(--meu-skeleton-width)",
        height: "var(--meu-skeleton-height)",
        borderRadius: "var(--meu-radius-surface)"
      },
      circle: {
        width: "var(--meu-skeleton-width)",
        height: "var(--meu-skeleton-height)",
        borderRadius: "var(--meu-radius-round)"
      }
    }
  },
  defaultVariants: { animated: false, variant: "text" }
});
