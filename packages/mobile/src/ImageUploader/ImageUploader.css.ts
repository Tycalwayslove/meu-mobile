import { globalStyle, style } from "@vanilla-extract/css";

export const root = style({
  display: "grid",
  width: "100%",
  minWidth: 0,
  gap: "var(--meu-space-2)",
  gridTemplateColumns: "repeat(var(--meu-image-uploader-columns), minmax(0, 1fr))",
  color: "var(--meu-color-ink)",
  fontFamily: "var(--meu-font-ui)"
});

export const cell = style({
  position: "relative",
  minWidth: 0,
  overflow: "hidden",
  boxSizing: "border-box",
  background: "var(--meu-color-subtle)",
  border: "1px solid var(--meu-color-border)",
  borderRadius: "var(--meu-radius-control)",
  selectors: {
    "&::before": { content: "", display: "block", paddingTop: "100%" },
    '&[data-has-action="true"]::before': { paddingTop: "calc(100% + 44px)" },
    '&[data-state="error"]': { borderColor: "var(--meu-color-danger)" },
    '&[data-disabled="true"]': { opacity: 0.56 }
  }
});

export const cellContent = style({
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  display: "grid",
  minWidth: 0,
  minHeight: 0,
  placeItems: "center",
  selectors: {
    [`${cell}[data-has-action="true"] &`]: {
      gridTemplateRows: "minmax(0, 1fr) 44px"
    }
  }
});

export const media = style({
  position: "relative",
  width: "100%",
  height: "100%",
  minWidth: 0,
  minHeight: 0,
  overflow: "hidden",
  borderRadius: "inherit"
});

export const previewButton = style({
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  width: "100%",
  height: "100%",
  margin: 0,
  padding: 0,
  overflow: "hidden",
  color: "inherit",
  background: "transparent",
  border: 0,
  borderRadius: "inherit",
  font: "inherit",
  cursor: "zoom-in",
  WebkitTapHighlightColor: "transparent",
  selectors: {
    "&:focus": { outline: "2px solid var(--meu-color-accent)", outlineOffset: -2 },
    "&:disabled": { cursor: "default" }
  }
});

export const staticPreview = style({
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
});

globalStyle(`${media} [data-meu-component="image"]`, {
  width: "100%",
  height: "100%",
  borderRadius: "inherit"
});

export const actionButton = style({
  display: "grid",
  width: "100%",
  height: 44,
  minWidth: 44,
  minHeight: 44,
  margin: 0,
  padding: 0,
  placeItems: "center",
  color: "var(--meu-color-danger)",
  background: "var(--meu-color-surface)",
  border: 0,
  borderTop: "1px solid var(--meu-color-border)",
  borderRadius: "0 0 var(--meu-radius-control) var(--meu-radius-control)",
  font: "inherit",
  cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
  selectors: {
    "&:focus": { outline: "2px solid var(--meu-color-accent)", outlineOffset: -2 },
    "&:active": { background: "var(--meu-color-subtle)" },
    "&:disabled": { cursor: "wait", opacity: 0.72 }
  },
  "@media": {
    "(forced-colors: active)": { border: "1px solid ButtonText" }
  }
});

export const uploadButton = style({
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  display: "flex",
  width: "100%",
  height: "100%",
  minWidth: 44,
  minHeight: 44,
  margin: 0,
  padding: "var(--meu-space-2)",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  gap: "var(--meu-space-1)",
  color: "var(--meu-color-muted)",
  background: "var(--meu-color-subtle)",
  border: 0,
  borderRadius: "inherit",
  font: "inherit",
  fontSize: 12,
  lineHeight: 1.25,
  cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
  selectors: {
    "&:focus": { outline: "2px solid var(--meu-color-accent)", outlineOffset: -2 },
    "&:active:not(:disabled)": { background: "var(--meu-color-border)" },
    "&:disabled": { cursor: "not-allowed" }
  }
});

export const uploadIcon = style({ display: "grid", width: 24, height: 24, placeItems: "center" });

export const nativeInput = style({
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

export const taskMask = style({
  position: "absolute",
  zIndex: 2,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  display: "flex",
  boxSizing: "border-box",
  padding: "var(--meu-space-2)",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  gap: "var(--meu-space-1)",
  color: "#FFFFFF",
  background: "rgba(0, 0, 0, 0.72)",
  fontSize: 12,
  lineHeight: 1.3,
  textAlign: "center"
});

export const progressTrack = style({
  width: "72%",
  height: 4,
  overflow: "hidden",
  background: "rgba(255, 255, 255, 0.32)",
  borderRadius: "var(--meu-radius-round)"
});

export const progressFill = style({
  width: "calc(var(--meu-image-uploader-progress) * 1%)",
  height: "100%",
  background: "#FFFFFF",
  borderRadius: "inherit",
  transition: "width var(--meu-motion-enter) var(--meu-motion-ease-standard)",
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "1ms" },
    "(forced-colors: active)": { background: "Highlight" }
  }
});

export const retryButton = style({
  minWidth: 44,
  minHeight: 44,
  margin: 0,
  padding: "0 var(--meu-space-2)",
  color: "#FFFFFF",
  background: "transparent",
  border: "1px solid currentColor",
  borderRadius: "var(--meu-radius-control)",
  font: "inherit",
  fontSize: 12,
  fontWeight: 650,
  cursor: "pointer",
  selectors: { "&:focus": { outline: "2px solid #FFFFFF", outlineOffset: 2 } },
  "@media": {
    "(forced-colors: active)": { color: "ButtonText", background: "Canvas" }
  }
});
