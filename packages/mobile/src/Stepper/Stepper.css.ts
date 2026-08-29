import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const root = recipe({
  base: {
    display: "inline-grid",
    gridTemplateColumns: "auto minmax(52px, 1fr) auto",
    alignItems: "stretch",
    boxSizing: "border-box",
    overflow: "hidden",
    color: "var(--meu-color-ink)",
    background: "var(--meu-color-surface)",
    border: "1px solid var(--meu-color-border)",
    borderRadius: "var(--meu-radius-control)",
    fontFamily: "var(--meu-font-ui)",
    transition: [
      "border-color var(--meu-motion-exit) var(--meu-motion-ease-standard)",
      "box-shadow var(--meu-motion-exit) var(--meu-motion-ease-standard)"
    ].join(", "),
    selectors: {
      "&:focus-within": {
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
      true: { color: "var(--meu-color-muted)", background: "var(--meu-color-subtle)" },
      false: {}
    },
    size: {
      small: { minHeight: 44 },
      medium: { minHeight: 48 },
      large: { minHeight: 52 }
    },
    status: {
      default: {},
      error: { borderColor: "var(--meu-color-danger)" }
    }
  },
  defaultVariants: { disabled: false, size: "medium", status: "default" }
});

export const button = style({
  display: "grid",
  placeItems: "center",
  minWidth: 44,
  minHeight: 44,
  padding: 0,
  color: "inherit",
  background: "transparent",
  border: 0,
  font: "inherit",
  fontSize: 22,
  lineHeight: 1,
  cursor: "pointer",
  touchAction: "manipulation",
  userSelect: "none",
  WebkitTapHighlightColor: "transparent",
  selectors: {
    "&:first-child": { borderInlineEnd: "1px solid var(--meu-color-border)" },
    "&:last-child": { borderInlineStart: "1px solid var(--meu-color-border)" },
    "&:active:not(:disabled)": { background: "var(--meu-color-subtle)" },
    "&:focus": {
      position: "relative",
      zIndex: 1,
      outline: "2px solid var(--meu-color-accent)",
      outlineOffset: -3
    },
    "&:disabled": { color: "var(--meu-color-muted)", cursor: "not-allowed", opacity: 0.55 }
  },
  "@media": {
    "(forced-colors: active)": {
      borderColor: "ButtonText"
    }
  }
});

export const input = style({
  width: "100%",
  minWidth: 0,
  padding: "0 var(--meu-space-2)",
  color: "inherit",
  background: "transparent",
  border: 0,
  outline: 0,
  font: "inherit",
  fontVariantNumeric: "tabular-nums",
  textAlign: "center",
  selectors: {
    "&:disabled": { WebkitTextFillColor: "var(--meu-color-muted)", opacity: 1 }
  },
  "@media": {
    "(forced-colors: active)": {
      color: "FieldText"
    }
  }
});
