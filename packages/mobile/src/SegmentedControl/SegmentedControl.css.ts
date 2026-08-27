import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const root = recipe({
  base: {
    display: "inline-flex",
    alignItems: "stretch",
    gap: 2,
    boxSizing: "border-box",
    padding: 2,
    color: "var(--meu-color-ink)",
    background: "var(--meu-color-subtle)",
    border: "1px solid transparent",
    borderRadius: "var(--meu-radius-control)",
    fontFamily: "var(--meu-font-ui)"
  },
  variants: {
    block: {
      true: { display: "flex", width: "100%" },
      false: { width: "auto", maxWidth: "100%" }
    },
    status: {
      default: {},
      error: { borderColor: "var(--meu-color-danger)" }
    }
  },
  defaultVariants: { block: false, status: "default" }
});

export const item = recipe({
  base: { position: "relative", minWidth: 0 },
  variants: { block: { true: { flex: "1 1 0" }, false: { flex: "0 1 auto" } } },
  defaultVariants: { block: false }
});

export const input = style({
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0
});

export const option = recipe({
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--meu-space-1)",
    minWidth: 0,
    minHeight: 44,
    boxSizing: "border-box",
    color: "var(--meu-color-muted)",
    background: "transparent",
    borderRadius: "calc(var(--meu-radius-control) - 2px)",
    fontWeight: 500,
    lineHeight: 1.3,
    cursor: "pointer",
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
    transition: [
      "background-color var(--meu-motion-exit) var(--meu-motion-ease-standard)",
      "color var(--meu-motion-exit) var(--meu-motion-ease-standard)",
      "box-shadow var(--meu-motion-exit) var(--meu-motion-ease-standard)"
    ].join(", "),
    selectors: {
      [`${input}:focus + &`]: {
        outline: "2px solid var(--meu-color-accent)",
        outlineOffset: -2
      }
    },
    "@media": { "(prefers-reduced-motion: reduce)": { transitionDuration: "1ms" } }
  },
  variants: {
    active: {
      true: {
        color: "var(--meu-color-ink)",
        background: "var(--meu-color-surface)",
        boxShadow: "0 1px 3px var(--meu-color-border)"
      },
      false: {}
    },
    disabled: {
      true: { color: "var(--meu-color-muted)", cursor: "not-allowed", opacity: 0.5 },
      false: {}
    },
    size: {
      small: { minHeight: 44, padding: "0 var(--meu-space-3)", fontSize: 13 },
      medium: { minHeight: 44, padding: "0 var(--meu-space-4)", fontSize: 14 },
      large: { minHeight: 48, padding: "0 var(--meu-space-5)", fontSize: 15 }
    }
  },
  defaultVariants: { active: false, disabled: false, size: "medium" }
});

export const label = style({ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });
export const icon = style({ display: "inline-flex", flex: "0 0 auto" });
