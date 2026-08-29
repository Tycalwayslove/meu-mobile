import { recipe } from "@vanilla-extract/recipes";
import { style } from "@vanilla-extract/css";

export const layer = recipe({
  base: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1000,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    pointerEvents: "none"
  },
  variants: {
    state: {
      open: {},
      closed: {}
    }
  },
  defaultVariants: { state: "closed" }
});

export const panel = recipe({
  base: {
    width: "100%",
    maxWidth: 640,
    minWidth: 0,
    boxSizing: "border-box",
    pointerEvents: "auto",
    color: "var(--meu-color-ink)",
    background: "var(--meu-color-subtle)",
    borderRadius: "var(--meu-radius-sheet) var(--meu-radius-sheet) 0 0",
    boxShadow: "var(--meu-shadow-floating)",
    fontFamily: "var(--meu-font-ui)",
    transform: "translate3d(0, 100%, 0)",
    transitionProperty: "transform",
    transitionDuration: "var(--meu-motion-exit)",
    transitionTimingFunction: "var(--meu-motion-ease-standard)",
    WebkitUserSelect: "none",
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
    "@media": {
      "(prefers-reduced-motion: reduce)": { transitionDuration: "1ms" }
    },
    selectors: {
      '[data-meu-motion="reduced"] &': { transitionDuration: "0ms" }
    }
  },
  variants: {
    safeArea: {
      true: { paddingBottom: "env(safe-area-inset-bottom, 0px)" },
      false: {}
    },
    state: {
      open: {
        transform: "translate3d(0, 0, 0)",
        transitionDuration: "var(--meu-motion-enter)"
      },
      closed: {}
    }
  },
  defaultVariants: { safeArea: true, state: "closed" }
});

export const header = style({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 52,
  paddingInline: 72,
  boxSizing: "border-box",
  borderBottom: "1px solid var(--meu-color-border)"
});

export const title = style({
  minWidth: 0,
  overflow: "hidden",
  fontSize: 14,
  fontWeight: 600,
  lineHeight: "20px",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
});

export const closeButton = style({
  position: "absolute",
  top: 4,
  insetInlineEnd: 8,
  minWidth: 56,
  minHeight: 44,
  padding: "0 var(--meu-space-2)",
  color: "var(--meu-color-accent)",
  background: "transparent",
  border: 0,
  borderRadius: "var(--meu-radius-control)",
  fontFamily: "inherit",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  selectors: {
    "&:focus": { outline: "2px solid var(--meu-color-accent)", outlineOffset: -2 },
    "&:active": { background: "var(--meu-color-surface)" }
  }
});

export const keyboard = style({
  display: "grid",
  gap: "var(--meu-space-2)",
  padding: "var(--meu-space-2)",
  boxSizing: "border-box"
});

export const main = style({
  display: "grid",
  flex: 1,
  minWidth: 0,
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gridAutoRows: 56,
  gap: "var(--meu-space-2)"
});

export const key = recipe({
  base: {
    display: "grid",
    minWidth: 0,
    minHeight: 56,
    placeItems: "center",
    padding: 0,
    boxSizing: "border-box",
    color: "var(--meu-color-ink)",
    background: "var(--meu-color-surface)",
    border: "1px solid var(--meu-color-border)",
    borderRadius: "var(--meu-radius-control)",
    boxShadow: "0 1px 0 rgba(15, 23, 42, 0.08)",
    fontFamily: "inherit",
    fontSize: 26,
    fontWeight: 500,
    lineHeight: 1,
    cursor: "pointer",
    touchAction: "manipulation",
    transition: [
      "transform var(--meu-motion-exit) var(--meu-motion-ease-standard)",
      "background-color var(--meu-motion-exit) var(--meu-motion-ease-standard)"
    ].join(", "),
    "@media": {
      "(prefers-reduced-motion: reduce)": { transitionDuration: "1ms" }
    },
    selectors: {
      "&:focus": { outline: "2px solid var(--meu-color-accent)", outlineOffset: -2 },
      "&:active:not(:disabled)": {
        background: "var(--meu-color-border)",
        transform: "translateY(1px)"
      },
      "&:disabled": {
        color: "var(--meu-color-muted)",
        background: "var(--meu-color-subtle)",
        boxShadow: "none",
        cursor: "not-allowed"
      },
      '[data-meu-motion="reduced"] &': { transitionDuration: "0ms" }
    }
  },
  variants: {
    kind: {
      digit: {},
      extra: { fontSize: 20 },
      delete: { fontSize: 24 },
      confirm: {
        color: "var(--meu-color-accent-contrast)",
        background: "var(--meu-color-accent)",
        borderColor: "var(--meu-color-accent)",
        fontSize: 16,
        fontWeight: 700,
        selectors: {
          "&:active:not(:disabled)": { background: "var(--meu-color-accent-pressed)" },
          "&:disabled": {
            color: "var(--meu-color-muted)",
            background: "var(--meu-color-subtle)",
            borderColor: "var(--meu-color-border)"
          }
        }
      }
    }
  },
  defaultVariants: { kind: "digit" }
});

export const placeholder = style({ minHeight: 56, pointerEvents: "none" });

export const backspaceGlyph = style({
  display: "block",
  fontFamily: "system-ui, sans-serif",
  fontSize: 25,
  fontWeight: 400,
  lineHeight: 1
});

export const trigger = recipe({
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "var(--meu-space-3)",
    width: "100%",
    minHeight: "var(--meu-size-control-medium)",
    padding: "var(--meu-space-3) var(--meu-space-4)",
    boxSizing: "border-box",
    color: "var(--meu-color-ink)",
    background: "var(--meu-color-surface)",
    border: "1px solid var(--meu-color-border)",
    borderRadius: "var(--meu-radius-control)",
    fontFamily: "var(--meu-font-ui)",
    fontSize: 16,
    lineHeight: 1.4,
    textAlign: "start",
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
    selectors: {
      "&:focus": { outline: "2px solid var(--meu-color-accent)", outlineOffset: 2 },
      "&:disabled": {
        color: "var(--meu-color-muted)",
        background: "var(--meu-color-subtle)",
        cursor: "not-allowed"
      }
    }
  },
  variants: {
    status: {
      default: {},
      error: { borderColor: "var(--meu-color-danger)" }
    }
  },
  defaultVariants: { status: "default" }
});

export const triggerValue = style({
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
});

export const triggerPlaceholder = style({ color: "var(--meu-color-muted)" });

export const triggerSuffix = style({
  flex: "0 0 auto",
  padding: "2px 5px",
  color: "var(--meu-color-muted)",
  background: "var(--meu-color-subtle)",
  border: "1px solid var(--meu-color-border)",
  borderRadius: "var(--meu-radius-control)",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.04em"
});
