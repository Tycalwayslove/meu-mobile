import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const root = recipe({
  base: {
    position: "relative",
    display: "inline-grid",
    alignItems: "center",
    minHeight: 44,
    color: "var(--meu-color-ink)",
    fontFamily: "var(--meu-font-ui)",
    WebkitTapHighlightColor: "transparent",
    selectors: {
      "&:focus-within": {
        borderRadius: 6,
        outline: "2px solid var(--meu-color-accent)",
        outlineOffset: 2
      }
    },
    "@media": {
      "(forced-colors: active)": {
        forcedColorAdjust: "none"
      }
    }
  },
  variants: {
    disabled: {
      true: { opacity: 0.55 },
      false: {}
    },
    size: {
      small: { minHeight: 44 },
      medium: { minHeight: 48 },
      large: { minHeight: 52 }
    },
    status: {
      default: {},
      error: { outline: "1px solid var(--meu-color-danger)", outlineOffset: 2, borderRadius: 6 }
    }
  },
  defaultVariants: { disabled: false, size: "medium", status: "default" }
});

export const stars = recipe({
  base: { display: "flex", alignItems: "center", pointerEvents: "none" },
  variants: {
    size: {
      small: { gap: 2 },
      medium: { gap: 4 },
      large: { gap: 6 }
    }
  },
  defaultVariants: { size: "medium" }
});

export const star = recipe({
  base: {
    position: "relative",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    color: "var(--meu-color-border)",
    lineHeight: 1,
    userSelect: "none",
    "@media": {
      "(forced-colors: active)": {
        color: "GrayText"
      }
    }
  },
  variants: {
    size: {
      small: { width: 30, height: 44, fontSize: 28 },
      medium: { width: 34, height: 48, fontSize: 32 },
      large: { width: 38, height: 52, fontSize: 36 }
    }
  },
  defaultVariants: { size: "medium" }
});

export const activeStar = style({
  position: "absolute",
  insetBlock: 0,
  insetInlineStart: 0,
  display: "grid",
  placeItems: "center",
  overflow: "hidden",
  color: "var(--meu-color-warning)",
  whiteSpace: "nowrap",
  "@media": {
    "(forced-colors: active)": {
      color: "Highlight"
    }
  }
});

export const activeCharacter = style({
  position: "absolute",
  insetInlineStart: 0,
  display: "grid",
  placeItems: "center",
  width: "var(--meu-rate-star-width)",
  height: "100%"
});

export const input = style({
  position: "absolute",
  inset: 0,
  zIndex: 1,
  width: "100%",
  height: "100%",
  padding: 0,
  margin: 0,
  opacity: 0,
  cursor: "pointer",
  selectors: {
    "&:disabled": { cursor: "not-allowed" }
  }
});
