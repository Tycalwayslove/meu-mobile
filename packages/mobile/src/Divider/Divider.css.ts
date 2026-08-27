import { recipe } from "@vanilla-extract/recipes";
import { style } from "@vanilla-extract/css";

export const divider = recipe({
  base: { boxSizing: "border-box", color: "var(--meu-color-muted)", fontSize: 12 },
  variants: {
    direction: {
      horizontal: {
        display: "flex",
        width: "100%",
        alignItems: "center",
        gap: "var(--meu-space-3)"
      },
      vertical: {
        display: "inline-block",
        width: 1,
        minHeight: "1em",
        alignSelf: "stretch",
        background: "var(--meu-color-border)"
      }
    }
  },
  defaultVariants: { direction: "horizontal" }
});

export const line = style({
  height: 1,
  minWidth: "var(--meu-space-4)",
  flex: 1,
  background: "var(--meu-color-border)"
});
export const shortLine = style({ flexGrow: 0, flexBasis: "var(--meu-space-12)" });
export const content = style({
  flex: "none",
  fontFamily: "var(--meu-font-ui)",
  lineHeight: "var(--meu-font-meta-line-height)"
});
