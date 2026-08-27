import { globalStyle, style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const root = recipe({
  base: {
    width: "100%",
    minWidth: 0,
    overflow: "hidden",
    boxSizing: "border-box",
    color: "var(--meu-color-ink)",
    background: "var(--meu-color-surface)",
    fontFamily: "var(--meu-font-ui)"
  },
  variants: {
    variant: {
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
  defaultVariants: { variant: "plain" }
});

export const item = style({
  position: "relative",
  minWidth: 0,
  borderBottom: "1px solid var(--meu-color-border)"
});

export const trigger = recipe({
  base: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    minWidth: 0,
    minHeight: 52,
    padding: "var(--meu-space-3) var(--meu-space-4)",
    boxSizing: "border-box",
    color: "var(--meu-color-ink)",
    background: "var(--meu-color-surface)",
    border: 0,
    borderRadius: 0,
    cursor: "pointer",
    font: "inherit",
    textAlign: "left",
    WebkitTapHighlightColor: "transparent",
    transition: "background-color var(--meu-motion-exit) var(--meu-motion-ease-standard)",
    selectors: {
      "&:active:not(:disabled)": { background: "var(--meu-color-subtle)" },
      "&:focus": {
        zIndex: 1,
        outline: "2px solid var(--meu-color-accent)",
        outlineOffset: -3
      },
      "&:disabled": { cursor: "not-allowed", opacity: 0.55 }
    },
    "@media": { "(prefers-reduced-motion: reduce)": { transitionDuration: "1ms" } }
  },
  variants: {
    expanded: {
      true: { background: "var(--meu-color-surface)" },
      false: {}
    }
  },
  defaultVariants: { expanded: false }
});

export const title = style({
  flex: "1 1 auto",
  minWidth: 0,
  fontSize: 16,
  fontWeight: 500,
  lineHeight: "24px",
  overflowWrap: "anywhere"
});

export const extra = style({
  display: "flex",
  flex: "0 1 auto",
  alignItems: "center",
  maxWidth: "45%",
  minWidth: 0,
  marginLeft: "var(--meu-space-3)",
  color: "var(--meu-color-muted)",
  fontSize: 14,
  lineHeight: "20px",
  textAlign: "right",
  pointerEvents: "none"
});

export const arrow = recipe({
  base: {
    display: "flex",
    flex: "0 0 auto",
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
    marginLeft: "var(--meu-space-2)",
    color: "var(--meu-color-muted)",
    transform: "rotate(180deg)",
    transition: "transform var(--meu-motion-enter) var(--meu-motion-ease-standard)",
    pointerEvents: "none",
    "@media": { "(prefers-reduced-motion: reduce)": { transitionDuration: "1ms" } }
  },
  variants: {
    expanded: {
      true: { transform: "rotate(270deg)" },
      false: {}
    }
  },
  defaultVariants: { expanded: false }
});

export const panel = recipe({
  base: {
    display: "grid",
    minWidth: 0,
    opacity: 0,
    visibility: "hidden",
    gridTemplateRows: "0fr",
    transitionProperty: "grid-template-rows, opacity, visibility",
    transitionDuration: "var(--meu-motion-exit), var(--meu-motion-exit), 0ms",
    transitionTimingFunction: "var(--meu-motion-ease-standard)",
    transitionDelay: "0ms, 0ms, var(--meu-motion-exit)",
    "@media": {
      "(prefers-reduced-motion: reduce)": {
        transitionDuration: "1ms, 1ms, 0ms",
        transitionDelay: "0ms, 0ms, 1ms"
      }
    }
  },
  variants: {
    expanded: {
      true: {
        opacity: 1,
        visibility: "visible",
        gridTemplateRows: "1fr",
        transitionDuration: "var(--meu-motion-enter), var(--meu-motion-enter), 0ms",
        transitionDelay: "0ms"
      },
      false: {}
    }
  },
  defaultVariants: { expanded: false }
});

export const panelInner = style({
  minWidth: 0,
  minHeight: 0,
  overflow: "hidden"
});

export const content = style({
  minWidth: 0,
  padding: "0 var(--meu-space-4) var(--meu-space-4)",
  color: "var(--meu-color-muted)",
  fontSize: 14,
  lineHeight: "22px",
  overflowWrap: "anywhere"
});

globalStyle(`${item}:last-child`, { borderBottom: 0 });
