import { keyframes, style } from "@vanilla-extract/css";

const spin = keyframes({ to: { transform: "rotate(360deg)" } });

export const popupPanel = style({ background: "var(--meu-color-surface)" });

export const root = style({
  minWidth: 0,
  color: "var(--meu-color-ink)",
  background: "var(--meu-color-surface)",
  fontFamily: "var(--meu-font-ui)"
});

export const header = style({
  display: "grid",
  gridTemplateColumns: "minmax(72px, 1fr) minmax(0, 2fr) minmax(72px, 1fr)",
  alignItems: "center",
  minHeight: 52,
  borderBottom: "1px solid var(--meu-color-border)"
});

export const headerButton = style({
  minWidth: 0,
  minHeight: 48,
  paddingInline: "var(--meu-space-4)",
  borderRadius: 0
});

export const cancelButton = style({ justifySelf: "start" });
export const confirmButton = style({ justifySelf: "end" });

export const title = style({
  margin: 0,
  overflow: "hidden",
  color: "var(--meu-color-ink)",
  fontSize: 16,
  fontWeight: 700,
  lineHeight: 1.35,
  textAlign: "center",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
});

export const search = style({
  display: "block",
  padding: "var(--meu-space-3) var(--meu-space-4)",
  borderBottom: "1px solid var(--meu-color-border)"
});

export const tree = style({
  position: "relative",
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  overflowX: "hidden",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
  outline: "none",
  selectors: {
    '&[data-status="error"]': {
      boxShadow: "inset 0 0 0 1px var(--meu-color-danger)"
    }
  }
});

export const sizer = style({ position: "relative", width: "100%", minWidth: 0 });

export const virtualRow = style({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  willChange: "transform"
});

export const row = style({
  position: "relative",
  display: "grid",
  gridTemplateColumns: "44px minmax(0, 1fr) 32px",
  alignItems: "center",
  width: "100%",
  minWidth: 0,
  minHeight: 52,
  paddingBlock: "var(--meu-space-1)",
  paddingInlineStart: "calc((var(--meu-tree-level, 1) - 1) * 20px + var(--meu-space-2))",
  paddingInlineEnd: "var(--meu-space-3)",
  boxSizing: "border-box",
  borderBottom: "1px solid var(--meu-color-border)",
  color: "var(--meu-color-ink)",
  background: "var(--meu-color-surface)",
  cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
  selectors: {
    "&:focus": {
      zIndex: 1,
      outline: "2px solid var(--meu-color-accent)",
      outlineOffset: -2
    },
    '&[aria-disabled="true"]': { cursor: "default", opacity: 0.48 },
    '&[data-selected="true"]': { background: "var(--meu-color-subtle)" },
    '&[data-readonly="true"]': { cursor: "default" }
  }
});

export const expandTarget = style({
  display: "grid",
  width: 44,
  height: 44,
  placeItems: "center",
  color: "var(--meu-color-muted)"
});

export const chevron = style({
  display: "grid",
  placeItems: "center",
  transition: "transform var(--meu-motion-fast)",
  transform: "rotate(180deg)",
  selectors: { '&[data-expanded="true"]': { transform: "rotate(270deg)" } },
  "@media": { "(prefers-reduced-motion: reduce)": { transition: "none" } }
});

export const label = style({
  minWidth: 0,
  overflow: "hidden",
  fontSize: 15,
  fontWeight: 600,
  lineHeight: "21px",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
});

export const description = style({
  display: "block",
  marginTop: 2,
  overflow: "hidden",
  color: "var(--meu-color-muted)",
  fontSize: 12,
  fontWeight: 400,
  lineHeight: "17px",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
});

export const selection = style({
  display: "grid",
  width: 24,
  height: 24,
  placeItems: "center",
  justifySelf: "end",
  boxSizing: "border-box",
  border: "1.5px solid var(--meu-color-border)",
  borderRadius: "var(--meu-radius-round)",
  color: "var(--meu-color-on-accent)",
  background: "var(--meu-color-surface)",
  selectors: {
    '&[data-multiple="true"]': { borderRadius: "var(--meu-radius-control)" },
    '&[data-selected="true"]': {
      borderColor: "var(--meu-color-accent)",
      background: "var(--meu-color-accent)"
    },
    '&[data-selectable="false"]': { visibility: "hidden" }
  }
});

export const loading = style({
  width: 16,
  height: 16,
  justifySelf: "end",
  boxSizing: "border-box",
  border: "2px solid var(--meu-color-border)",
  borderTopColor: "var(--meu-color-accent)",
  borderRadius: "var(--meu-radius-round)",
  animation: `${spin} 700ms linear infinite`,
  "@media": { "(prefers-reduced-motion: reduce)": { animation: "none" } }
});

export const empty = style({
  display: "grid",
  width: "100%",
  minHeight: 160,
  placeItems: "center",
  padding: "var(--meu-space-6) var(--meu-space-4)",
  boxSizing: "border-box",
  color: "var(--meu-color-muted)",
  fontSize: 14,
  lineHeight: "20px",
  textAlign: "center"
});
