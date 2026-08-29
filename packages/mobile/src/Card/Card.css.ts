import { globalStyle, style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

const paddingValues = {
  none: 0,
  small: "var(--meu-space-3)",
  medium: "var(--meu-space-4)",
  large: "var(--meu-space-6)"
} as const;

export const root = recipe({
  base: {
    width: "100%",
    minWidth: 0,
    overflow: "hidden",
    boxSizing: "border-box",
    color: "var(--meu-color-ink)",
    background: "var(--meu-color-surface)",
    borderRadius: "var(--meu-radius-surface)",
    fontFamily: "var(--meu-font-ui)",
    "@media": {
      "(forced-colors: active)": {
        border: "1px solid CanvasText",
        boxShadow: "none"
      }
    }
  },
  variants: {
    variant: {
      outlined: { border: "1px solid var(--meu-color-border)" },
      filled: { border: "1px solid transparent", background: "var(--meu-color-subtle)" },
      elevated: { border: "1px solid transparent", boxShadow: "var(--meu-shadow-floating)" }
    }
  },
  defaultVariants: { variant: "outlined" }
});

export const media = style({
  display: "block",
  width: "100%",
  minWidth: 0,
  overflow: "hidden",
  background: "var(--meu-color-subtle)"
});

globalStyle(`${media} > img, ${media} > video`, {
  display: "block",
  maxWidth: "100%"
});

export const sectionPadding = recipe({
  base: { boxSizing: "border-box" },
  variants: {
    padding: {
      none: { padding: paddingValues.none },
      small: { padding: paddingValues.small },
      medium: { padding: paddingValues.medium },
      large: { padding: paddingValues.large }
    }
  },
  defaultVariants: { padding: "medium" }
});

export const header = recipe({
  base: {
    display: "flex",
    alignItems: "flex-start",
    minWidth: 0
  },
  variants: {
    divided: {
      true: { borderBottom: "1px solid var(--meu-color-border)" },
      false: {}
    }
  },
  defaultVariants: { divided: false }
});

export const leading = style({
  display: "flex",
  flex: "0 0 auto",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 24,
  minHeight: 24,
  marginInlineEnd: "var(--meu-space-3)",
  color: "var(--meu-color-accent)"
});

export const heading = style({ flex: "1 1 auto", minWidth: 0 });

export const title = style({
  minWidth: 0,
  fontSize: 16,
  fontWeight: 600,
  lineHeight: "24px",
  wordBreak: "break-word",
  overflowWrap: "anywhere"
});

export const description = style({
  minWidth: 0,
  marginTop: "var(--meu-space-1)",
  color: "var(--meu-color-muted)",
  fontSize: 14,
  lineHeight: "20px",
  wordBreak: "break-word",
  overflowWrap: "anywhere"
});

export const extra = style({
  display: "flex",
  flex: "0 1 auto",
  alignItems: "center",
  minWidth: 0,
  maxWidth: "50%",
  minHeight: 24,
  marginInlineStart: "var(--meu-space-3)",
  wordBreak: "break-word",
  overflowWrap: "anywhere"
});

export const body = style({
  minWidth: 0,
  wordBreak: "break-word",
  overflowWrap: "anywhere"
});

export const footer = recipe({
  base: { minWidth: 0 },
  variants: {
    divided: {
      true: { borderTop: "1px solid var(--meu-color-border)" },
      false: {}
    }
  },
  defaultVariants: { divided: false }
});

export const footerActions = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  flexWrap: "wrap"
});

globalStyle(`${footerActions} > *`, { marginBlock: "var(--meu-space-1)" });
globalStyle(`${footerActions} > * + *`, { marginInlineStart: "var(--meu-space-2)" });
