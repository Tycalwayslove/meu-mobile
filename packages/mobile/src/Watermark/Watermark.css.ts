import { style } from "@vanilla-extract/css";

export const root = style({
  position: "relative",
  minWidth: 0,
  isolation: "isolate",
  overflow: "hidden"
});

export const overlay = style({
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  display: "block",
  width: "100%",
  height: "100%",
  overflow: "hidden",
  pointerEvents: "none",
  userSelect: "none",
  WebkitPrintColorAdjust: "exact",
  printColorAdjust: "exact"
});
