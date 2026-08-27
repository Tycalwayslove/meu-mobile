import type { CSSProperties, HTMLAttributes, Ref } from "react";

export type SkeletonVariant = "text" | "rectangle" | "circle";

export type SkeletonProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  animated?: boolean;
  height?: CSSProperties["height"];
  lines?: number;
  lineWidths?: ReadonlyArray<CSSProperties["width"]>;
  ref?: Ref<HTMLDivElement>;
  variant?: SkeletonVariant;
  width?: CSSProperties["width"];
};
