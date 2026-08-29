import { style } from "@vanilla-extract/css";

const systemMotionDurations = {
  "--meu-motion-enter": "180ms",
  "--meu-motion-exit": "140ms"
} as const;

const reducedMotionDurations = {
  "--meu-motion-enter": "0ms",
  "--meu-motion-exit": "0ms"
} as const;

export const motionSystem = style({
  vars: systemMotionDurations,
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      vars: reducedMotionDurations
    }
  }
});

export const motionReduced = style({
  vars: reducedMotionDurations
});

/**
 * Keeps user-agent rendered controls aligned with the explicit or system
 * theme without adding a JavaScript media-query subscription.
 */
export const themeBoundary = style({
  selectors: {
    '&[data-meu-theme="light"]': { colorScheme: "light" },
    '&[data-meu-theme="dark"]': { colorScheme: "dark" },
    '&[data-meu-theme="system"]': { colorScheme: "light dark" }
  }
});
