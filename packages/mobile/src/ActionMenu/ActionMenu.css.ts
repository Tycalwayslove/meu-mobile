import { style } from "@vanilla-extract/css";

export const popupPanel = style({
  background: "var(--meu-color-subtle)",
  boxShadow: "var(--meu-shadow-floating)"
});

export const root = style({
  display: "grid",
  gap: "var(--meu-space-2)",
  minWidth: 0,
  color: "var(--meu-color-ink)",
  background: "var(--meu-color-subtle)"
});

export const header = style({
  padding: "var(--meu-space-5) var(--meu-space-5) var(--meu-space-4)",
  textAlign: "center",
  background: "var(--meu-color-surface)"
});

export const title = style({
  margin: 0,
  color: "var(--meu-color-ink)",
  fontSize: 16,
  fontWeight: 700,
  lineHeight: 1.4,
  overflowWrap: "anywhere",
  wordBreak: "break-word"
});

export const description = style({
  margin: "var(--meu-space-2) 0 0",
  color: "var(--meu-color-muted)",
  fontSize: 14,
  lineHeight: 1.5,
  whiteSpace: "pre-wrap"
});

export const group = style({
  display: "grid",
  gap: 1,
  minWidth: 0,
  overflow: "hidden",
  background: "var(--meu-color-border)"
});

export const actionButton = style({
  justifyContent: "flex-start",
  minHeight: 56,
  padding: "var(--meu-space-3) var(--meu-space-5)",
  borderRadius: 0,
  background: "var(--meu-color-surface)",
  textAlign: "start",
  selectors: {
    "&:focus": {
      zIndex: 1,
      outlineOffset: -3
    },
    "&:disabled": { background: "var(--meu-color-surface)" }
  }
});

export const actionContent = style({
  display: "grid",
  justifyItems: "start",
  gap: "var(--meu-space-1)",
  minWidth: 0,
  width: "100%",
  lineHeight: 1.35,
  textAlign: "start"
});

export const actionLabel = style({
  minWidth: 0,
  overflowWrap: "anywhere",
  wordBreak: "break-word"
});

export const actionDescription = style({
  color: "var(--meu-color-muted)",
  fontSize: 13,
  fontWeight: 400,
  lineHeight: 1.4,
  overflowWrap: "anywhere",
  wordBreak: "break-word"
});

export const cancelGroup = style({
  paddingTop: 0
});
