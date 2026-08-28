import type { HTMLAttributes } from "react";

/**
 * A viewport edge that can expose an operating-system safe-area inset.
 *
 * @public
 */
export type SafeAreaPosition = "top" | "right" | "bottom" | "left";

/**
 * Properties for {@link SafeArea}.
 *
 * @public
 */
export type SafeAreaProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /**
   * CSS length used when `env()` is unsupported. It does not replace a valid
   * platform inset. Numbers are interpreted as CSS pixels.
   *
   * @defaultValue `0`
   */
  fallback?: number | string;
  /**
   * Viewport edge whose inset is consumed.
   *
   * @defaultValue `"bottom"`
   */
  position?: SafeAreaPosition;
};
