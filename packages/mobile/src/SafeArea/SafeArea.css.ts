import { recipe } from "@vanilla-extract/recipes";

const fallback = "var(--meu-safe-area-fallback, 0px)";

export const safeArea = recipe({
  base: {
    display: "block",
    boxSizing: "border-box",
    flex: "0 0 auto",
    minWidth: 0,
    minHeight: 0,
    padding: 0,
    pointerEvents: "none"
  },
  variants: {
    position: {
      top: {
        width: "100%",
        height: [fallback, `env(safe-area-inset-top, ${fallback})`]
      },
      right: {
        width: [fallback, `env(safe-area-inset-right, ${fallback})`],
        height: "100%"
      },
      bottom: {
        width: "100%",
        height: [fallback, `env(safe-area-inset-bottom, ${fallback})`]
      },
      left: {
        width: [fallback, `env(safe-area-inset-left, ${fallback})`],
        height: "100%"
      }
    }
  },
  defaultVariants: { position: "bottom" }
});
