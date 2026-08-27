import { style } from "@vanilla-extract/css";

export const popupPanel = style({
  background: "var(--meu-color-surface)"
});

export const root = style({
  minWidth: 0,
  color: "var(--meu-color-ink)",
  background: "var(--meu-color-surface)"
});

export const header = style({
  display: "grid",
  gridTemplateColumns: "minmax(72px, 1fr) minmax(0, 2fr) minmax(72px, 1fr)",
  alignItems: "center",
  minHeight: 52,
  borderBottom: "1px solid var(--meu-color-border)"
});

export const headerButton = style({
  minWidth: 0,
  minHeight: 48,
  paddingInline: "var(--meu-space-4)",
  borderRadius: 0
});

export const cancelButton = style({
  justifySelf: "start"
});

export const confirmButton = style({
  justifySelf: "end"
});

export const title = style({
  margin: 0,
  overflow: "hidden",
  color: "var(--meu-color-ink)",
  fontSize: 16,
  fontWeight: 700,
  lineHeight: 1.35,
  textAlign: "center",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
});

export const wheels = style({
  position: "relative",
  display: "flex",
  minWidth: 0,
  height: 240,
  overflow: "hidden"
});

export const selectionWindow = style({
  position: "absolute",
  top: 96,
  right: "var(--meu-space-3)",
  left: "var(--meu-space-3)",
  zIndex: 0,
  height: 48,
  background: "var(--meu-color-subtle)",
  border: "1px solid var(--meu-color-accent)",
  borderRadius: "var(--meu-radius-control)",
  pointerEvents: "none"
});

export const fadeTop = style({
  position: "absolute",
  top: 0,
  right: 0,
  left: 0,
  zIndex: 2,
  height: 84,
  background: "linear-gradient(var(--meu-color-surface), transparent)",
  pointerEvents: "none"
});

export const fadeBottom = style({
  position: "absolute",
  right: 0,
  bottom: 0,
  left: 0,
  zIndex: 2,
  height: 84,
  background: "linear-gradient(transparent, var(--meu-color-surface))",
  pointerEvents: "none"
});

export const column = style({
  position: "relative",
  zIndex: 1,
  flex: "1 1 0",
  minWidth: 0,
  height: 240,
  margin: 0,
  padding: "96px 0",
  overflowX: "hidden",
  overflowY: "auto",
  boxSizing: "border-box",
  listStyle: "none",
  outline: "none",
  scrollSnapType: "y mandatory",
  WebkitOverflowScrolling: "touch",
  scrollbarWidth: "none",
  selectors: {
    "&:focus": {
      boxShadow: "inset 0 0 0 2px var(--meu-color-accent)"
    },
    "&::-webkit-scrollbar": { display: "none" }
  }
});

export const option = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: 48,
  paddingInline: "var(--meu-space-2)",
  overflow: "hidden",
  boxSizing: "border-box",
  color: "var(--meu-color-muted)",
  fontSize: 16,
  lineHeight: 1.25,
  textAlign: "center",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  cursor: "pointer",
  scrollSnapAlign: "center",
  WebkitTapHighlightColor: "transparent",
  selectors: {
    '&[aria-selected="true"]': {
      color: "var(--meu-color-ink)",
      fontWeight: 700
    },
    '&[aria-disabled="true"]': {
      color: "var(--meu-color-muted)",
      cursor: "not-allowed",
      opacity: 0.45
    }
  }
});

export const emptyOption = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: 48,
  color: "var(--meu-color-muted)",
  fontSize: 14,
  textAlign: "center"
});
