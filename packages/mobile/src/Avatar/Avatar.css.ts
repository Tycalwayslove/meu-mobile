import { globalStyle, style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const avatarRoot = recipe({
  base: {
    display: "inline-grid",
    placeItems: "center",
    flex: "none",
    boxSizing: "border-box",
    width: "var(--meu-avatar-size)",
    height: "var(--meu-avatar-size)",
    overflow: "hidden",
    color: "var(--meu-color-ink)",
    background: "var(--meu-color-subtle)",
    fontFamily: "var(--meu-font-ui)",
    fontWeight: 600,
    lineHeight: 1,
    userSelect: "none",
    verticalAlign: "middle",
    "@media": {
      "(forced-colors: active)": {
        border: "1px solid CanvasText",
        color: "CanvasText",
        background: "Canvas"
      }
    }
  },
  variants: {
    shape: {
      circle: { borderRadius: "50%" },
      rounded: { borderRadius: "var(--meu-radius-control)" },
      square: { borderRadius: 0 }
    },
    size: {
      custom: { fontSize: "calc(var(--meu-avatar-size) * 0.38)" },
      small: { vars: { "--meu-avatar-size": "32px" }, fontSize: 12 },
      medium: { vars: { "--meu-avatar-size": "44px" }, fontSize: 16 },
      large: { vars: { "--meu-avatar-size": "56px" }, fontSize: 20 }
    }
  },
  defaultVariants: { shape: "circle", size: "medium" }
});

export const avatarImage = style({
  display: "block",
  width: "100%",
  height: "100%",
  borderRadius: "inherit"
});

globalStyle(`${avatarImage}[data-meu-component="image"]`, {
  maxWidth: "none"
});

globalStyle(`${avatarImage} > span`, {
  minWidth: 0,
  minHeight: 0,
  padding: 0
});

globalStyle(`${avatarImage}[data-meu-component="image"]`, {
  "@media": {
    "(forced-colors: active)": { border: 0 }
  }
});

export const avatarFallback = style({
  display: "grid",
  placeItems: "center",
  width: "100%",
  height: "100%",
  lineHeight: 1,
  overflow: "hidden",
  textOverflow: "ellipsis",
  textTransform: "uppercase",
  whiteSpace: "nowrap"
});
