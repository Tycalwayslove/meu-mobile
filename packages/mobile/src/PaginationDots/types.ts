import type { ComponentProps, MouseEvent, Ref } from "react";

/**
 * Layout direction for pagination markers.
 *
 * @public
 */
export type PaginationDotsDirection = "horizontal" | "vertical";
/**
 * Visual shape used for pagination markers.
 *
 * @public
 */
export type PaginationDotsVariant = "dot" | "line";

/**
 * Props for compact page-position markers.
 *
 * @public
 */
export type PaginationDotsProps = Omit<ComponentProps<"div">, "children"> & {
  /** Zero-based active page. Non-finite values become zero; other values are clamped. */
  activeIndex: number;
  /** Total page count. Non-finite and negative values become zero; huge values are safety-bounded. */
  count: number;
  /** Visual flow direction. @defaultValue "horizontal" */
  direction?: PaginationDotsDirection;
  /** Returns the accessible name for an interactive page button. */
  getPageLabel?: (index: number, count: number) => string;
  /** Renders native page buttons. The default remains a read-only status indicator. */
  interactive?: boolean;
  /** Maximum visible page markers before compression. Normalized to the safe range 5–99. @defaultValue 7 */
  maxVisible?: number;
  /** Called after an enabled page button is activated. */
  onChange?: (index: number, event: MouseEvent<HTMLButtonElement>) => void;
  ref?: Ref<HTMLDivElement>;
  /** Marker shape. @defaultValue "dot" */
  variant?: PaginationDotsVariant;
};
