import { style } from "@vanilla-extract/css";

export const popupPanel = style({ background: "var(--meu-color-surface)" });

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

export const cancelButton = style({ justifySelf: "start" });
export const confirmButton = style({ justifySelf: "end" });

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

export const content = style({
  minWidth: 0,
  maxHeight: "calc(90vh - 52px)",
  overflowX: "hidden",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch"
});

export const summary = style({
  minHeight: 44,
  boxSizing: "border-box",
  padding: "var(--meu-space-3) var(--meu-space-4)",
  color: "var(--meu-color-muted)",
  borderBottom: "1px solid var(--meu-color-border)",
  fontSize: 13,
  lineHeight: 1.45,
  textAlign: "center"
});

export const presets = style({
  display: "flex",
  flexWrap: "wrap",
  gap: "var(--meu-space-2)",
  margin: 0,
  padding: "var(--meu-space-3) var(--meu-space-4) 0",
  listStyle: "none"
});

export const presetButton = style({ minHeight: 44 });

export const calendar = style({
  width: "100%",
  minWidth: 0,
  border: 0,
  borderRadius: 0
});
