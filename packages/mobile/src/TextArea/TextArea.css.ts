import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const root = style({ display: "grid", gap: "var(--meu-space-2)", width: "100%" });

export const textarea = recipe({
  base: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    color: "var(--meu-color-ink)",
    background: "var(--meu-color-surface)",
    border: "1px solid var(--meu-color-border)",
    borderRadius: "var(--meu-radius-control)",
    fontFamily: "var(--meu-font-ui)",
    outline: "none",
    resize: "vertical",
    selectors: {
      "&::placeholder": { color: "var(--meu-color-muted)" },
      "&:focus": {
        borderColor: "var(--meu-color-accent)",
        boxShadow: "0 0 0 1px var(--meu-color-accent)"
      },
      "&:disabled": {
        color: "var(--meu-color-muted)",
        background: "var(--meu-color-subtle)",
        cursor: "not-allowed",
        resize: "none"
      }
    }
  },
  variants: {
    autoSize: {
      true: { overflowY: "hidden", resize: "none" },
      false: {}
    },
    size: {
      small: {
        minHeight: 80,
        padding: "var(--meu-space-2) var(--meu-space-3)",
        fontSize: 14,
        lineHeight: "20px"
      },
      medium: {
        minHeight: 96,
        padding: "var(--meu-space-3) var(--meu-space-4)",
        fontSize: 16,
        lineHeight: "24px"
      },
      large: {
        minHeight: 120,
        padding: "var(--meu-space-4)",
        fontSize: 16,
        lineHeight: "24px"
      }
    },
    status: {
      default: {},
      error: { borderColor: "var(--meu-color-danger)" }
    }
  },
  defaultVariants: { autoSize: false, size: "medium", status: "default" }
});

export const counter = style({
  justifySelf: "end",
  color: "var(--meu-color-muted)",
  fontFamily: "var(--meu-font-ui)",
  fontSize: "var(--meu-font-meta-font-size)",
  lineHeight: "var(--meu-font-meta-line-height)"
});
