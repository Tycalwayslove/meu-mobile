import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const root = recipe({
  base: {
    display: "grid",
    gridTemplateColumns: "repeat(var(--meu-selector-columns), minmax(0, 1fr))",
    width: "100%",
    minWidth: 0,
    color: "var(--meu-color-ink)",
    fontFamily: "var(--meu-font-ui)"
  },
  variants: {
    size: {
      small: { gap: "var(--meu-space-2)" },
      medium: { gap: "var(--meu-space-3)" },
      large: { gap: "var(--meu-space-3)" }
    },
    status: {
      default: {},
      error: {
        borderRadius: "var(--meu-radius-control)",
        outline: "1px solid var(--meu-color-danger)",
        outlineOffset: 3
      }
    }
  },
  defaultVariants: { size: "medium", status: "default" }
});

export const item = style({ position: "relative", minWidth: 0 });

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

export const option = recipe({
  base: {
    position: "relative",
    display: "grid",
    alignContent: "center",
    minHeight: 44,
    boxSizing: "border-box",
    minWidth: 0,
    color: "var(--meu-color-ink)",
    background: "var(--meu-color-surface)",
    border: "1px solid var(--meu-color-border)",
    borderRadius: "var(--meu-radius-control)",
    cursor: "pointer",
    overflowWrap: "anywhere",
    textAlign: "start",
    touchAction: "manipulation",
    transition: [
      "background-color var(--meu-motion-exit) var(--meu-motion-ease-standard)",
      "border-color var(--meu-motion-exit) var(--meu-motion-ease-standard)"
    ].join(", "),
    WebkitTapHighlightColor: "transparent",
    selectors: {
      [`${input}:focus + &`]: {
        outline: "2px solid var(--meu-color-accent)",
        outlineOffset: 2
      },
      "&:active": {
        background: "var(--meu-color-subtle)"
      }
    },
    "@media": {
      "(prefers-reduced-motion: reduce)": { transitionDuration: "1ms" },
      "(hover: hover)": {
        selectors: {
          "&:hover": { borderColor: "var(--meu-color-muted)" }
        }
      },
      "(forced-colors: active)": {
        borderColor: "ButtonText",
        forcedColorAdjust: "auto"
      }
    }
  },
  variants: {
    active: {
      true: {
        color: "var(--meu-color-accent)",
        background: "var(--meu-color-subtle)",
        borderColor: "var(--meu-color-accent)",
        "@media": {
          "(forced-colors: active)": {
            color: "Highlight",
            borderColor: "Highlight"
          }
        }
      },
      false: {}
    },
    disabled: {
      true: {
        color: "var(--meu-color-muted)",
        background: "var(--meu-color-subtle)",
        cursor: "not-allowed",
        opacity: 0.65,
        pointerEvents: "none",
        "@media": {
          "(forced-colors: active)": {
            color: "GrayText",
            borderColor: "GrayText",
            opacity: 1
          }
        }
      },
      false: {}
    },
    readOnly: {
      true: {
        cursor: "default",
        selectors: { "&:active": { background: "var(--meu-color-surface)" } }
      },
      false: {}
    },
    size: {
      small: { minHeight: 44, padding: "var(--meu-space-2) var(--meu-space-3)", fontSize: 14 },
      medium: { minHeight: 48, padding: "var(--meu-space-3) var(--meu-space-4)", fontSize: 16 },
      large: { minHeight: 52, padding: "var(--meu-space-3) var(--meu-space-4)", fontSize: 16 }
    }
  },
  defaultVariants: { active: false, disabled: false, readOnly: false, size: "medium" }
});

export const label = style({ minWidth: 0, fontWeight: 500, lineHeight: 1.4 });

export const description = style({
  marginTop: 2,
  color: "var(--meu-color-muted)",
  fontSize: 12,
  lineHeight: 1.4
});

export const withCheckMark = style({ paddingInlineEnd: "var(--meu-space-8)" });

export const checkMark = style({
  position: "absolute",
  top: 8,
  insetInlineEnd: 8,
  width: 10,
  height: 6,
  borderLeft: "2px solid var(--meu-color-accent)",
  borderBottom: "2px solid var(--meu-color-accent)",
  transform: "rotate(-45deg)",
  pointerEvents: "none",
  "@media": {
    "(forced-colors: active)": {
      borderColor: "Highlight"
    }
  }
});
