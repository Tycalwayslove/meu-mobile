import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const wrapper = style({ position: "relative", display: "flex", alignItems: "center" });

export const input = recipe({
  base: {
    width: "100%",
    boxSizing: "border-box",
    color: "var(--meu-color-ink)",
    background: "var(--meu-color-surface)",
    border: "1px solid var(--meu-color-border)",
    borderRadius: "var(--meu-radius-control)",
    fontFamily: "var(--meu-font-ui)",
    outline: "none",
    selectors: {
      "&::placeholder": { color: "var(--meu-color-muted)" },
      "&:focus": {
        borderColor: "var(--meu-color-accent)",
        boxShadow: "0 0 0 1px var(--meu-color-accent)"
      },
      "&:disabled": {
        color: "var(--meu-color-muted)",
        background: "var(--meu-color-subtle)",
        cursor: "not-allowed"
      },
      "&:read-only:not(:disabled)": {
        background: "var(--meu-color-subtle)"
      }
    }
  },
  variants: {
    size: {
      small: { minHeight: 44, paddingInline: "var(--meu-space-3)", fontSize: 14 },
      medium: {
        minHeight: "var(--meu-size-control-medium)",
        paddingInline: "var(--meu-space-4)",
        fontSize: 16
      },
      large: {
        minHeight: "var(--meu-size-control-large)",
        paddingInline: "var(--meu-space-4)",
        fontSize: 16
      }
    },
    status: {
      default: {},
      error: { borderColor: "var(--meu-color-danger)" }
    },
    clearable: {
      true: { paddingInlineEnd: 44 },
      false: {}
    }
  },
  defaultVariants: { size: "medium", status: "default", clearable: false }
});

export const clearButton = style({
  position: "absolute",
  right: 0,
  display: "grid",
  placeItems: "center",
  width: 44,
  height: 44,
  color: "var(--meu-color-muted)",
  background: "transparent",
  border: 0,
  cursor: "pointer",
  selectors: {
    '[dir="rtl"] &': {
      right: "auto",
      left: 0
    },
    "&:focus": {
      outline: "2px solid var(--meu-color-accent)",
      outlineOffset: -2
    }
  }
});
