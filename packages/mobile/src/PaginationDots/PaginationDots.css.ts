import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const root = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--meu-space-2)",
    color: "var(--meu-color-muted)"
  },
  variants: {
    direction: {
      horizontal: { flexDirection: "row" },
      vertical: { flexDirection: "column" }
    }
  },
  defaultVariants: { direction: "horizontal" }
});

export const dot = recipe({
  base: {
    display: "block",
    flex: "0 0 auto",
    boxSizing: "border-box",
    background: "currentColor",
    opacity: 0.35,
    transition: [
      "width var(--meu-motion-exit) var(--meu-motion-ease-standard)",
      "height var(--meu-motion-exit) var(--meu-motion-ease-standard)",
      "opacity var(--meu-motion-exit) var(--meu-motion-ease-standard)",
      "color var(--meu-motion-exit) var(--meu-motion-ease-standard)"
    ].join(", "),
    "@media": { "(prefers-reduced-motion: reduce)": { transitionDuration: "1ms" } }
  },
  variants: {
    active: {
      true: { color: "var(--meu-color-accent)", opacity: 1 },
      false: {}
    },
    direction: {
      horizontal: {},
      vertical: {}
    },
    variant: {
      dot: { width: 6, height: 6, borderRadius: 999 },
      line: { borderRadius: 999 }
    }
  },
  compoundVariants: [
    {
      variants: { active: false, direction: "horizontal", variant: "line" },
      style: { width: 8, height: 3 }
    },
    {
      variants: { active: true, direction: "horizontal", variant: "line" },
      style: { width: 18, height: 3 }
    },
    {
      variants: { active: false, direction: "vertical", variant: "line" },
      style: { width: 3, height: 8 }
    },
    {
      variants: { active: true, direction: "vertical", variant: "line" },
      style: { width: 3, height: 18 }
    }
  ],
  defaultVariants: { active: false, direction: "horizontal", variant: "dot" }
});

export const button = style({
  display: "inline-grid",
  width: 44,
  height: 44,
  flex: "0 0 44px",
  padding: 0,
  placeItems: "center",
  color: "inherit",
  background: "transparent",
  border: 0,
  borderRadius: "var(--meu-radius-round)",
  cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
  selectors: {
    "&:focus-visible": { outline: "2px solid var(--meu-color-accent)", outlineOffset: -4 }
  },
  "@media": {
    "(forced-colors: active)": { color: "CanvasText" }
  }
});

export const ellipsis = style({
  minWidth: 12,
  color: "var(--meu-color-muted)",
  textAlign: "center"
});
