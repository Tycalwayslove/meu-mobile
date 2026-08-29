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
    touchAction: "manipulation",
    userSelect: "none",
    WebkitUserSelect: "none",
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
    position: "relative",
    display: "inline-grid",
    placeItems: "center",
    flexShrink: 0,
    boxSizing: "border-box",
    background: "var(--meu-color-surface)",
    border: "2px solid var(--meu-color-border)",
    borderRadius: 6,
    transition: [
      "background-color var(--meu-motion-exit) var(--meu-motion-ease-standard)",
      "border-color var(--meu-motion-exit) var(--meu-motion-ease-standard)"
    ].join(", "),
    selectors: {
      "&::after": {
        content: '""',
        display: "block",
        boxSizing: "border-box",
        opacity: 0,
        transform: "rotate(45deg)",
        transition: "opacity var(--meu-motion-exit) var(--meu-motion-ease-standard)"
      }
    },
    "@media": { "(prefers-reduced-motion: reduce)": { transitionDuration: "1ms" } }
  },
  variants: {
    checked: {
      true: {
        color: "var(--meu-color-accent-contrast)",
        background: "var(--meu-color-accent)",
        borderColor: "var(--meu-color-accent)",
        selectors: {
          "&::after": {
            width: 7,
            height: 12,
            marginTop: -2,
            borderRight: "2px solid currentColor",
            borderBottom: "2px solid currentColor",
            opacity: 1
          }
        }
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
    indeterminate: {
      true: {
        color: "var(--meu-color-accent-contrast)",
        background: "var(--meu-color-accent)",
        borderColor: "var(--meu-color-accent)",
        selectors: {
          "&::after": {
            width: 10,
            height: 2,
            margin: 0,
            background: "currentColor",
            border: 0,
            opacity: 1,
            transform: "none"
          }
        }
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
  compoundVariants: [
    {
      variants: { disabled: true, indeterminate: true },
      style: {
        color: "var(--meu-color-muted)",
        background: "var(--meu-color-subtle)",
        borderColor: "var(--meu-color-border)"
      }
    }
  ],
  defaultVariants: {
    checked: false,
    disabled: false,
    indeterminate: false,
    size: "medium",
    status: "default"
  }
});

globalStyle(`${input} + span::after`, {
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "1ms" }
  }
});

globalStyle(`${input}:checked + span`, {
  "@media": {
    "(forced-colors: active)": {
      background: "Highlight",
      borderColor: "Highlight",
      color: "HighlightText",
      forcedColorAdjust: "none"
    }
  }
});

globalStyle(`${input}:disabled + span`, {
  "@media": {
    "(forced-colors: active)": {
      background: "Canvas",
      borderColor: "GrayText",
      color: "GrayText",
      forcedColorAdjust: "none"
    }
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
      vertical: { flexDirection: "column", alignItems: "flex-start", gap: "var(--meu-space-2)" }
    }
  },
  defaultVariants: { direction: "vertical" }
});
