import { style } from "@vanilla-extract/css";

const hiddenProperties = {
  position: "absolute",
  boxSizing: "border-box",
  width: 1,
  height: 1,
  minWidth: 0,
  minHeight: 0,
  maxWidth: 1,
  maxHeight: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  clipPath: "inset(50%)",
  WebkitClipPath: "inset(50%)",
  whiteSpace: "nowrap",
  wordWrap: "normal",
  borderWidth: 0
} as const;

export const visuallyHidden = style({
  ...hiddenProperties,
  "@media": {
    "(forced-colors: active)": {
      borderWidth: 0,
      clipPath: "inset(50%)",
      WebkitClipPath: "inset(50%)",
      forcedColorAdjust: "none"
    }
  }
});

export const visuallyHiddenFocusable = style({
  selectors: {
    "&:not(:focus):not(:focus-within)": hiddenProperties
  },
  "@media": {
    "(forced-colors: active)": {
      selectors: {
        "&:not(:focus):not(:focus-within)": {
          borderWidth: 0,
          clipPath: "inset(50%)",
          WebkitClipPath: "inset(50%)",
          forcedColorAdjust: "none"
        }
      }
    }
  }
});
