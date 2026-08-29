import { globalStyle, keyframes, style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

const spin = keyframes({
  to: { transform: "rotate(360deg)" }
});

export const root = recipe({
  base: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, auto) minmax(0, 1fr)",
    alignItems: "center",
    minHeight: "var(--meu-size-navbar)",
    boxSizing: "border-box",
    paddingInline: "var(--meu-space-2)",
    color: "var(--meu-color-ink)",
    background: "var(--meu-color-surface)",
    fontFamily: "var(--meu-font-ui)",
    transition: "border-color var(--meu-motion-exit) var(--meu-motion-ease-standard)",
    "@media": {
      "(prefers-reduced-motion: reduce)": { transitionDuration: "1ms" },
      "(forced-colors: active)": { background: "Canvas", color: "CanvasText" }
    }
  },
  variants: {
    bordered: {
      true: { borderBottom: "1px solid var(--meu-color-border)" },
      false: { borderBottom: "1px solid transparent" }
    },
    safeArea: {
      true: {
        minHeight: "calc(var(--meu-size-navbar) + env(safe-area-inset-top, 0px))",
        paddingBlockStart: "env(safe-area-inset-top, 0px)",
        paddingLeft: "calc(var(--meu-space-2) + env(safe-area-inset-left, 0px))",
        paddingRight: "calc(var(--meu-space-2) + env(safe-area-inset-right, 0px))"
      },
      false: {}
    },
    position: {
      static: {},
      sticky: { position: "sticky", top: 0, zIndex: 1 }
    },
    scrolled: {
      true: {},
      false: {}
    }
  },
  compoundVariants: [
    {
      variants: { bordered: false, scrolled: true },
      style: { borderBottomColor: "var(--meu-color-border)" }
    }
  ],
  defaultVariants: { bordered: true, position: "static", safeArea: false, scrolled: false }
});

export const side = style({
  display: "flex",
  alignItems: "center",
  minWidth: 0,
  minHeight: 44
});

export const leftSide = style({ justifyContent: "flex-start" });
export const rightSide = style({ justifyContent: "flex-end" });

export const back = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flex: "0 1 auto",
    gap: "var(--meu-space-1)",
    minWidth: 44,
    maxWidth: "100%",
    minHeight: 44,
    boxSizing: "border-box",
    padding: "0 var(--meu-space-2)",
    color: "inherit",
    background: "transparent",
    border: 0,
    borderRadius: "var(--meu-radius-control)",
    font: "inherit",
    textDecoration: "none",
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
    transition: [
      "transform var(--meu-motion-exit) var(--meu-motion-ease-standard)",
      "background-color var(--meu-motion-exit) var(--meu-motion-ease-standard)",
      "color var(--meu-motion-exit) var(--meu-motion-ease-standard)"
    ].join(", "),
    selectors: {
      "&:active:not(:disabled):not([aria-disabled='true'])": {
        background: "var(--meu-color-subtle)",
        transform: "translateY(1px)"
      },
      "&:focus": {
        outline: "2px solid var(--meu-color-accent)",
        outlineOffset: 1
      }
    },
    "@media": {
      "(prefers-reduced-motion: reduce)": { transitionDuration: "1ms" },
      "(forced-colors: active)": { border: "1px solid ButtonText", color: "ButtonText" }
    }
  },
  variants: {
    disabled: {
      true: {
        color: "var(--meu-color-muted)",
        background: "var(--meu-color-subtle)",
        cursor: "not-allowed",
        selectors: { "&:focus": { outlineColor: "var(--meu-color-border)" } },
        "@media": {
          "(forced-colors: active)": { borderColor: "GrayText", color: "GrayText" }
        }
      },
      false: {}
    }
  },
  defaultVariants: { disabled: false }
});

export const backIcon = recipe({
  base: {
    display: "inline-flex",
    flex: "0 0 auto"
  },
  variants: {
    direction: {
      ltr: {},
      rtl: { transform: "scaleX(-1)" }
    }
  },
  defaultVariants: { direction: "ltr" }
});

export const backSpinner = recipe({
  base: {
    width: 18,
    height: 18,
    boxSizing: "border-box",
    border: "2px solid currentColor",
    borderRightColor: "transparent",
    borderRadius: "50%",
    animation: `${spin} 700ms linear infinite`,
    "@media": {
      "(prefers-reduced-motion: reduce)": { animation: "none" },
      "(forced-colors: active)": { borderRightColor: "Canvas" }
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

export const backLabel = style({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: 15,
  lineHeight: 1.4
});

export const leftContent = style({
  display: "inline-flex",
  alignItems: "center",
  flex: "0 1 auto",
  minWidth: 0,
  maxWidth: "100%"
});

export const title = style({
  minWidth: 0,
  maxWidth: "100%",
  overflow: "hidden",
  textAlign: "center",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: 17,
  fontWeight: 600,
  lineHeight: 1.4
});

globalStyle(
  `${title} > h1, ${title} > h2, ${title} > h3, ${title} > h4, ${title} > h5, ${title} > h6`,
  {
    margin: 0,
    overflow: "inherit",
    color: "inherit",
    font: "inherit",
    fontWeight: "inherit",
    textOverflow: "inherit",
    whiteSpace: "inherit"
  }
);
