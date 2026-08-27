import { keyframes, style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

const spin = keyframes({ to: { transform: "rotate(360deg)" } });

export const root = recipe({
  base: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    boxSizing: "border-box",
    color: "var(--meu-color-muted)",
    background: "var(--meu-color-subtle)",
    border: "1px solid transparent",
    borderRadius: "var(--meu-radius-control)",
    selectors: {
      "&:focus-within": {
        color: "var(--meu-color-accent)",
        background: "var(--meu-color-surface)",
        borderColor: "var(--meu-color-accent)",
        boxShadow: "0 0 0 1px var(--meu-color-accent)"
      }
    }
  },
  variants: {
    disabled: {
      true: { color: "var(--meu-color-muted)", cursor: "not-allowed", opacity: 0.72 },
      false: {}
    },
    size: {
      small: { minHeight: 44, paddingInlineStart: "var(--meu-space-3)" },
      medium: {
        minHeight: "var(--meu-size-control-medium)",
        paddingInlineStart: "var(--meu-space-4)"
      },
      large: {
        minHeight: "var(--meu-size-control-large)",
        paddingInlineStart: "var(--meu-space-4)"
      }
    },
    status: {
      default: {},
      error: { borderColor: "var(--meu-color-danger)" }
    }
  },
  defaultVariants: { disabled: false, size: "medium", status: "default" }
});

export const searchIcon = style({
  display: "grid",
  placeItems: "center",
  flexShrink: 0,
  width: 20,
  height: 20
});

export const input = style({
  flex: 1,
  minWidth: 0,
  minHeight: 42,
  padding: "0 var(--meu-space-2)",
  color: "var(--meu-color-ink)",
  background: "transparent",
  border: 0,
  outline: 0,
  fontFamily: "var(--meu-font-ui)",
  fontSize: 16,
  selectors: {
    "&::placeholder": { color: "var(--meu-color-muted)" },
    "&::-webkit-search-cancel-button": { display: "none" },
    "&:disabled": { color: "var(--meu-color-muted)", cursor: "not-allowed" }
  }
});

export const clearButton = style({
  display: "grid",
  placeItems: "center",
  flexShrink: 0,
  width: 44,
  height: 44,
  padding: 0,
  color: "var(--meu-color-muted)",
  background: "transparent",
  border: 0,
  borderRadius: "var(--meu-radius-control)",
  cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
  selectors: {
    "&:focus": { outline: "2px solid var(--meu-color-accent)", outlineOffset: -3 }
  }
});

export const spinner = style({
  flexShrink: 0,
  width: 16,
  height: 16,
  marginInline: 14,
  border: "2px solid currentColor",
  borderRightColor: "transparent",
  borderRadius: "50%",
  animation: `${spin} 700ms linear infinite`,
  "@media": { "(prefers-reduced-motion: reduce)": { animationDuration: "1400ms" } }
});
