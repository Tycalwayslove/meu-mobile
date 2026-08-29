import { recipe } from "@vanilla-extract/recipes";
import { createVar, style } from "@vanilla-extract/css";

const toneColor = createVar();

export const viewport = recipe({
  base: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1200,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxSizing: "border-box",
    paddingRight: "calc(var(--meu-space-4) + env(safe-area-inset-right, 0px))",
    paddingLeft: "calc(var(--meu-space-4) + env(safe-area-inset-left, 0px))",
    pointerEvents: "none"
  },
  variants: {
    position: {
      top: {
        justifyContent: "flex-start",
        paddingTop: "calc(var(--meu-space-4) + env(safe-area-inset-top, 0px))",
        paddingBottom: "var(--meu-space-4)"
      },
      center: {
        justifyContent: "center",
        paddingTop: "var(--meu-space-4)",
        paddingBottom: "var(--meu-space-4)"
      },
      bottom: {
        justifyContent: "flex-end",
        paddingTop: "var(--meu-space-4)",
        paddingBottom: "calc(var(--meu-space-4) + env(safe-area-inset-bottom, 0px))"
      }
    }
  },
  defaultVariants: { position: "center" }
});

export const toast = recipe({
  base: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    maxWidth: 420,
    minHeight: 52,
    boxSizing: "border-box",
    padding: "var(--meu-space-2) var(--meu-space-3)",
    color: "var(--meu-color-ink)",
    background: "var(--meu-color-surface)",
    border: "1px solid var(--meu-color-border)",
    borderRadius: "var(--meu-radius-surface)",
    boxShadow: "var(--meu-shadow-floating)",
    fontFamily: "var(--meu-font-ui)",
    fontSize: 14,
    lineHeight: "20px",
    pointerEvents: "auto",
    selectors: {
      "&::before": {
        content: "",
        alignSelf: "stretch",
        flex: "0 0 3px",
        minHeight: 28,
        marginBlock: "var(--meu-space-2)",
        marginInlineEnd: "var(--meu-space-3)",
        background: toneColor,
        borderRadius: "var(--meu-radius-round)"
      }
    },
    transition: [
      "opacity var(--meu-motion-enter) var(--meu-motion-ease-standard)",
      "transform var(--meu-motion-enter) var(--meu-motion-ease-standard)"
    ].join(", "),
    "@media": {
      "(max-width: 479px)": { maxWidth: "calc(100vw - 32px)" },
      "(prefers-reduced-motion: reduce)": { transition: "none" },
      "(forced-colors: active)": {
        color: "CanvasText",
        background: "Canvas",
        borderColor: "CanvasText",
        boxShadow: "none",
        forcedColorAdjust: "auto"
      }
    }
  },
  variants: {
    state: {
      open: { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" },
      closed: {
        opacity: 0,
        transform: "translate3d(0, 6px, 0) scale(0.98)",
        transitionDuration: "var(--meu-motion-exit)"
      }
    },
    tone: {
      neutral: { vars: { [toneColor]: "var(--meu-color-muted)" } },
      success: { vars: { [toneColor]: "var(--meu-color-success)" } },
      warning: { vars: { [toneColor]: "var(--meu-color-warning)" } },
      danger: { vars: { [toneColor]: "var(--meu-color-danger)" } }
    }
  },
  defaultVariants: { state: "closed", tone: "neutral" }
});

export const icon = style({
  display: "inline-grid",
  placeItems: "center",
  flex: "0 0 auto",
  width: 24,
  height: 24,
  marginInlineEnd: "var(--meu-space-2)",
  color: toneColor,
  fontSize: 17,
  fontWeight: 700,
  lineHeight: 1
});

export const message = style({
  minWidth: 0,
  flex: "1 1 auto",
  paddingTop: "var(--meu-space-2)",
  paddingBottom: "var(--meu-space-2)",
  overflowWrap: "anywhere"
});

export const action = style({
  flex: "0 0 auto",
  minWidth: 44,
  minHeight: 44,
  marginInlineStart: "var(--meu-space-2)",
  padding: "0 var(--meu-space-3)",
  color: toneColor,
  background: "transparent",
  border: 0,
  borderRadius: "var(--meu-radius-control)",
  font: "inherit",
  fontWeight: 700,
  cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
  selectors: {
    "&:focus": { outline: "2px solid currentcolor", outlineOffset: 2 },
    "&:active:not(:disabled)": { background: "var(--meu-color-subtle)" },
    "&:disabled": { cursor: "wait", opacity: 0.72 }
  },
  "@media": {
    "(forced-colors: active)": {
      border: "1px solid ButtonText",
      color: "ButtonText",
      forcedColorAdjust: "auto",
      selectors: {
        "&:disabled": { borderColor: "GrayText", color: "GrayText", opacity: 1 }
      }
    }
  }
});
