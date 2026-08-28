import { keyframes, style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

const spin = keyframes({
  to: { transform: "rotate(360deg)" }
});

export const button = recipe({
  base: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--meu-space-2)",
    border: 0,
    borderRadius: "var(--meu-radius-control)",
    boxSizing: "border-box",
    fontFamily: "var(--meu-font-ui)",
    fontWeight: 600,
    lineHeight: 1,
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
    transition: [
      "transform var(--meu-motion-exit) var(--meu-motion-ease-standard)",
      "background-color var(--meu-motion-exit) var(--meu-motion-ease-standard)",
      "border-color var(--meu-motion-exit) var(--meu-motion-ease-standard)"
    ].join(", "),
    selectors: {
      "&:active:not(:disabled)": { transform: "translateY(1px)" },
      "&:focus": {
        outline: "2px solid var(--meu-color-accent)",
        outlineOffset: 2
      },
      "&:disabled": {
        cursor: "not-allowed",
        color: "var(--meu-color-muted)",
        background: "var(--meu-color-subtle)",
        borderColor: "var(--meu-color-border)"
      }
    },
    "@media": {
      "(prefers-reduced-motion: reduce)": { transitionDuration: "1ms" }
    }
  },
  variants: {
    variant: {
      solid: {},
      outline: { background: "transparent", borderStyle: "solid", borderWidth: 1 },
      ghost: { background: "transparent" },
      text: { minHeight: 44, paddingInline: "var(--meu-space-2)", background: "transparent" }
    },
    tone: {
      accent: {},
      neutral: {},
      danger: {}
    },
    size: {
      small: { minHeight: 44, paddingInline: "var(--meu-space-3)", fontSize: 14 },
      medium: {
        minHeight: "var(--meu-size-control-medium)",
        paddingInline: "var(--meu-space-4)",
        fontSize: 16
      },
      large: {
        minHeight: "var(--meu-size-control-large)",
        paddingInline: "var(--meu-space-5)",
        fontSize: 16
      }
    },
    block: {
      true: { width: "100%" },
      false: {}
    }
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
    {
      variants: { variant: "ghost", tone: "accent" },
      style: { color: "var(--meu-color-accent)" }
    },
    {
      variants: { variant: "ghost", tone: "neutral" },
      style: { color: "var(--meu-color-ink)" }
    },
    {
      variants: { variant: "ghost", tone: "danger" },
      style: { color: "var(--meu-color-danger)" }
    },
    {
      variants: { variant: "text", tone: "accent" },
      style: { color: "var(--meu-color-accent)" }
    },
    {
      variants: { variant: "text", tone: "neutral" },
      style: { color: "var(--meu-color-ink)" }
    },
    {
      variants: { variant: "text", tone: "danger" },
      style: { color: "var(--meu-color-danger)" }
    }
  ],
  defaultVariants: {
    variant: "solid",
    tone: "accent",
    size: "medium",
    block: false
  }
});

export const buttonItem = style({
  display: "inline-flex"
});

export const spinner = style({
  width: "1em",
  height: "1em",
  border: "2px solid currentColor",
  borderRightColor: "transparent",
  borderRadius: "50%",
  animation: `${spin} 700ms linear infinite`,
  "@media": {
    "(prefers-reduced-motion: reduce)": { animation: "none" }
  }
});
