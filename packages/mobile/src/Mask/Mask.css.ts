import { recipe } from "@vanilla-extract/recipes";

export const root = recipe({
  base: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1000,
    display: "grid",
    placeItems: "center",
    boxSizing: "border-box"
  },
  variants: {
    state: {
      open: { pointerEvents: "auto" },
      closed: { pointerEvents: "none" }
    }
  },
  defaultVariants: { state: "open" }
});

export const backdrop = recipe({
  base: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: "100%",
    padding: 0,
    background: "var(--meu-color-overlay)",
    border: 0,
    transition: "opacity var(--meu-motion-enter) var(--meu-motion-ease-standard)",
    "@media": {
      "(prefers-reduced-motion: reduce)": { transitionDuration: "1ms" }
    }
  },
  variants: {
    state: {
      open: { opacity: "var(--meu-mask-opacity)" },
      closed: { opacity: 0, transitionDuration: "var(--meu-motion-exit)" }
    }
  },
  defaultVariants: { state: "open" }
});

export const content = recipe({
  base: {
    position: "relative",
    zIndex: 1,
    maxWidth: "100%",
    maxHeight: "100%",
    transition: "opacity var(--meu-motion-enter) var(--meu-motion-ease-standard)",
    "@media": {
      "(prefers-reduced-motion: reduce)": { transitionDuration: "1ms" }
    }
  },
  variants: {
    state: {
      open: { opacity: 1 },
      closed: { opacity: 0, transitionDuration: "var(--meu-motion-exit)" }
    }
  },
  defaultVariants: { state: "open" }
});
