import { globalStyle, style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const root = recipe({
  base: {
    display: "grid",
    width: "100%",
    color: "var(--meu-color-ink)",
    fontFamily: "var(--meu-font-ui)"
  },
  variants: {
    disabled: {
      true: { color: "var(--meu-color-muted)" },
      false: {}
    },
    readOnly: {
      true: {},
      false: {}
    },
    size: {
      small: { gap: "var(--meu-space-1)" },
      medium: { gap: "var(--meu-space-2)" },
      large: { gap: "var(--meu-space-2)" }
    }
  },
  defaultVariants: { disabled: false, readOnly: false, size: "medium" }
});

export const controlRow = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "center",
  gap: "var(--meu-space-3)"
});

export const input = style({
  vars: {
    "--meu-slider-fill-color": "var(--meu-color-accent)",
    "--meu-slider-progress": "0%",
    "--meu-slider-thumb-size": "22px"
  },
  width: "100%",
  minWidth: 0,
  minHeight: 44,
  padding: 0,
  margin: 0,
  appearance: "none",
  WebkitAppearance: "none",
  background: "transparent",
  cursor: "pointer",
  touchAction: "pan-y",
  WebkitTapHighlightColor: "transparent",
  selectors: {
    "&:focus": {
      outline: 0,
      borderRadius: "var(--meu-radius-round)",
      boxShadow: "0 0 0 2px var(--meu-color-accent)"
    },
    "&:disabled": { cursor: "not-allowed", opacity: 0.65 }
  },
  "@media": {
    "(forced-colors: active)": {
      forcedColorAdjust: "auto"
    }
  }
});

globalStyle(`${input}::-webkit-slider-runnable-track`, {
  height: 6,
  background:
    "linear-gradient(to right, var(--meu-slider-fill-color) 0%, var(--meu-slider-fill-color) var(--meu-slider-progress), var(--meu-color-border) var(--meu-slider-progress), var(--meu-color-border) 100%)",
  borderRadius: "var(--meu-radius-round)"
});

globalStyle(`${input}::-webkit-slider-thumb`, {
  width: "var(--meu-slider-thumb-size)",
  height: "var(--meu-slider-thumb-size)",
  marginTop: "calc((6px - var(--meu-slider-thumb-size)) / 2)",
  appearance: "none",
  WebkitAppearance: "none",
  background: "var(--meu-color-surface)",
  border: "2px solid var(--meu-slider-fill-color)",
  borderRadius: "50%",
  boxShadow: "0 2px 6px #18201a29",
  "@media": {
    "(forced-colors: active)": {
      background: "Canvas",
      borderColor: "Highlight",
      boxShadow: "none"
    }
  }
});

globalStyle(`[dir="rtl"] ${input}::-webkit-slider-runnable-track`, {
  background:
    "linear-gradient(to left, var(--meu-slider-fill-color) 0%, var(--meu-slider-fill-color) var(--meu-slider-progress), var(--meu-color-border) var(--meu-slider-progress), var(--meu-color-border) 100%)"
});

globalStyle(`${input}[dir="rtl"]::-webkit-slider-runnable-track`, {
  background:
    "linear-gradient(to left, var(--meu-slider-fill-color) 0%, var(--meu-slider-fill-color) var(--meu-slider-progress), var(--meu-color-border) var(--meu-slider-progress), var(--meu-color-border) 100%)"
});

globalStyle(`${input}::-moz-range-track`, {
  height: 6,
  background: "var(--meu-color-border)",
  borderRadius: "var(--meu-radius-round)"
});

globalStyle(`${input}::-moz-range-progress`, {
  height: 6,
  background: "var(--meu-slider-fill-color)",
  borderRadius: "var(--meu-radius-round)"
});

globalStyle(`${input}::-moz-range-thumb`, {
  width: "var(--meu-slider-thumb-size)",
  height: "var(--meu-slider-thumb-size)",
  background: "var(--meu-color-surface)",
  border: "2px solid var(--meu-slider-fill-color)",
  borderRadius: "50%",
  boxShadow: "0 2px 6px #18201a29",
  "@media": {
    "(forced-colors: active)": {
      background: "Canvas",
      borderColor: "Highlight",
      boxShadow: "none"
    }
  }
});

export const inputSize = recipe({
  variants: {
    size: {
      small: { vars: { "--meu-slider-thumb-size": "20px" } },
      medium: { vars: { "--meu-slider-thumb-size": "22px" } },
      large: { vars: { "--meu-slider-thumb-size": "24px" }, minHeight: 52 }
    },
    status: {
      default: {},
      error: { vars: { "--meu-slider-fill-color": "var(--meu-color-danger)" } }
    }
  },
  defaultVariants: { size: "medium", status: "default" }
});

export const valueText = style({
  minWidth: 36,
  color: "var(--meu-color-muted)",
  fontSize: 14,
  fontVariantNumeric: "tabular-nums",
  textAlign: "end"
});

export const marks = style({
  position: "relative",
  height: 28,
  marginInline: 10,
  color: "var(--meu-color-muted)",
  fontSize: 12
});

export const mark = style({
  position: "absolute",
  top: 0,
  display: "grid",
  justifyItems: "center",
  minWidth: 20,
  transform: "translateX(-50%)",
  selectors: {
    "&::before": {
      content: '""',
      width: 4,
      height: 4,
      background: "var(--meu-color-border)",
      borderRadius: "50%"
    }
  }
});

globalStyle(`[dir="rtl"] ${mark}`, {
  transform: "translateX(50%)"
});

globalStyle(`${input}:focus::-webkit-slider-thumb`, {
  boxShadow: "0 0 0 2px var(--meu-color-surface), 0 0 0 4px var(--meu-color-accent)"
});

globalStyle(`${input}:focus::-moz-range-thumb`, {
  boxShadow: "0 0 0 2px var(--meu-color-surface), 0 0 0 4px var(--meu-color-accent)"
});
