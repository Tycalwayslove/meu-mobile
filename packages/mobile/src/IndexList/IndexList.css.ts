import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const root = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 44px",
  minWidth: 0,
  minHeight: 0,
  overflow: "hidden",
  color: "var(--meu-color-ink)",
  background: "var(--meu-color-surface)",
  border: "1px solid var(--meu-color-border)",
  borderRadius: "var(--meu-radius-surface)",
  fontFamily: "var(--meu-font-ui)",
  selectors: {
    "&[data-empty='true']": { gridTemplateColumns: "minmax(0, 1fr)" }
  }
});

export const body = style({
  position: "relative",
  minWidth: 0,
  minHeight: 0,
  overflowX: "hidden",
  overflowY: "auto",
  overscrollBehavior: "contain",
  WebkitOverflowScrolling: "touch",
  scrollPaddingTop: 36,
  selectors: {
    "&:focus": {
      outline: "2px solid var(--meu-color-accent)",
      outlineOffset: -2
    }
  }
});

export const section = style({ minWidth: 0, scrollMarginTop: 36 });

export const heading = recipe({
  base: {
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    minHeight: 36,
    boxSizing: "border-box",
    padding: "0 var(--meu-space-4)",
    color: "var(--meu-color-muted)",
    background: "var(--meu-color-subtle)",
    borderBottom: "1px solid var(--meu-color-border)",
    fontSize: 13,
    fontWeight: 600,
    lineHeight: 1.3
  },
  variants: {
    sticky: {
      true: { position: "sticky", top: 0 },
      false: { position: "relative" }
    }
  },
  defaultVariants: { sticky: true }
});

export const content = style({ minWidth: 0 });

export const rail = style({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  minWidth: 0,
  minHeight: 0,
  overflowX: "hidden",
  overflowY: "auto",
  background: "var(--meu-color-subtle)",
  borderInlineStart: "1px solid var(--meu-color-border)",
  touchAction: "none",
  scrollbarWidth: "none",
  selectors: { "&::-webkit-scrollbar": { display: "none" } }
});

export const indexButton = recipe({
  base: {
    position: "relative",
    display: "flex",
    flex: "0 0 44px",
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    minHeight: 44,
    boxSizing: "border-box",
    padding: 0,
    color: "var(--meu-color-muted)",
    background: "transparent",
    border: 0,
    borderRadius: 0,
    font: "inherit",
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 1,
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
    selectors: {
      "&:focus": {
        zIndex: 2,
        outline: "2px solid var(--meu-color-accent)",
        outlineOffset: -2
      }
    },
    "@media": {
      "(forced-colors: active)": {
        border: "1px solid ButtonText",
        color: "ButtonText",
        forcedColorAdjust: "auto"
      }
    }
  },
  variants: {
    active: {
      true: {
        color: "var(--meu-color-accent-contrast)",
        background: "var(--meu-color-accent)",
        "@media": {
          "(forced-colors: active)": {
            color: "HighlightText",
            background: "Highlight",
            forcedColorAdjust: "none"
          }
        }
      },
      false: {}
    }
  },
  defaultVariants: { active: false }
});

export const status = style({
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
