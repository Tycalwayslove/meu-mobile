import { recipe } from "@vanilla-extract/recipes";
import { style } from "@vanilla-extract/css";

export const divider = recipe({
  base: {
    boxSizing: "border-box",
    minWidth: 0,
    color: "var(--meu-color-muted)",
    fontSize: 12,
    forcedColorAdjust: "auto",
    "@media": { "(forced-colors: active)": { color: "CanvasText" } }
  },
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
        background: "var(--meu-color-border)",
        "@media": { "(forced-colors: active)": { background: "CanvasText" } }
      }
    }
  },
  defaultVariants: { direction: "horizontal" }
});

export const line = style({
  height: 1,
  minWidth: "var(--meu-space-4)",
  flex: 1,
  background: "var(--meu-color-border)",
  "@media": { "(forced-colors: active)": { background: "CanvasText" } }
});
export const shortLine = style({ flexGrow: 0, flexBasis: "var(--meu-space-12)" });
export const content = style({
  minWidth: 0,
  flex: "0 1 auto",
  fontFamily: "var(--meu-font-ui)",
  lineHeight: "var(--meu-font-meta-line-height)",
  overflowWrap: "anywhere"
});
