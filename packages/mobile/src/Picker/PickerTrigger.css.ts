import { recipe } from "@vanilla-extract/recipes";
import { style } from "@vanilla-extract/css";

export const trigger = recipe({
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "var(--meu-space-3)",
    width: "100%",
    minHeight: "var(--meu-size-control-medium)",
    padding: "var(--meu-space-3) var(--meu-space-4)",
    boxSizing: "border-box",
    color: "var(--meu-color-ink)",
    background: "var(--meu-color-surface)",
    border: "1px solid var(--meu-color-border)",
    borderRadius: "var(--meu-radius-control)",
    fontFamily: "var(--meu-font-ui)",
    fontSize: 16,
    lineHeight: 1.4,
    textAlign: "start",
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
    selectors: {
      "&:focus": { outline: "2px solid var(--meu-color-accent)", outlineOffset: 2 },
      "&:disabled": {
        color: "var(--meu-color-muted)",
        background: "var(--meu-color-subtle)",
        cursor: "not-allowed"
      }
    },
    "@media": {
      "(forced-colors: active)": {
        borderColor: "ButtonText",
        selectors: {
          "&:focus": { outlineColor: "Highlight" },
          "&:disabled": { color: "GrayText", borderColor: "GrayText" }
        }
      }
    }
  },
  variants: {
    status: {
      default: {},
      error: {
        borderColor: "var(--meu-color-danger)",
        "@media": { "(forced-colors: active)": { borderStyle: "double" } }
      }
    }
  },
  defaultVariants: { status: "default" }
});

export const valueText = style({
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
});

export const placeholderText = style({
  color: "var(--meu-color-muted)"
});

export const indicator = recipe({
  base: {
    flex: "0 0 auto",
    width: 8,
    height: 8,
    borderRight: "2px solid currentColor",
    borderBottom: "2px solid currentColor",
    transition: "transform var(--meu-motion-exit) var(--meu-motion-ease-standard)",
    "@media": {
      "(prefers-reduced-motion: reduce)": { transitionDuration: "1ms" }
    }
  },
  variants: {
    open: {
      false: { transform: "rotate(45deg) translateY(-2px)" },
      true: { transform: "rotate(225deg) translate(-2px, -2px)" }
    }
  },
  defaultVariants: { open: false }
});
