import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const root = style({
  minWidth: 0,
  color: "var(--meu-color-ink)",
  fontFamily: "var(--meu-font-ui)"
});

export const tabList = style({
  position: "relative",
  display: "flex",
  alignItems: "stretch",
  minWidth: 0,
  overflowX: "auto",
  overflowY: "hidden",
  borderBottom: "1px solid var(--meu-color-border)",
  scrollbarWidth: "none",
  WebkitOverflowScrolling: "touch",
  selectors: { "&::-webkit-scrollbar": { display: "none" } }
});

export const tab = recipe({
  base: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--meu-space-1)",
    minWidth: 72,
    minHeight: 48,
    boxSizing: "border-box",
    padding: "0 var(--meu-space-4)",
    color: "var(--meu-color-muted)",
    background: "transparent",
    border: 0,
    borderRadius: 0,
    font: "inherit",
    fontSize: 15,
    fontWeight: 500,
    lineHeight: 1.4,
    whiteSpace: "nowrap",
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
    transition: "color var(--meu-motion-exit) var(--meu-motion-ease-standard)",
    selectors: {
      "&::after": {
        position: "absolute",
        right: "var(--meu-space-3)",
        bottom: 0,
        left: "var(--meu-space-3)",
        height: 2,
        background: "var(--meu-color-accent)",
        borderRadius: "var(--meu-radius-round)",
        content: "",
        opacity: 0,
        transform: "scaleX(0.5)",
        transition: [
          "opacity var(--meu-motion-exit) var(--meu-motion-ease-standard)",
          "transform var(--meu-motion-exit) var(--meu-motion-ease-standard)"
        ].join(", ")
      },
      "&:focus": {
        zIndex: 1,
        outline: "2px solid var(--meu-color-accent)",
        outlineOffset: -3
      }
    },
    "@media": { "(prefers-reduced-motion: reduce)": { transitionDuration: "1ms" } }
  },
  variants: {
    active: {
      true: {
        color: "var(--meu-color-accent)",
        selectors: { "&::after": { opacity: 1, transform: "scaleX(1)" } }
      },
      false: {}
    },
    disabled: {
      true: { color: "var(--meu-color-muted)", cursor: "not-allowed", opacity: 0.5 },
      false: {}
    },
    stretch: {
      true: { flex: "1 1 0" },
      false: { flex: "0 0 auto" }
    }
  },
  defaultVariants: { active: false, disabled: false, stretch: true }
});

export const label = style({ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" });

export const panel = style({
  minWidth: 0,
  padding: "var(--meu-space-4) 0",
  outline: 0
});
