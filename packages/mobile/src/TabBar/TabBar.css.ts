import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const root = style({
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  color: "var(--meu-color-muted)",
  background: "var(--meu-color-surface)",
  borderTop: "1px solid var(--meu-color-border)",
  fontFamily: "var(--meu-font-ui)",
  selectors: {
    "&[data-safe-area='true']": {
      paddingLeft: [0, "env(safe-area-inset-left, 0px)"],
      paddingRight: [0, "env(safe-area-inset-right, 0px)"]
    }
  }
});

export const items = style({
  display: "flex",
  alignItems: "stretch",
  width: "100%",
  minHeight: "var(--meu-size-tabbar)"
});

export const item = recipe({
  base: {
    position: "relative",
    display: "flex",
    flex: "1 1 0",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    minWidth: 0,
    minHeight: "var(--meu-size-tabbar)",
    boxSizing: "border-box",
    padding: "var(--meu-space-1) var(--meu-space-2)",
    color: "var(--meu-color-muted)",
    background: "transparent",
    border: 0,
    borderRadius: 0,
    font: "inherit",
    textDecoration: "none",
    cursor: "pointer",
    touchAction: "manipulation",
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
    transition: [
      "background-color var(--meu-motion-exit) var(--meu-motion-ease-standard)",
      "color var(--meu-motion-exit) var(--meu-motion-ease-standard)"
    ].join(", "),
    selectors: {
      "&:focus": {
        zIndex: 1,
        outline: "2px solid var(--meu-color-accent)",
        outlineOffset: -3
      },
      "&:not(:disabled):not([aria-disabled='true']):active": {
        background: "var(--meu-color-subtle)"
      }
    },
    "@media": {
      "(prefers-reduced-motion: reduce)": { transitionDuration: "1ms" },
      "(hover: hover)": {
        selectors: {
          "&:not(:disabled):not([aria-disabled='true']):hover": {
            color: "var(--meu-color-ink)",
            background: "var(--meu-color-subtle)"
          }
        }
      },
      "(forced-colors: active)": {
        color: "ButtonText",
        border: "1px solid ButtonText",
        forcedColorAdjust: "auto"
      },
      "(orientation: landscape) and (max-height: 500px)": {
        minHeight: 48,
        paddingTop: 2,
        paddingBottom: 2
      }
    }
  },
  variants: {
    active: {
      true: {
        color: "var(--meu-color-accent)",
        "@media": {
          "(forced-colors: active)": {
            color: "HighlightText",
            background: "Highlight",
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
        "@media": {
          "(forced-colors: active)": {
            color: "GrayText",
            background: "Canvas",
            borderColor: "GrayText",
            opacity: 1
          }
        }
      },
      false: {}
    },
    kind: {
      link: {
        "@media": {
          "(forced-colors: active)": {
            selectors: {
              "&:not([aria-current='page']):not([aria-disabled='true'])": {
                color: "LinkText",
                borderColor: "LinkText"
              }
            }
          }
        }
      },
      button: {}
    }
  },
  defaultVariants: { active: false, disabled: false, kind: "button" }
});

export const icon = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 24,
  height: 24,
  flex: "0 0 auto"
});

export const label = style({
  maxWidth: "100%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: 12,
  fontWeight: 500,
  lineHeight: "16px"
});
