import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const root = recipe({
  base: {
    width: "100%",
    minWidth: 0,
    margin: 0,
    padding: 0,
    color: "var(--meu-color-ink)",
    fontFamily: "var(--meu-font-ui)",
    listStyle: "none",
    selectors: {
      "&:focus": {
        outline: "2px solid var(--meu-color-accent)",
        outlineOffset: 2
      }
    }
  },
  variants: {
    direction: {
      horizontal: {
        display: "flex",
        alignItems: "flex-start",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch"
      },
      vertical: { display: "grid", gap: "var(--meu-space-3)" }
    }
  },
  defaultVariants: { direction: "horizontal" }
});

export const step = recipe({
  base: {
    position: "relative",
    minWidth: 0,
    selectors: {
      "&::after": {
        position: "absolute",
        zIndex: 0,
        background: "var(--meu-color-border)",
        content: ""
      },
      '&[data-last="true"]::after': { display: "none" },
      '&[data-disabled="true"]': { opacity: 0.55 }
    }
  },
  variants: {
    direction: {
      horizontal: {
        display: "grid",
        flex: "1 1 0",
        minWidth: 96,
        justifyItems: "center",
        paddingInline: "var(--meu-space-1)",
        textAlign: "center",
        selectors: {
          "&::after": {
            top: 15,
            insetInlineStart: "calc(50% + 20px)",
            insetInlineEnd: "calc(-50% + 20px)",
            height: 2
          }
        }
      },
      vertical: {
        minHeight: 56,
        selectors: {
          "&::after": { top: 36, bottom: -12, insetInlineStart: 15, width: 2 }
        }
      }
    },
    size: {
      medium: {},
      small: {
        selectors: {
          "&::after": { top: 11, insetInlineStart: 11 }
        }
      }
    },
    status: {
      wait: {},
      process: {},
      finish: { selectors: { "&::after": { background: "var(--meu-color-accent)" } } },
      error: {}
    }
  },
  compoundVariants: [
    {
      variants: { direction: "horizontal", size: "small" },
      style: {
        selectors: {
          "&::after": {
            insetInlineStart: "calc(50% + 16px)",
            insetInlineEnd: "calc(-50% + 16px)"
          }
        }
      }
    },
    {
      variants: { direction: "vertical", size: "small" },
      style: { minHeight: 48, selectors: { "&::after": { top: 28, bottom: -12 } } }
    }
  ],
  defaultVariants: { direction: "horizontal", size: "medium", status: "wait" }
});

export const action = recipe({
  base: {
    width: "100%",
    minWidth: 0,
    minHeight: 44,
    padding: 0,
    border: 0,
    color: "inherit",
    background: "transparent",
    font: "inherit",
    transition: "transform var(--meu-motion-exit) var(--meu-motion-ease-standard)",
    selectors: {
      "button&": { cursor: "pointer" },
      "button&:disabled": { cursor: "not-allowed" },
      "button&:active:not(:disabled)": { transform: "scale(0.98)" },
      "button&:focus": {
        borderRadius: "var(--meu-radius-control)",
        outline: "2px solid var(--meu-color-accent)",
        outlineOffset: 2
      },
      '[data-meu-motion="reduced"] &': { transitionDuration: "0ms" }
    },
    "@media": {
      "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
      "(forced-colors: active)": {
        selectors: { "button&:focus": { outlineColor: "Highlight" } }
      }
    }
  },
  variants: {
    direction: {
      horizontal: { display: "grid", justifyItems: "center", textAlign: "center" },
      vertical: {
        display: "grid",
        gridTemplateColumns: "32px minmax(0, 1fr)",
        columnGap: "var(--meu-space-3)",
        textAlign: "start"
      }
    },
    size: {
      medium: {},
      small: {}
    }
  },
  compoundVariants: [
    {
      variants: { direction: "vertical", size: "small" },
      style: { gridTemplateColumns: "24px minmax(0, 1fr)" }
    }
  ],
  defaultVariants: { direction: "horizontal", size: "medium" }
});

export const indicator = recipe({
  base: {
    position: "relative",
    zIndex: 1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    boxSizing: "border-box",
    border: "2px solid var(--meu-color-border)",
    borderRadius: "var(--meu-radius-round)",
    fontSize: 13,
    fontWeight: 600,
    lineHeight: 1,
    transition:
      "color var(--meu-motion-exit) var(--meu-motion-ease-standard), background-color var(--meu-motion-exit) var(--meu-motion-ease-standard), border-color var(--meu-motion-exit) var(--meu-motion-ease-standard)",
    "@media": {
      "(prefers-reduced-motion: reduce)": { transition: "none" },
      "(forced-colors: active)": {
        color: "CanvasText",
        background: "Canvas",
        borderColor: "CanvasText"
      }
    },
    selectors: {
      '[data-meu-motion="reduced"] &': { transitionDuration: "0ms" }
    }
  },
  variants: {
    size: {
      medium: {},
      small: { width: 24, height: 24, borderWidth: 1, fontSize: 11 }
    },
    status: {
      wait: {
        color: "var(--meu-color-muted)",
        background: "var(--meu-color-surface)",
        borderColor: "var(--meu-color-border)"
      },
      process: {
        color: "var(--meu-color-accent-contrast)",
        background: "var(--meu-color-accent)",
        borderColor: "var(--meu-color-accent)",
        "@media": { "(forced-colors: active)": { color: "HighlightText", background: "Highlight" } }
      },
      finish: {
        color: "var(--meu-color-accent)",
        background: "var(--meu-color-subtle)",
        borderColor: "var(--meu-color-accent)"
      },
      error: {
        color: "var(--meu-color-danger-contrast)",
        background: "var(--meu-color-danger)",
        borderColor: "var(--meu-color-danger)",
        "@media": { "(forced-colors: active)": { borderColor: "Mark", color: "MarkText" } }
      }
    }
  },
  defaultVariants: { size: "medium", status: "wait" }
});

export const dotGlyph = style({
  width: 6,
  height: 6,
  borderRadius: "var(--meu-radius-round)",
  background: "currentColor"
});

export const content = recipe({
  base: { minWidth: 0 },
  variants: {
    direction: {
      horizontal: { marginTop: "var(--meu-space-2)", maxWidth: 160 },
      vertical: { paddingTop: 4, paddingBottom: "var(--meu-space-3)" }
    },
    size: {
      medium: {},
      small: {}
    }
  },
  compoundVariants: [
    {
      variants: { direction: "vertical", size: "small" },
      style: { paddingTop: 1 }
    }
  ],
  defaultVariants: { direction: "horizontal", size: "medium" }
});

export const title = recipe({
  base: {
    color: "var(--meu-color-ink)",
    fontWeight: 500,
    overflowWrap: "anywhere"
  },
  variants: {
    size: {
      medium: { fontSize: 14, lineHeight: "20px" },
      small: { fontSize: 13, lineHeight: "18px" }
    }
  },
  defaultVariants: { size: "medium" }
});

export const description = recipe({
  base: {
    marginTop: 2,
    color: "var(--meu-color-muted)",
    fontSize: 12,
    overflowWrap: "anywhere"
  },
  variants: {
    size: {
      medium: { lineHeight: "18px" },
      small: { lineHeight: "16px" }
    }
  },
  defaultVariants: { size: "medium" }
});
