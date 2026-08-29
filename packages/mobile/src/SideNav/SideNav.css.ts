import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const root = recipe({
  base: {
    display: "grid",
    minWidth: 0,
    color: "var(--meu-color-ink)",
    background: "var(--meu-color-surface)",
    fontFamily: "var(--meu-font-ui)"
  },
  variants: {
    hasPanels: {
      true: { gridTemplateColumns: "104px minmax(0, 1fr)" },
      false: { gridTemplateColumns: "104px", width: 104 }
    }
  },
  defaultVariants: { hasPanels: false }
});

export const list = recipe({
  base: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    maxWidth: "100%",
    overflowX: "hidden",
    overflowY: "auto",
    overscrollBehaviorBlock: "contain",
    background: "var(--meu-color-subtle)",
    borderInlineEnd: "1px solid var(--meu-color-border)",
    WebkitOverflowScrolling: "touch"
  },
  variants: {
    sticky: {
      true: {
        position: "sticky",
        insetBlockStart: "var(--meu-side-nav-sticky-offset, 0px)",
        alignSelf: "start",
        width: "100%",
        maxBlockSize: "calc(100vh - var(--meu-side-nav-sticky-offset, 0px))",
        "@supports": {
          "(height: 100dvh)": {
            maxBlockSize: "calc(100dvh - var(--meu-side-nav-sticky-offset, 0px))"
          }
        }
      },
      false: {}
    }
  },
  defaultVariants: { sticky: false }
});

export const navigationItems = style({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  minWidth: 0,
  margin: 0,
  padding: 0,
  listStyle: "none"
});

export const navigationItem = style({
  width: "100%",
  minWidth: 0
});

export const item = recipe({
  base: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--meu-space-1)",
    width: "100%",
    minHeight: 52,
    boxSizing: "border-box",
    padding: "var(--meu-space-2) var(--meu-space-3)",
    color: "var(--meu-color-muted)",
    background: "transparent",
    border: 0,
    borderRadius: 0,
    font: "inherit",
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 1.3,
    textAlign: "center",
    textDecoration: "none",
    cursor: "pointer",
    transition:
      "background-color var(--meu-motion-exit) var(--meu-motion-ease-standard), color var(--meu-motion-exit) var(--meu-motion-ease-standard)",
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
    "@media": {
      "(forced-colors: active)": { borderBlockEnd: "1px solid CanvasText" },
      "(prefers-reduced-motion: reduce)": { transitionDuration: "1ms" },
      "(hover: hover) and (pointer: fine)": {
        selectors: {
          "&:hover:not(:disabled):not([aria-disabled='true'])": {
            color: "var(--meu-color-ink)",
            background: "var(--meu-color-surface)"
          }
        }
      }
    },
    selectors: {
      '[data-meu-motion="reduced"] &': { transitionDuration: "0ms" },
      "&:focus": {
        zIndex: 2,
        outline: "2px solid var(--meu-color-accent)",
        outlineOffset: -2
      }
    }
  },
  variants: {
    active: {
      true: {
        color: "var(--meu-color-ink)",
        background: "var(--meu-color-surface)",
        boxShadow: "inset 0 0 0 1px var(--meu-color-accent)",
        fontWeight: 600,
        "@media": {
          "(forced-colors: active)": {
            color: "HighlightText",
            background: "Highlight",
            boxShadow: "none",
            outline: "2px solid Highlight",
            outlineOffset: -3
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
        "@media": {
          "(forced-colors: active)": {
            color: "GrayText",
            borderColor: "GrayText"
          }
        }
      },
      false: {}
    }
  },
  defaultVariants: { active: false, disabled: false }
});

export const label = style({
  minWidth: 0,
  maxWidth: "100%",
  overflowWrap: "anywhere",
  wordBreak: "break-word"
});

export const badge = style({
  display: "inline-flex",
  flex: "0 0 auto",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 18,
  minHeight: 18,
  boxSizing: "border-box",
  padding: "0 5px",
  color: "var(--meu-color-danger-contrast)",
  background: "var(--meu-color-danger)",
  borderRadius: "var(--meu-radius-round)",
  fontSize: 11,
  fontWeight: 700,
  lineHeight: 1
});

export const panel = style({
  minWidth: 0,
  padding: "var(--meu-space-4)",
  overflowWrap: "anywhere",
  outline: "none",
  selectors: {
    "&:focus": {
      outline: "2px solid var(--meu-color-accent)",
      outlineOffset: -2
    }
  },
  "@media": { "(forced-colors: active)": { border: "1px solid CanvasText" } }
});
