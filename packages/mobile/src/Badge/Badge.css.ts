import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const badgeWrapper = style({
  position: "relative",
  display: "inline-flex",
  maxWidth: "100%",
  verticalAlign: "middle"
});

export const badge = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    minWidth: 18,
    height: 18,
    paddingInline: 5,
    borderRadius: "var(--meu-radius-round)",
    fontFamily: "var(--meu-font-ui)",
    fontSize: 11,
    fontWeight: 600,
    lineHeight: 1,
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
    "@media": {
      "(forced-colors: active)": {
        border: "1px solid CanvasText",
        color: "Canvas",
        background: "CanvasText",
        boxShadow: "none"
      }
    }
  },
  variants: {
    bordered: {
      true: { boxShadow: "0 0 0 2px var(--meu-color-surface)" },
      false: {}
    },
    dot: {
      true: { width: 8, minWidth: 8, height: 8, paddingInline: 0 },
      false: {}
    },
    fixed: {
      true: {
        position: "absolute",
        zIndex: 1,
        top: "var(--meu-badge-offset-y, 0px)",
        insetInlineEnd: "var(--meu-badge-offset-x, 0px)",
        transform: "translate(50%, -50%)",
        selectors: { "[dir='rtl'] &": { transform: "translate(-50%, -50%)" } }
      },
      false: {}
    },
    tone: {
      neutral: { color: "var(--meu-color-surface)", background: "var(--meu-color-ink)" },
      accent: {
        color: "var(--meu-color-accent-contrast)",
        background: "var(--meu-color-accent)"
      },
      success: {
        color: "var(--meu-color-success-contrast)",
        background: "var(--meu-color-success)"
      },
      warning: {
        color: "var(--meu-color-warning-contrast)",
        background: "var(--meu-color-warning)"
      },
      danger: {
        color: "var(--meu-color-danger-contrast)",
        background: "var(--meu-color-danger)"
      }
    }
  },
  defaultVariants: { bordered: false, dot: false, fixed: false, tone: "danger" }
});

export const badgeContent = style({
  minWidth: 0,
  maxWidth: "12ch",
  overflow: "hidden",
  textOverflow: "ellipsis"
});
