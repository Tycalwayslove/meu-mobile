import { keyframes, style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

const spin = keyframes({ to: { transform: "rotate(360deg)" } });

export const iconButton = recipe({
  base: {
    display: "inline-grid",
    placeItems: "center",
    flexShrink: 0,
    boxSizing: "border-box",
    minWidth: 44,
    minHeight: 44,
    padding: 0,
    border: 0,
    borderRadius: "var(--meu-radius-control)",
    fontFamily: "var(--meu-font-ui)",
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
    transition: [
      "transform var(--meu-motion-exit) var(--meu-motion-ease-standard)",
      "background-color var(--meu-motion-exit) var(--meu-motion-ease-standard)",
      "border-color var(--meu-motion-exit) var(--meu-motion-ease-standard)"
    ].join(", "),
    selectors: {
      "&:active:not(:disabled)": { transform: "translateY(1px)" },
      '&[aria-pressed="true"], &[aria-pressed="mixed"]': {
        boxShadow: "inset 0 0 0 2px currentColor"
      },
      "&:focus": { outline: "2px solid var(--meu-color-accent)", outlineOffset: 2 },
      "&:disabled": {
        color: "var(--meu-color-muted)",
        background: "var(--meu-color-subtle)",
        borderColor: "var(--meu-color-border)",
        cursor: "not-allowed"
      }
    },
    "@media": { "(prefers-reduced-motion: reduce)": { transitionDuration: "1ms" } }
  },
  variants: {
    size: {
      small: { width: 44, height: 44 },
      medium: { width: 44, height: 44 },
      large: { width: "var(--meu-size-control-large)", height: "var(--meu-size-control-large)" }
    },
    variant: {
      solid: {},
      outline: { background: "transparent", borderStyle: "solid", borderWidth: 1 },
      ghost: { background: "transparent" }
    },
    tone: { accent: {}, neutral: {}, danger: {} }
  },
  compoundVariants: [
    {
      variants: { variant: "solid", tone: "accent" },
      style: { color: "var(--meu-color-accent-contrast)", background: "var(--meu-color-accent)" }
    },
    {
      variants: { variant: "solid", tone: "neutral" },
      style: { color: "var(--meu-color-surface)", background: "var(--meu-color-ink)" }
    },
    {
      variants: { variant: "solid", tone: "danger" },
      style: { color: "var(--meu-color-danger-contrast)", background: "var(--meu-color-danger)" }
    },
    {
      variants: { variant: "outline", tone: "accent" },
      style: { color: "var(--meu-color-accent)", borderColor: "var(--meu-color-accent)" }
    },
    {
      variants: { variant: "outline", tone: "neutral" },
      style: { color: "var(--meu-color-ink)", borderColor: "var(--meu-color-border)" }
    },
    {
      variants: { variant: "outline", tone: "danger" },
      style: { color: "var(--meu-color-danger)", borderColor: "var(--meu-color-danger)" }
    },
    { variants: { variant: "ghost", tone: "accent" }, style: { color: "var(--meu-color-accent)" } },
    { variants: { variant: "ghost", tone: "neutral" }, style: { color: "var(--meu-color-ink)" } },
    { variants: { variant: "ghost", tone: "danger" }, style: { color: "var(--meu-color-danger)" } }
  ],
  defaultVariants: { size: "medium", variant: "ghost", tone: "neutral" }
});

export const spinner = style({
  width: 18,
  height: 18,
  border: "2px solid currentColor",
  borderRightColor: "transparent",
  borderRadius: "50%",
  animation: `${spin} 700ms linear infinite`,
  "@media": { "(prefers-reduced-motion: reduce)": { animation: "none" } }
});

export const content = style({
  display: "inline-grid",
  placeItems: "center",
  lineHeight: 0
});
