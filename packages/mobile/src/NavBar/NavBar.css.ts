import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const root = recipe({
  base: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, auto) minmax(0, 1fr)",
    alignItems: "center",
    minHeight: "var(--meu-size-navbar)",
    boxSizing: "border-box",
    paddingInline: "var(--meu-space-2)",
    color: "var(--meu-color-ink)",
    background: "var(--meu-color-surface)",
    fontFamily: "var(--meu-font-ui)"
  },
  variants: {
    bordered: {
      true: { borderBottom: "1px solid var(--meu-color-border)" },
      false: { borderBottom: "1px solid transparent" }
    }
  },
  defaultVariants: { bordered: true }
});

export const side = style({
  display: "flex",
  alignItems: "center",
  minWidth: 0,
  minHeight: 44
});

export const leftSide = style({ justifyContent: "flex-start" });
export const rightSide = style({ justifyContent: "flex-end" });

export const back = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--meu-space-1)",
  minWidth: 44,
  minHeight: 44,
  boxSizing: "border-box",
  padding: "0 var(--meu-space-2)",
  color: "inherit",
  background: "transparent",
  border: 0,
  borderRadius: "var(--meu-radius-control)",
  font: "inherit",
  textDecoration: "none",
  cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
  selectors: {
    "&:focus": {
      outline: "2px solid var(--meu-color-accent)",
      outlineOffset: 1
    }
  }
});

export const backIcon = style({
  display: "inline-flex",
  flex: "0 0 auto"
});

export const backLabel = style({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: 15,
  lineHeight: 1.4
});

export const leftContent = style({
  display: "inline-flex",
  alignItems: "center",
  minWidth: 0
});

export const title = style({
  minWidth: 0,
  maxWidth: "100%",
  overflow: "hidden",
  textAlign: "center",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: 17,
  fontWeight: 600,
  lineHeight: 1.4
});
