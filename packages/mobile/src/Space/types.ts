import type { HTMLAttributes } from "react";

/**
 * Supported spacing-token steps. Each value maps to `--meu-space-{value}`.
 *
 * @public
 */
export type SpaceGap = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;

/**
 * Props for arranging sibling content with design-token spacing.
 *
 * @public
 */
export type SpaceProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Cross-axis alignment using logical flex start/end.
   *
   * @defaultValue "center"
   */
  align?: "start" | "center" | "end" | "baseline" | "stretch";
  /**
   * Fills the available inline width instead of using an inline flex container.
   *
   * @defaultValue false
   */
  block?: boolean;
  /**
   * Main-axis layout direction. Horizontal order follows the document `dir`.
   *
   * @defaultValue "horizontal"
   */
  direction?: "horizontal" | "vertical";
  /**
   * Meu spacing-token step used for both row and column gaps.
   *
   * @defaultValue 2
   */
  gap?: SpaceGap;
  /**
   * Allows items to flow onto another flex line when the container is constrained.
   *
   * @defaultValue false
   */
  wrap?: boolean;
};
