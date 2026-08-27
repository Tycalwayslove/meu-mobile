import type { HTMLAttributes, ReactNode } from "react";

export type DividerProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  align?: "start" | "center" | "end";
  children?: ReactNode;
  direction?: "horizontal" | "vertical";
};
