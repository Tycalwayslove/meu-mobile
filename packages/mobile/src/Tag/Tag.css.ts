import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const tagGroup = style({
  display: "inline-flex",
  alignItems: "center",
  minWidth: 0,
  maxWidth: "100%",
  verticalAlign: "middle"
});

export const tagRoot = recipe({
  base: {
    position: "relative",
    display: "inline-grid",
    placeItems: "center",
    boxSizing: "border-box",
    minWidth: 0,
    maxWidth: "100%",
    padding: 0,
    color: "inherit",
    background: "transparent",
    border: 0,
    font: "inherit",
    verticalAlign: "middle",
    WebkitTapHighlightColor: "transparent"
  },
  variants: {
    disabled: {
      true: {
        cursor: "not-allowed",
        opacity: 0.55,
        "@media": {
          "(forced-colors: active)": { color: "GrayText", opacity: 1 }
        }
      },
      false: {}
    },
    interactive: {
      true: {
        minWidth: 44,
        minHeight: 44,
        cursor: "pointer",
        selectors: {
          "&:focus": { outline: "2px solid var(--meu-color-accent)", outlineOffset: 1 },
          "&:active:not(:disabled)": { transform: "scale(0.98)" }
        },
        transition: "transform var(--meu-motion-exit) var(--meu-motion-ease-standard)",
        "@media": {
          "(prefers-reduced-motion: reduce)": { transition: "none" },
          "(forced-colors: active)": {
            selectors: {
              "&:focus": { outlineColor: "Highlight" }
            }
          }
        }
      },
      false: {}
    }
  },
  defaultVariants: { disabled: false, interactive: false }
});

export const tagChip = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    maxWidth: "100%",
    border: "1px solid transparent",
    fontFamily: "var(--meu-font-ui)",
    fontWeight: 500,
    lineHeight: 1,
    whiteSpace: "nowrap",
    "@media": {
      "(forced-colors: active)": {
        borderColor: "CanvasText",
        color: "CanvasText",
        background: "Canvas"
      }
    }
  },
  variants: {
    disabled: {
      true: {
        "@media": {
          "(forced-colors: active)": {
            color: "GrayText",
            borderColor: "GrayText"
          }
        }
      },
      false: {}
    },
    rounded: {
      true: { borderRadius: "var(--meu-radius-round)" },
      false: { borderRadius: 6 }
    },
    selected: {
      true: { boxShadow: "inset 0 0 0 1px currentColor" },
      false: {}
    },
    size: {
      small: { minHeight: 22, padding: "2px 7px", fontSize: 11 },
      medium: { minHeight: 26, padding: "3px 9px", fontSize: 12 },
      large: { minHeight: 30, padding: "4px 11px", fontSize: 14 }
    },
    tone: {
      neutral: {},
      accent: {},
      success: {},
      warning: {},
      danger: {}
    },
    variant: {
      solid: {},
      soft: { background: "var(--meu-color-subtle)" },
      outline: { background: "transparent" }
    }
  },
  compoundVariants: [
    {
      variants: { tone: "neutral", variant: "solid" },
      style: { color: "var(--meu-color-surface)", background: "var(--meu-color-ink)" }
    },
    {
      variants: { tone: "accent", variant: "solid" },
      style: { color: "var(--meu-color-accent-contrast)", background: "var(--meu-color-accent)" }
    },
    {
      variants: { tone: "success", variant: "solid" },
      style: {
        color: "var(--meu-color-success-contrast)",
        background: "var(--meu-color-success)"
      }
    },
    {
      variants: { tone: "warning", variant: "solid" },
      style: {
        color: "var(--meu-color-warning-contrast)",
        background: "var(--meu-color-warning)"
      }
    },
    {
      variants: { tone: "danger", variant: "solid" },
      style: {
        color: "var(--meu-color-danger-contrast)",
        background: "var(--meu-color-danger)"
      }
    },
    {
      variants: { tone: "neutral", variant: "soft" },
      style: { color: "var(--meu-color-ink)" }
    },
    {
      variants: { tone: "accent", variant: "soft" },
      style: { color: "var(--meu-color-accent)" }
    },
    {
      variants: { tone: "success", variant: "soft" },
      style: { color: "var(--meu-color-success)" }
    },
    {
      variants: { tone: "warning", variant: "soft" },
      style: { color: "var(--meu-color-warning)" }
    },
    {
      variants: { tone: "danger", variant: "soft" },
      style: { color: "var(--meu-color-danger)" }
    },
    {
      variants: { tone: "neutral", variant: "outline" },
      style: { color: "var(--meu-color-ink)", borderColor: "var(--meu-color-border)" }
    },
    {
      variants: { tone: "accent", variant: "outline" },
      style: { color: "var(--meu-color-accent)", borderColor: "var(--meu-color-accent)" }
    },
    {
      variants: { tone: "success", variant: "outline" },
      style: { color: "var(--meu-color-success)", borderColor: "var(--meu-color-success)" }
    },
    {
      variants: { tone: "warning", variant: "outline" },
      style: { color: "var(--meu-color-warning)", borderColor: "var(--meu-color-warning)" }
    },
    {
      variants: { tone: "danger", variant: "outline" },
      style: { color: "var(--meu-color-danger)", borderColor: "var(--meu-color-danger)" }
    }
  ],
  defaultVariants: {
    disabled: false,
    rounded: false,
    selected: false,
    size: "medium",
    tone: "neutral",
    variant: "soft"
  }
});

export const tagContent = style({
  minWidth: 0,
  maxWidth: "24ch",
  overflow: "hidden",
  textOverflow: "ellipsis",
  wordBreak: "break-word",
  overflowWrap: "anywhere"
});

export const tagClose = style({
  display: "inline-grid",
  placeItems: "center",
  flex: "0 0 auto",
  boxSizing: "border-box",
  width: 44,
  minWidth: 44,
  height: 44,
  marginInlineStart: -4,
  padding: 0,
  color: "var(--meu-color-muted)",
  background: "transparent",
  border: 0,
  borderRadius: "var(--meu-radius-round)",
  font: "inherit",
  fontSize: 20,
  cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
  selectors: {
    "&:focus": { outline: "2px solid var(--meu-color-accent)", outlineOffset: -4 },
    "&:active:not(:disabled)": { transform: "scale(0.94)" },
    "&:disabled": { cursor: "not-allowed", opacity: 0.55 }
  },
  transition: "transform var(--meu-motion-exit) var(--meu-motion-ease-standard)",
  "@media": {
    "(prefers-reduced-motion: reduce)": { transition: "none" },
    "(forced-colors: active)": {
      color: "ButtonText",
      border: "1px solid ButtonText",
      selectors: {
        "&:disabled": { color: "GrayText", opacity: 1 },
        "&:focus": { outlineColor: "Highlight" }
      }
    }
  }
});
