import { style } from "@vanilla-extract/css";

export const visuallyHidden = style({
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  clipPath: "inset(50%)",
  WebkitClipPath: "inset(50%)",
  whiteSpace: "nowrap",
  wordWrap: "normal",
  border: 0,
  "@media": {
    "(forced-colors: active)": {
      border: 0,
      clipPath: "inset(50%)",
      forcedColorAdjust: "none"
    }
  }
});
