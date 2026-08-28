import { keyframes, style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

const blink = keyframes({
  "0%, 45%": { opacity: 1 },
  "50%, 95%": { opacity: 0 },
  "100%": { opacity: 1 }
});

export const root = style({
  position: "relative",
  display: "flex",
  width: "100%",
  minWidth: 0,
  overflowX: "auto",
  boxSizing: "border-box",
  fontFamily: "var(--meu-font-ui)",
  WebkitOverflowScrolling: "touch"
});

export const cells = style({
  display: "flex",
  width: "100%",
  minWidth: "max-content"
});

export const separatedCells = style({ gap: "var(--meu-space-2)" });

export const nativeInput = style({
  position: "absolute",
  zIndex: 3,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  width: "100%",
  height: "100%",
  minHeight: 48,
  margin: 0,
  padding: 0,
  boxSizing: "border-box",
  color: "transparent",
  background: "transparent",
  border: 0,
  borderRadius: "var(--meu-radius-control)",
  caretColor: "transparent",
  cursor: "text",
  fontSize: 16,
  opacity: 0,
  WebkitTapHighlightColor: "transparent",
  selectors: {
    "&:focus": { outline: "none" },
    "&:disabled": { cursor: "not-allowed" }
  }
});

export const cell = recipe({
  base: {
    position: "relative",
    display: "grid",
    flex: "1 0 44px",
    minWidth: 44,
    height: 52,
    placeItems: "center",
    boxSizing: "border-box",
    color: "var(--meu-color-ink)",
    background: "var(--meu-color-surface)",
    border: "1px solid var(--meu-color-border)",
    fontSize: 22,
    fontWeight: 600,
    lineHeight: 1,
    transition: [
      "border-color var(--meu-motion-exit) var(--meu-motion-ease-standard)",
      "box-shadow var(--meu-motion-exit) var(--meu-motion-ease-standard)",
      "background-color var(--meu-motion-exit) var(--meu-motion-ease-standard)"
    ].join(", "),
    "@media": {
      "(prefers-reduced-motion: reduce)": { transitionDuration: "1ms" }
    }
  },
  variants: {
    active: {
      true: {
        zIndex: 1,
        borderColor: "var(--meu-color-accent)",
        boxShadow: "inset 0 0 0 1px var(--meu-color-accent)"
      },
      false: {}
    },
    disabled: {
      true: {
        color: "var(--meu-color-muted)",
        background: "var(--meu-color-subtle)"
      },
      false: {}
    },
    direction: {
      ltr: {},
      rtl: {}
    },
    position: {
      single: { borderRadius: "var(--meu-radius-control)" },
      first: { borderRadius: "var(--meu-radius-control) 0 0 var(--meu-radius-control)" },
      middle: { marginInlineStart: -1, borderRadius: 0 },
      last: {
        marginInlineStart: -1,
        borderRadius: "0 var(--meu-radius-control) var(--meu-radius-control) 0"
      },
      separated: { borderRadius: "var(--meu-radius-control)" }
    },
    status: {
      default: {},
      error: { borderColor: "var(--meu-color-danger)" }
    }
  },
  compoundVariants: [
    {
      variants: { direction: "rtl", position: "first" },
      style: { borderRadius: "0 var(--meu-radius-control) var(--meu-radius-control) 0" }
    },
    {
      variants: { direction: "rtl", position: "last" },
      style: { borderRadius: "var(--meu-radius-control) 0 0 var(--meu-radius-control)" }
    }
  ],
  defaultVariants: {
    active: false,
    disabled: false,
    direction: "ltr",
    position: "middle",
    status: "default"
  }
});

export const dot = style({
  display: "block",
  width: 10,
  height: 10,
  background: "currentColor",
  borderRadius: "var(--meu-radius-full)"
});

export const character = style({
  display: "block",
  maxWidth: "100%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
});

export const caret = style({
  display: "block",
  width: 2,
  height: 24,
  background: "var(--meu-color-accent)",
  borderRadius: "var(--meu-radius-full)",
  animation: `${blink} 1s step-end infinite`,
  "@media": {
    "(prefers-reduced-motion: reduce)": { animation: "none" }
  }
});
