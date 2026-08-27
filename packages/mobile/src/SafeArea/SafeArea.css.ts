import { recipe } from "@vanilla-extract/recipes";

export const safeArea = recipe({
  base: { display: "block", width: "100%", boxSizing: "border-box", pointerEvents: "none" },
  variants: {
    position: {
      top: { height: "env(safe-area-inset-top, 0px)" },
      bottom: { height: "env(safe-area-inset-bottom, 0px)" }
    }
  },
  defaultVariants: { position: "bottom" }
});
