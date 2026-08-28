import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const root = recipe({
  base: {
    width: "100%",
    minWidth: 0,
    margin: 0,
    padding: 0,
    color: "var(--meu-color-ink)",
    fontFamily: "var(--meu-font-ui)",
    listStyle: "none"
  },
  variants: {
    direction: {
      horizontal: {
        display: "flex",
        alignItems: "flex-start",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch"
      },
      vertical: { display: "grid", gap: "var(--meu-space-3)" }
    }
  },
  defaultVariants: { direction: "horizontal" }
});

export const step = recipe({
  base: {
    position: "relative",
    minWidth: 0,
    selectors: {
      "&::after": {
        position: "absolute",
        zIndex: 0,
        background: "var(--meu-color-border)",
        content: ""
      },
      '&[data-last="true"]::after': { display: "none" }
    }
  },
  variants: {
    direction: {
      horizontal: {
        display: "grid",
        flex: "1 1 0",
        minWidth: 96,
        justifyItems: "center",
        paddingInline: "var(--meu-space-1)",
        textAlign: "center",
        selectors: {
          "&::after": {
            top: 15,
            insetInlineStart: "calc(50% + 20px)",
            insetInlineEnd: "calc(-50% + 20px)",
            height: 2
          }
        }
      },
      vertical: {
        display: "grid",
        gridTemplateColumns: "32px minmax(0, 1fr)",
        columnGap: "var(--meu-space-3)",
        minHeight: 56,
        selectors: {
          "&::after": { top: 36, bottom: -12, insetInlineStart: 15, width: 2 }
        }
      }
    },
    status: {
      wait: {},
      process: {},
      finish: { selectors: { "&::after": { background: "var(--meu-color-accent)" } } },
      error: {}
    }
  },
  defaultVariants: { direction: "horizontal", status: "wait" }
});

export const indicator = recipe({
  base: {
    position: "relative",
    zIndex: 1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    boxSizing: "border-box",
    border: "2px solid var(--meu-color-border)",
    borderRadius: "var(--meu-radius-round)",
    fontSize: 13,
    fontWeight: 600,
    lineHeight: 1,
    "@media": {
      "(forced-colors: active)": {
        color: "CanvasText",
        background: "Canvas",
        borderColor: "CanvasText"
      }
    }
  },
  variants: {
    status: {
      wait: {
        color: "var(--meu-color-muted)",
        background: "var(--meu-color-surface)",
        borderColor: "var(--meu-color-border)"
      },
      process: {
        color: "var(--meu-color-accent-contrast)",
        background: "var(--meu-color-accent)",
        borderColor: "var(--meu-color-accent)",
        "@media": { "(forced-colors: active)": { color: "HighlightText", background: "Highlight" } }
      },
      finish: {
        color: "var(--meu-color-accent)",
        background: "var(--meu-color-subtle)",
        borderColor: "var(--meu-color-accent)"
      },
      error: {
        color: "white",
        background: "var(--meu-color-danger)",
        borderColor: "var(--meu-color-danger)",
        "@media": { "(forced-colors: active)": { borderColor: "Mark", color: "MarkText" } }
      }
    }
  },
  defaultVariants: { status: "wait" }
});

export const content = recipe({
  base: { minWidth: 0 },
  variants: {
    direction: {
      horizontal: { marginTop: "var(--meu-space-2)", maxWidth: 160 },
      vertical: { paddingTop: 4, paddingBottom: "var(--meu-space-3)" }
    }
  },
  defaultVariants: { direction: "horizontal" }
});

export const title = style({
  color: "var(--meu-color-ink)",
  fontSize: 14,
  fontWeight: 500,
  lineHeight: "20px",
  overflowWrap: "anywhere"
});

export const description = style({
  marginTop: 2,
  color: "var(--meu-color-muted)",
  fontSize: 12,
  lineHeight: "18px",
  overflowWrap: "anywhere"
});
