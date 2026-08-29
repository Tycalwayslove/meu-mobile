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
    transition: [
      "background-color var(--meu-motion-exit) var(--meu-motion-ease-standard)",
      "border-color var(--meu-motion-exit) var(--meu-motion-ease-standard)",
      "box-shadow var(--meu-motion-exit) var(--meu-motion-ease-standard)"
    ].join(", "),
    selectors: {
      "&:focus-within": {
        color: "var(--meu-color-accent)",
        background: "var(--meu-color-surface)",
        borderColor: "var(--meu-color-accent)",
        boxShadow: "0 0 0 1px var(--meu-color-accent)"
      }
    },
    "@media": {
      "(forced-colors: active)": {
        borderColor: "ButtonText",
        forcedColorAdjust: "auto"
      },
      "(prefers-reduced-motion: reduce)": { transitionDuration: "1ms" }
    }
  },
  variants: {
    disabled: {
      true: {
        color: "var(--meu-color-muted)",
        background: "var(--meu-color-subtle)",
        borderColor: "var(--meu-color-border)",
        cursor: "not-allowed"
      },
      false: {}
    },
    readOnly: {
      true: {
        background: "var(--meu-color-surface)",
        borderColor: "var(--meu-color-border)"
      },
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
  defaultVariants: { disabled: false, readOnly: false, size: "medium", status: "default" }
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
  appearance: "none",
  WebkitAppearance: "none",
  touchAction: "manipulation",
  fontFamily: "var(--meu-font-ui)",
  fontSize: 16,
  selectors: {
    "&::placeholder": { color: "var(--meu-color-muted)" },
    "&::-webkit-search-decoration": { display: "none" },
    "&::-webkit-search-cancel-button": { display: "none" },
    "&::-webkit-search-results-button": { display: "none" },
    "&:disabled": { color: "var(--meu-color-muted)", cursor: "not-allowed" },
    "&:read-only:not(:disabled)": { cursor: "text" }
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
  touchAction: "manipulation",
  selectors: {
    "&:active": { background: "var(--meu-color-subtle)" },
    "&:focus": { outline: "2px solid var(--meu-color-accent)", outlineOffset: -3 }
  },
  "@media": {
    "(forced-colors: active)": { color: "ButtonText", forcedColorAdjust: "auto" }
  }
});

export const loadingIndicator = style({
  display: "grid",
  placeItems: "center",
  flexShrink: 0,
  width: 44,
  height: 44
});

export const spinner = style({
  width: 16,
  height: 16,
  boxSizing: "border-box",
  border: "2px solid currentColor",
  borderRightColor: "transparent",
  borderRadius: "50%",
  animation: `${spin} 700ms linear infinite`,
  "@media": {
    "(forced-colors: active)": { borderColor: "ButtonText", borderRightColor: "transparent" },
    "(prefers-reduced-motion: reduce)": { animation: "none" }
  }
});
