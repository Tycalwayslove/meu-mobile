import { keyframes, style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

const spin = keyframes({ to: { transform: "rotate(360deg)" } });

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
    },
    "@media": {
      "(forced-colors: active)": { borderColor: "ButtonText" }
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
  },
  "@media": {
    "(forced-colors: active)": { color: "ButtonText", forcedColorAdjust: "auto" }
  }
});

export const loadingIndicator = style({
  position: "absolute",
  right: 0,
  display: "grid",
  placeItems: "center",
  width: 44,
  height: 44,
  selectors: {
    '[dir="rtl"] &': { right: "auto", left: 0 }
  }
});

export const spinner = style({
  width: 16,
  height: 16,
  boxSizing: "border-box",
  border: "2px solid currentColor",
  borderRightColor: "transparent",
  borderRadius: "50%",
  animation: `${spin} 700ms linear infinite`,
  selectors: {
    '[data-meu-motion="reduced"] &': { animation: "none" }
  },
  "@media": {
    "(forced-colors: active)": { borderColor: "ButtonText", borderRightColor: "transparent" },
    "(prefers-reduced-motion: reduce)": { animation: "none" }
  }
});
