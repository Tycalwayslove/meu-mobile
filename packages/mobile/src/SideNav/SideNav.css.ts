import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const root = recipe({
  base: {
    display: "grid",
    minWidth: 0,
    color: "var(--meu-color-ink)",
    background: "var(--meu-color-surface)",
    fontFamily: "var(--meu-font-ui)"
  },
  variants: {
    hasPanels: {
      true: { gridTemplateColumns: "104px minmax(0, 1fr)" },
      false: { gridTemplateColumns: "104px", width: 104 }
    }
  },
  defaultVariants: { hasPanels: false }
});

export const list = style({
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  overflowX: "hidden",
  overflowY: "auto",
  background: "var(--meu-color-subtle)",
  borderInlineEnd: "1px solid var(--meu-color-border)",
  WebkitOverflowScrolling: "touch"
});

export const item = recipe({
  base: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--meu-space-1)",
    width: "100%",
    minHeight: 52,
    boxSizing: "border-box",
    padding: "var(--meu-space-2) var(--meu-space-3)",
    color: "var(--meu-color-muted)",
    background: "transparent",
    border: 0,
    borderRadius: 0,
    font: "inherit",
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 1.3,
    textAlign: "center",
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
    "@media": {
      "(forced-colors: active)": { borderBlockEnd: "1px solid CanvasText" }
    },
    selectors: {
      "&:focus": {
        zIndex: 2,
        outline: "2px solid var(--meu-color-accent)",
        outlineOffset: -2
      }
    }
  },
  variants: {
    active: {
      true: {
        color: "var(--meu-color-ink)",
        background: "var(--meu-color-surface)",
        fontWeight: 600,
        "@media": {
          "(forced-colors: active)": {
            color: "HighlightText",
            background: "Highlight",
            outline: "2px solid Highlight",
            outlineOffset: -3
          }
        },
        selectors: {
          "&::before": {
            position: "absolute",
            top: 10,
            bottom: 10,
            insetInlineStart: 0,
            width: 3,
            content: "",
            background: "var(--meu-color-accent)",
            borderRadius: "var(--meu-radius-round)"
          }
        }
      },
      false: {}
    },
    disabled: {
      true: { cursor: "not-allowed", opacity: 0.5 },
      false: {}
    }
  },
  defaultVariants: { active: false, disabled: false }
});

export const label = style({
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  overflowWrap: "anywhere"
});

export const badge = style({
  display: "inline-flex",
  flex: "0 0 auto",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 18,
  minHeight: 18,
  boxSizing: "border-box",
  padding: "0 5px",
  color: "var(--meu-color-danger-contrast)",
  background: "var(--meu-color-danger)",
  borderRadius: "var(--meu-radius-round)",
  fontSize: 11,
  fontWeight: 700,
  lineHeight: 1
});

export const panel = style({
  minWidth: 0,
  padding: "var(--meu-space-4)",
  outline: "none",
  selectors: {
    "&:focus": {
      outline: "2px solid var(--meu-color-accent)",
      outlineOffset: -2
    }
  },
  "@media": { "(forced-colors: active)": { border: "1px solid CanvasText" } }
});
