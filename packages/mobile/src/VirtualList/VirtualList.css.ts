import { style } from "@vanilla-extract/css";

export const root = style({
  position: "relative",
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  overflowX: "hidden",
  overflowY: "auto",
  overscrollBehavior: "contain",
  WebkitOverflowScrolling: "touch",
  color: "var(--meu-color-ink)",
  background: "var(--meu-color-surface)",
  fontFamily: "var(--meu-font-ui)",
  contain: "layout paint",
  selectors: {
    "&:focus": {
      outline: "2px solid var(--meu-color-accent)",
      outlineOffset: 2
    }
  }
});

export const sizer = style({
  position: "relative",
  width: "100%",
  minWidth: 0
});

export const item = style({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  willChange: "transform",
  "@media": {
    "(forced-colors: active)": {
      borderBlockEnd: "1px solid CanvasText",
      forcedColorAdjust: "auto"
    }
  }
});

export const empty = style({
  display: "grid",
  width: "100%",
  height: "100%",
  minHeight: 44,
  boxSizing: "border-box",
  placeItems: "center",
  padding: "var(--meu-space-4)",
  color: "var(--meu-color-muted)",
  fontSize: 14,
  lineHeight: "20px",
  textAlign: "center"
});
