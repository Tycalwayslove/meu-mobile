import type { ComponentProps, Ref } from "react";

export type PaginationDotsDirection = "horizontal" | "vertical";
export type PaginationDotsVariant = "dot" | "line";

export type PaginationDotsProps = Omit<ComponentProps<"div">, "children"> & {
  activeIndex: number;
  count: number;
  direction?: PaginationDotsDirection;
  ref?: Ref<HTMLDivElement>;
  variant?: PaginationDotsVariant;
};
