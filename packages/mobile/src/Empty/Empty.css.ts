import { style } from "@vanilla-extract/css";

export const root = style({
  display: "grid",
  justifyItems: "center",
  width: "100%",
  boxSizing: "border-box",
  padding: "var(--meu-space-8) var(--meu-space-4)",
  color: "var(--meu-color-ink)",
  fontFamily: "var(--meu-font-ui)",
  textAlign: "center"
});

export const illustration = style({
  display: "grid",
  placeItems: "center",
  minWidth: 64,
  minHeight: 56,
  marginBottom: "var(--meu-space-4)",
  color: "var(--meu-color-muted)"
});

export const defaultIllustration = style({
  position: "relative",
  display: "block",
  width: 60,
  height: 42,
  boxSizing: "border-box",
  border: "2px solid var(--meu-color-border)",
  borderRadius: "var(--meu-radius-surface)",
  background: "var(--meu-color-surface)",
  selectors: {
    "&::before": {
      position: "absolute",
      top: 13,
      right: 12,
      left: 12,
      height: 2,
      borderRadius: "var(--meu-radius-round)",
      background: "var(--meu-color-border)",
      content: ""
    },
    "&::after": {
      position: "absolute",
      right: 19,
      bottom: 10,
      left: 19,
      height: 6,
      border: "2px solid var(--meu-color-accent)",
      borderTop: 0,
      borderRadius: "0 0 6px 6px",
      content: ""
    }
  }
});

export const title = style({
  maxWidth: 440,
  fontSize: 18,
  fontWeight: 600,
  lineHeight: "26px",
  overflowWrap: "anywhere"
});

export const description = style({
  maxWidth: 440,
  marginTop: "var(--meu-space-2)",
  color: "var(--meu-color-muted)",
  fontSize: 14,
  lineHeight: "20px",
  overflowWrap: "anywhere"
});

export const action = style({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: "var(--meu-space-2)",
  marginTop: "var(--meu-space-5)"
});
