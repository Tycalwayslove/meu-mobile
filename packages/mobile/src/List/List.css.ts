import { globalStyle, keyframes, style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const root = style({
  width: "100%",
  minWidth: 0,
  color: "var(--meu-color-ink)",
  fontFamily: "var(--meu-font-ui)"
});

export const header = recipe({
  base: {
    color: "var(--meu-color-muted)",
    fontSize: 14,
    fontWeight: 500,
    lineHeight: "20px"
  },
  variants: {
    mode: {
      plain: { padding: "var(--meu-space-2) var(--meu-space-4)" },
      card: { padding: "0 var(--meu-space-1) var(--meu-space-2)" }
    }
  },
  defaultVariants: { mode: "plain" }
});

export const footer = recipe({
  base: {
    color: "var(--meu-color-muted)",
    fontSize: 12,
    lineHeight: "18px"
  },
  variants: {
    mode: {
      plain: { padding: "var(--meu-space-2) var(--meu-space-4)" },
      card: { padding: "var(--meu-space-2) var(--meu-space-1) 0" }
    }
  },
  defaultVariants: { mode: "plain" }
});

export const body = recipe({
  base: {
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    overflow: "hidden",
    background: "var(--meu-color-surface)",
    "@media": { "(forced-colors: active)": { borderColor: "CanvasText" } }
  },
  variants: {
    mode: {
      plain: {
        borderTop: "1px solid var(--meu-color-border)",
        borderBottom: "1px solid var(--meu-color-border)"
      },
      card: {
        border: "1px solid var(--meu-color-border)",
        borderRadius: "var(--meu-radius-surface)"
      }
    }
  },
  defaultVariants: { mode: "plain" }
});

export const cellFrame = style({ position: "relative", minWidth: 0 });

export const row = recipe({
  base: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    width: "100%",
    minWidth: 0,
    minHeight: 56,
    padding: "var(--meu-space-3) var(--meu-space-4)",
    boxSizing: "border-box",
    color: "var(--meu-color-ink)",
    background: "var(--meu-color-surface)",
    border: 0,
    borderRadius: 0,
    font: "inherit",
    textAlign: "start",
    textDecoration: "none",
    WebkitTapHighlightColor: "transparent",
    transition: "background-color var(--meu-motion-exit) var(--meu-motion-ease-standard)",
    selectors: {
      "&:focus": {
        zIndex: 1,
        outline: "2px solid var(--meu-color-accent)",
        outlineOffset: -3
      }
    },
    "@media": {
      "(prefers-reduced-motion: reduce)": { transitionDuration: "1ms" },
      "(forced-colors: active)": { outlineColor: "ButtonText" }
    }
  },
  variants: {
    interactive: {
      true: {
        cursor: "pointer",
        selectors: {
          "&:active:not(:disabled):not([aria-disabled='true'])": {
            background: "var(--meu-color-subtle)"
          }
        }
      },
      false: { cursor: "default" }
    },
    disabled: {
      true: { cursor: "not-allowed", opacity: 0.55 },
      false: {}
    }
  },
  defaultVariants: { interactive: false, disabled: false }
});

export const prefix = style({
  display: "flex",
  flex: "0 0 auto",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 24,
  marginInlineEnd: "var(--meu-space-3)",
  color: "var(--meu-color-accent)"
});

export const content = style({ flex: "1 1 auto", minWidth: 0 });

export const title = style({
  display: "block",
  minWidth: 0,
  fontSize: 16,
  fontWeight: 500,
  lineHeight: "24px",
  overflowWrap: "anywhere"
});

export const description = style({
  display: "block",
  minWidth: 0,
  marginTop: 2,
  color: "var(--meu-color-muted)",
  fontSize: 14,
  lineHeight: "20px",
  overflowWrap: "anywhere"
});

export const extra = style({
  flex: "0 1 auto",
  maxWidth: "45%",
  minWidth: 0,
  marginInlineStart: "var(--meu-space-3)",
  color: "var(--meu-color-muted)",
  fontSize: 14,
  lineHeight: "20px",
  textAlign: "end",
  overflowWrap: "anywhere"
});

export const suffix = style({
  display: "flex",
  flex: "0 0 auto",
  alignItems: "center",
  marginInlineStart: "var(--meu-space-3)"
});

const spin = keyframes({ to: { transform: "rotate(360deg)" } });

export const loadingIndicator = style({
  display: "grid",
  placeItems: "center",
  flex: "0 0 auto",
  width: 44,
  height: 44,
  marginBlock: -10,
  marginInlineStart: "var(--meu-space-2)",
  color: "var(--meu-color-muted)"
});

export const spinner = recipe({
  base: {
    width: 16,
    height: 16,
    boxSizing: "border-box",
    border: "2px solid currentColor",
    borderRightColor: "transparent",
    borderRadius: "50%",
    animation: `${spin} 700ms linear infinite`,
    "@media": {
      "(forced-colors: active)": {
        borderColor: "GrayText",
        borderRightColor: "transparent",
        forcedColorAdjust: "auto"
      },
      "(prefers-reduced-motion: reduce)": { animation: "none" }
    }
  },
  variants: {
    motion: {
      system: {},
      reduced: { animation: "none" }
    }
  },
  defaultVariants: { motion: "system" }
});

export const arrow = style({
  display: "flex",
  flex: "0 0 auto",
  alignItems: "center",
  marginInlineStart: "var(--meu-space-2)",
  color: "var(--meu-color-muted)"
});

export const defaultArrowIcon = recipe({
  base: { transform: "rotate(180deg)" },
  variants: {
    direction: {
      ltr: {},
      rtl: { transform: "none" }
    }
  },
  defaultVariants: { direction: "ltr" }
});

export const divider = recipe({
  base: {
    display: "block",
    height: 1,
    marginInlineEnd: 0,
    background: "var(--meu-color-border)",
    pointerEvents: "none"
  },
  variants: {
    kind: {
      full: { marginInlineStart: 0 },
      inset: {}
    },
    prefix: {
      true: {},
      false: {}
    }
  },
  compoundVariants: [
    {
      variants: { kind: "inset", prefix: false },
      style: { marginInlineStart: "var(--meu-space-4)" }
    },
    { variants: { kind: "inset", prefix: true }, style: { marginInlineStart: 52 } }
  ],
  defaultVariants: { kind: "inset", prefix: false }
});

globalStyle(`${cellFrame}:last-child > [data-meu-cell-divider]`, { display: "none" });
