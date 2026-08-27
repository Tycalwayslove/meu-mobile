import { style } from "@vanilla-extract/css";

export const field = style({ display: "grid", gap: "var(--meu-space-2)" });
export const label = style({
  color: "var(--meu-color-ink)",
  fontFamily: "var(--meu-font-ui)",
  fontSize: "var(--meu-font-label-font-size)",
  fontWeight: "var(--meu-font-label-font-weight)",
  lineHeight: "var(--meu-font-label-line-height)"
});
export const required = style({ color: "var(--meu-color-danger)", marginInlineStart: 4 });
export const description = style({
  margin: 0,
  color: "var(--meu-color-muted)",
  fontSize: "var(--meu-font-meta-font-size)",
  lineHeight: "var(--meu-font-meta-line-height)"
});
export const error = style([description, { color: "var(--meu-color-danger)" }]);
