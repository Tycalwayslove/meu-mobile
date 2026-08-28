import { recipe } from "@vanilla-extract/recipes";

export const space = recipe({
  base: { display: "inline-flex", boxSizing: "border-box", minWidth: 0 },
  variants: {
    direction: { horizontal: { flexDirection: "row" }, vertical: { flexDirection: "column" } },
    align: {
      start: { alignItems: "flex-start" },
      center: { alignItems: "center" },
      end: { alignItems: "flex-end" },
      baseline: { alignItems: "baseline" },
      stretch: { alignItems: "stretch" }
    },
    gap: {
      1: { gap: "var(--meu-space-1)" },
      2: { gap: "var(--meu-space-2)" },
      3: { gap: "var(--meu-space-3)" },
      4: { gap: "var(--meu-space-4)" },
      5: { gap: "var(--meu-space-5)" },
      6: { gap: "var(--meu-space-6)" },
      8: { gap: "var(--meu-space-8)" },
      10: { gap: "var(--meu-space-10)" },
      12: { gap: "var(--meu-space-12)" }
    },
    block: { true: { display: "flex", width: "100%" }, false: {} },
    wrap: { true: { flexWrap: "wrap" }, false: { flexWrap: "nowrap" } }
  },
  defaultVariants: { direction: "horizontal", align: "center", gap: 2, block: false, wrap: false }
});
