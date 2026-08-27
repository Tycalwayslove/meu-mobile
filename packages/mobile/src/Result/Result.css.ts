import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

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

export const icon = recipe({
  base: {
    display: "grid",
    placeItems: "center",
    width: 56,
    height: 56,
    marginBottom: "var(--meu-space-5)",
    boxSizing: "border-box",
    border: "2px solid currentcolor",
    borderRadius: "var(--meu-radius-round)",
    fontSize: 26,
    fontWeight: 600,
    lineHeight: 1
  },
  variants: {
    status: {
      success: { color: "var(--meu-color-success)", background: "var(--meu-color-subtle)" },
      error: { color: "var(--meu-color-danger)", background: "var(--meu-color-subtle)" },
      info: { color: "var(--meu-color-accent)", background: "var(--meu-color-subtle)" },
      warning: { color: "var(--meu-color-warning)", background: "var(--meu-color-subtle)" },
      waiting: { color: "var(--meu-color-muted)", background: "var(--meu-color-subtle)" }
    }
  },
  defaultVariants: { status: "info" }
});

export const waitingDots = style({
  display: "flex",
  alignItems: "center",
  gap: 4
});

export const waitingDot = style({
  display: "block",
  width: 5,
  height: 5,
  borderRadius: "var(--meu-radius-round)",
  background: "currentcolor"
});

export const title = style({
  maxWidth: 480,
  fontSize: 20,
  fontWeight: 600,
  lineHeight: "28px",
  overflowWrap: "anywhere"
});

export const description = style({
  maxWidth: 480,
  marginTop: "var(--meu-space-2)",
  color: "var(--meu-color-muted)",
  fontSize: 14,
  lineHeight: "20px",
  overflowWrap: "anywhere"
});

export const actions = style({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: "var(--meu-space-2)",
  marginTop: "var(--meu-space-6)"
});
