import type { HTMLAttributes, ReactNode } from "react";

/**
 * Props for a semantic horizontal or vertical content separator.
 *
 * @public
 */
export type DividerProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /**
   * Places horizontal label content at logical start, center, or end.
   *
   * @defaultValue "center"
   */
  align?: "start" | "center" | "end";
  /** Optional horizontal label. Empty React nodes are ignored; vertical dividers do not render label content. */
  children?: ReactNode;
  /**
   * Separator orientation.
   *
   * @defaultValue "horizontal"
   */
  direction?: "horizontal" | "vertical";
};
