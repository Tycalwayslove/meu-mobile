import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const root = style({
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  color: "var(--meu-color-muted)",
  background: "var(--meu-color-surface)",
  borderTop: "1px solid var(--meu-color-border)",
  fontFamily: "var(--meu-font-ui)"
});

export const items = style({
  display: "flex",
  alignItems: "stretch",
  width: "100%",
  minHeight: "var(--meu-size-tabbar)"
});

export const item = recipe({
  base: {
    position: "relative",
    display: "flex",
    flex: "1 1 0",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    minWidth: 0,
    minHeight: "var(--meu-size-tabbar)",
    boxSizing: "border-box",
    padding: "var(--meu-space-1) var(--meu-space-2)",
    color: "var(--meu-color-muted)",
    background: "transparent",
    border: 0,
    borderRadius: 0,
    font: "inherit",
    textDecoration: "none",
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
    transition: "color var(--meu-motion-exit) var(--meu-motion-ease-standard)",
    selectors: {
      "&:focus": {
        zIndex: 1,
        outline: "2px solid var(--meu-color-accent)",
        outlineOffset: -3
      },
      "&:active": { background: "var(--meu-color-subtle)" }
    },
    "@media": { "(prefers-reduced-motion: reduce)": { transitionDuration: "1ms" } }
  },
  variants: {
    active: {
      true: { color: "var(--meu-color-accent)" },
      false: {}
    },
    disabled: {
      true: {
        color: "var(--meu-color-muted)",
        cursor: "not-allowed",
        opacity: 0.5,
        pointerEvents: "none"
      },
      false: {}
    }
  },
  defaultVariants: { active: false, disabled: false }
});

export const icon = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 24,
  height: 24,
  flex: "0 0 auto"
});

export const label = style({
  maxWidth: "100%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: 12,
  fontWeight: 500,
  lineHeight: "16px"
});
