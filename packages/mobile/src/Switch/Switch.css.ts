import { keyframes, style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

const spin = keyframes({ to: { transform: "rotate(360deg)" } });

export const root = recipe({
  base: {
    position: "relative",
    display: "inline-grid",
    placeItems: "center",
    flexShrink: 0,
    minWidth: 44,
    minHeight: 44,
    verticalAlign: "middle",
    WebkitTapHighlightColor: "transparent",
    selectors: {
      "&:focus-within": { outline: "2px solid var(--meu-color-accent)", outlineOffset: 2 }
    }
  },
  variants: {
    disabled: {
      true: { cursor: "not-allowed" },
      false: { cursor: "pointer" }
    },
    size: {
      small: { width: 44, height: 44 },
      medium: { width: 48, height: 44 },
      large: { width: 56, height: 52 }
    }
  },
  defaultVariants: { disabled: false, size: "medium" }
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
  cursor: "inherit"
});

export const track = recipe({
  base: {
    position: "relative",
    display: "block",
    boxSizing: "border-box",
    background: "var(--meu-color-border)",
    border: "1px solid transparent",
    borderRadius: "var(--meu-radius-round)",
    transition: "background-color var(--meu-motion-enter) var(--meu-motion-ease-standard)"
  },
  variants: {
    checked: {
      true: { background: "var(--meu-color-accent)" },
      false: {}
    },
    disabled: {
      true: { background: "var(--meu-color-subtle)", borderColor: "var(--meu-color-border)" },
      false: {}
    },
    size: {
      small: { width: 36, height: 22, padding: 2 },
      medium: { width: 44, height: 26, padding: 2 },
      large: { width: 52, height: 30, padding: 2 }
    },
    status: {
      default: {},
      error: { borderColor: "var(--meu-color-danger)" }
    }
  },
  defaultVariants: { checked: false, disabled: false, size: "medium", status: "default" }
});

export const thumb = recipe({
  base: {
    display: "grid",
    placeItems: "center",
    color: "var(--meu-color-muted)",
    background: "var(--meu-color-surface)",
    borderRadius: "50%",
    boxShadow: "0 1px 3px #18201A33",
    transition: "transform var(--meu-motion-enter) var(--meu-motion-ease-standard)"
  },
  variants: {
    checked: {
      true: {},
      false: { transform: "translateX(0)" }
    },
    size: {
      small: { width: 16, height: 16 },
      medium: { width: 20, height: 20 },
      large: { width: 24, height: 24 }
    }
  },
  compoundVariants: [
    { variants: { checked: true, size: "small" }, style: { transform: "translateX(14px)" } },
    { variants: { checked: true, size: "medium" }, style: { transform: "translateX(18px)" } },
    { variants: { checked: true, size: "large" }, style: { transform: "translateX(22px)" } }
  ],
  defaultVariants: { checked: false, size: "medium" }
});

export const spinner = style({
  width: "60%",
  height: "60%",
  boxSizing: "border-box",
  border: "1.5px solid currentColor",
  borderRightColor: "transparent",
  borderRadius: "50%",
  animation: `${spin} 700ms linear infinite`,
  "@media": { "(prefers-reduced-motion: reduce)": { animation: "none" } }
});
