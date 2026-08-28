import { globalStyle, style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const root = recipe({
  base: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    minWidth: 44,
    minHeight: 44,
    color: "var(--meu-color-ink)",
    fontFamily: "var(--meu-font-ui)",
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
    outline: "none",
    selectors: {
      "&:focus-within": { outline: "2px solid var(--meu-color-accent)", outlineOffset: 2 }
    }
  },
  variants: {
    disabled: {
      true: { color: "var(--meu-color-muted)", cursor: "not-allowed" },
      false: {}
    },
    readOnly: {
      true: { cursor: "default" },
      false: {}
    },
    size: {
      small: { gap: "var(--meu-space-2)", fontSize: 14 },
      medium: { gap: "var(--meu-space-3)", fontSize: 16 },
      large: { gap: "var(--meu-space-3)", fontSize: 16 }
    }
  },
  defaultVariants: { disabled: false, readOnly: false, size: "medium" }
});

export const input = style({
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0
});

export const indicator = recipe({
  base: {
    display: "inline-grid",
    placeItems: "center",
    flexShrink: 0,
    boxSizing: "border-box",
    background: "var(--meu-color-surface)",
    border: "2px solid var(--meu-color-border)",
    borderRadius: "50%",
    transition: [
      "background-color var(--meu-motion-exit) var(--meu-motion-ease-standard)",
      "border-color var(--meu-motion-exit) var(--meu-motion-ease-standard)"
    ].join(", "),
    selectors: {
      "&::after": {
        content: '""',
        display: "block",
        width: "46%",
        height: "46%",
        background: "currentColor",
        borderRadius: "50%",
        opacity: 0,
        transform: "scale(0.5)",
        transition: [
          "opacity var(--meu-motion-exit) var(--meu-motion-ease-standard)",
          "transform var(--meu-motion-exit) var(--meu-motion-ease-standard)"
        ].join(", ")
      }
    },
    "@media": { "(prefers-reduced-motion: reduce)": { transitionDuration: "1ms" } }
  },
  variants: {
    checked: {
      true: {
        color: "var(--meu-color-accent)",
        borderColor: "var(--meu-color-accent)",
        selectors: { "&::after": { opacity: 1, transform: "scale(1)" } }
      },
      false: {}
    },
    disabled: {
      true: {
        color: "var(--meu-color-muted)",
        background: "var(--meu-color-subtle)",
        borderColor: "var(--meu-color-border)"
      },
      false: {}
    },
    size: {
      small: { width: 20, height: 20 },
      medium: { width: 22, height: 22 },
      large: { width: 24, height: 24 }
    },
    status: {
      default: {},
      error: { borderColor: "var(--meu-color-danger)" }
    }
  },
  defaultVariants: { checked: false, disabled: false, size: "medium", status: "default" }
});

globalStyle(`${input}:checked + span`, {
  "@media": {
    "(forced-colors: active)": {
      borderColor: "Highlight",
      color: "Highlight",
      forcedColorAdjust: "none"
    }
  }
});

globalStyle(`${input} + span::after`, {
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "1ms" }
  }
});

export const group = recipe({
  base: { display: "flex", width: "100%" },
  variants: {
    direction: {
      horizontal: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: "var(--meu-space-3) var(--meu-space-5)"
      },
      vertical: {
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "var(--meu-space-2)"
      }
    }
  },
  defaultVariants: { direction: "vertical" }
});
