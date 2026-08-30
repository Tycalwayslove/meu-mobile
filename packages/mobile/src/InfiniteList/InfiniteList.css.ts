import { keyframes, style } from "@vanilla-extract/css";

const spin = keyframes({
  to: { transform: "rotate(360deg)" }
});

export const root = style({
  display: "grid",
  placeItems: "center",
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  padding: "var(--meu-space-4)",
  color: "var(--meu-color-muted)",
  fontFamily: "var(--meu-font-ui)",
  fontSize: 14,
  lineHeight: "20px",
  textAlign: "center"
});

export const content = style({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  maxWidth: "100%",
  minWidth: 0,
  gap: "var(--meu-space-2)",
  overflowWrap: "anywhere"
});

export const spinner = style({
  width: 16,
  height: 16,
  boxSizing: "border-box",
  flex: "none",
  border: "2px solid var(--meu-color-border)",
  borderTopColor: "var(--meu-color-accent)",
  borderRadius: "var(--meu-radius-round)",
  animation: `${spin} 800ms linear infinite`,
  "@media": {
    "(prefers-reduced-motion: reduce)": { animation: "none" }
  }
});

export const spinnerReduced = style({ animation: "none" });

export const action = style({
  minWidth: 120,
  maxWidth: "100%",
  minHeight: 44,
  padding: "var(--meu-space-2) var(--meu-space-4)",
  color: "var(--meu-color-accent)",
  background: "transparent",
  border: "1px solid var(--meu-color-border)",
  borderRadius: "var(--meu-radius-control)",
  font: "inherit",
  fontWeight: 600,
  overflowWrap: "anywhere",
  cursor: "pointer",
  touchAction: "manipulation",
  WebkitTapHighlightColor: "transparent",
  selectors: {
    "&:focus": {
      outline: "2px solid var(--meu-color-accent)",
      outlineOffset: 2
    },
    "&:disabled": {
      color: "var(--meu-color-muted)",
      background: "var(--meu-color-subtle)",
      cursor: "not-allowed"
    }
  },
  "@media": {
    "(forced-colors: active)": {
      borderColor: "ButtonText",
      color: "ButtonText",
      forcedColorAdjust: "auto"
    }
  }
});

export const errorText = style({ color: "var(--meu-color-ink)" });
