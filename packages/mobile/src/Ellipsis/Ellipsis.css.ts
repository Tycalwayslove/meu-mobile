import { style } from "@vanilla-extract/css";

export const ellipsisRoot = style({
  position: "relative",
  minWidth: 0,
  color: "inherit",
  font: "inherit",
  lineHeight: "inherit",
  overflowWrap: "anywhere",
  wordBreak: "break-word"
});

export const visualText = style({
  whiteSpace: "pre-wrap"
});

export const pendingClamp = style({
  display: "-webkit-box",
  overflow: "hidden",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: "var(--meu-ellipsis-rows)"
});

export const measure = style({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  visibility: "hidden",
  pointerEvents: "none",
  whiteSpace: "pre-wrap",
  overflowWrap: "anywhere",
  wordBreak: "break-word"
});

export const measureAction = style({
  display: "inline-flex",
  marginInlineStart: 4,
  color: "var(--meu-color-accent)",
  font: "inherit",
  fontWeight: 600,
  lineHeight: "inherit"
});

export const action = style({
  display: "inline-flex",
  alignItems: "center",
  minWidth: 44,
  minHeight: 44,
  boxSizing: "border-box",
  margin: "-10px -4px -10px 0",
  padding: "0 4px 0 8px",
  color: "var(--meu-color-accent)",
  background: "transparent",
  border: 0,
  borderRadius: "var(--meu-radius-control)",
  font: "inherit",
  fontWeight: 600,
  lineHeight: "inherit",
  cursor: "pointer",
  verticalAlign: "middle",
  WebkitTapHighlightColor: "transparent",
  selectors: {
    "&:focus": { outline: "2px solid var(--meu-color-accent)", outlineOffset: -2 },
    "&:active": { color: "var(--meu-color-accent-pressed)" }
  }
});
