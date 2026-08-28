import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const root = recipe({
  base: {
    minWidth: 308,
    boxSizing: "border-box",
    padding: "var(--meu-space-3)",
    color: "var(--meu-color-ink)",
    background: "var(--meu-color-surface)",
    border: "1px solid transparent",
    borderRadius: "var(--meu-radius-surface)",
    fontFamily: "var(--meu-font-ui)",
    "@media": {
      "(forced-colors: active)": {
        borderColor: "CanvasText"
      }
    }
  },
  variants: {
    invalid: {
      true: { borderColor: "var(--meu-color-danger)" },
      false: {}
    }
  },
  defaultVariants: { invalid: false }
});

export const header = style({
  display: "grid",
  gridTemplateColumns: "44px minmax(0, 1fr) 44px",
  alignItems: "center",
  minHeight: 44,
  marginBottom: "var(--meu-space-2)"
});

export const monthTitle = style({
  minWidth: 0,
  margin: 0,
  overflow: "hidden",
  textAlign: "center",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: 16,
  fontWeight: 600,
  lineHeight: 1.4
});

export const navigationButton = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 44,
  height: 44,
  padding: 0,
  color: "var(--meu-color-ink)",
  background: "transparent",
  border: 0,
  borderRadius: "var(--meu-radius-control)",
  cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
  selectors: {
    "&:focus": { outline: "2px solid var(--meu-color-accent)", outlineOffset: -2 },
    "&:disabled": { color: "var(--meu-color-muted)", cursor: "not-allowed", opacity: 0.45 }
  },
  "@media": {
    "(forced-colors: active)": {
      color: "ButtonText",
      border: "1px solid ButtonText"
    }
  }
});

export const nextIcon = style({ transform: "rotate(180deg)" });

export const weekdayRow = style({
  display: "grid",
  gridTemplateColumns: "repeat(7, minmax(44px, 1fr))"
});

export const weekday = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 32,
  color: "var(--meu-color-muted)",
  fontSize: 12,
  fontWeight: 500,
  lineHeight: 1.3
});

export const days = style({ display: "grid", gap: 0 });

export const dayRow = style({
  display: "grid",
  gridTemplateColumns: "repeat(7, minmax(44px, 1fr))"
});

export const dayCell = recipe({
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 44,
    minHeight: 48,
    boxSizing: "border-box"
  },
  variants: {
    inRange: {
      true: { background: "var(--meu-color-subtle)" },
      false: { background: "transparent" }
    },
    rangeEnd: {
      true: {
        borderTopRightRadius: "var(--meu-radius-round)",
        borderBottomRightRadius: "var(--meu-radius-round)"
      },
      false: {}
    },
    rangeStart: {
      true: {
        borderTopLeftRadius: "var(--meu-radius-round)",
        borderBottomLeftRadius: "var(--meu-radius-round)"
      },
      false: {}
    },
    rtl: {
      true: {},
      false: {}
    }
  },
  compoundVariants: [
    {
      variants: { rangeStart: true, rtl: true },
      style: {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        borderTopRightRadius: "var(--meu-radius-round)",
        borderBottomRightRadius: "var(--meu-radius-round)"
      }
    },
    {
      variants: { rangeEnd: true, rtl: true },
      style: {
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        borderTopLeftRadius: "var(--meu-radius-round)",
        borderBottomLeftRadius: "var(--meu-radius-round)"
      }
    },
    {
      variants: { rangeEnd: true, rangeStart: true, rtl: true },
      style: {
        borderTopLeftRadius: "var(--meu-radius-round)",
        borderBottomLeftRadius: "var(--meu-radius-round)",
        borderTopRightRadius: "var(--meu-radius-round)",
        borderBottomRightRadius: "var(--meu-radius-round)"
      }
    }
  ],
  defaultVariants: { inRange: false, rangeEnd: false, rangeStart: false, rtl: false }
});

export const emptyDay = style({ width: "100%", minHeight: 48 });

export const dayButton = recipe({
  base: {
    position: "relative",
    zIndex: 1,
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
    width: 44,
    minWidth: 44,
    height: 44,
    minHeight: 44,
    boxSizing: "border-box",
    padding: "2px",
    color: "var(--meu-color-ink)",
    background: "transparent",
    border: 0,
    borderRadius: "var(--meu-radius-round)",
    font: "inherit",
    lineHeight: 1.2,
    cursor: "pointer",
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
    transition: [
      "background-color var(--meu-motion-exit) var(--meu-motion-ease-standard)",
      "color var(--meu-motion-exit) var(--meu-motion-ease-standard)"
    ].join(", "),
    selectors: {
      "&:focus": { outline: "2px solid var(--meu-color-accent)", outlineOffset: -2 },
      "&:disabled": { cursor: "not-allowed" }
    },
    "@media": {
      "(prefers-reduced-motion: reduce)": { transitionDuration: "1ms" },
      "(forced-colors: active)": { border: "1px solid ButtonText" }
    }
  },
  variants: {
    disabled: {
      true: { color: "var(--meu-color-muted)", opacity: 0.42 },
      false: {}
    },
    outside: {
      true: { color: "var(--meu-color-muted)" },
      false: {}
    },
    selected: {
      true: {
        color: "var(--meu-color-accent-contrast)",
        background: "var(--meu-color-accent)",
        "@media": {
          "(forced-colors: active)": {
            color: "HighlightText",
            background: "Highlight"
          }
        }
      },
      false: {}
    },
    today: {
      true: {
        boxShadow: "inset 0 0 0 1px var(--meu-color-accent)",
        "@media": { "(forced-colors: active)": { boxShadow: "inset 0 0 0 2px ButtonText" } }
      },
      false: {}
    }
  },
  defaultVariants: { disabled: false, outside: false, selected: false, today: false }
});

export const dayNumber = style({ fontSize: 14, fontWeight: 500 });

export const dayLabel = style({
  maxWidth: "100%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: 9,
  lineHeight: 1.1
});
