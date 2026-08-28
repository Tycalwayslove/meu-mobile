import type { CSSProperties, HTMLAttributes, Ref } from "react";

/** Visual placeholder shape. @public */
export type SkeletonVariant = "text" | "rectangle" | "circle";

/** Props for a decorative, layout-reserving loading placeholder. @public */
export type SkeletonProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Enables a decorative shimmer, disabled by reduced-motion preferences. @defaultValue false */
  animated?: boolean;
  /** Reserves a stable aspect ratio when explicit height is not appropriate. */
  aspectRatio?: CSSProperties["aspectRatio"];
  /** Reserved block height. Numbers are pixels. */
  height?: CSSProperties["height"];
  /** Number of text rows, clamped to 1–20. @defaultValue 1 */
  lines?: number;
  /** Per-row widths for text skeletons. Missing rows use deterministic defaults. */
  lineWidths?: ReadonlyArray<CSSProperties["width"]>;
  /** Root element ref. */
  ref?: Ref<HTMLDivElement>;
  /** Placeholder shape. @defaultValue "text" */
  variant?: SkeletonVariant;
  /** Reserved inline size. Numbers are pixels. */
  width?: CSSProperties["width"];
};
