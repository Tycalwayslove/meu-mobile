import type { HTMLAttributes } from "react";

export type SpaceGap = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
export type SpaceProps = HTMLAttributes<HTMLDivElement> & {
  align?: "start" | "center" | "end" | "baseline" | "stretch";
  block?: boolean;
  direction?: "horizontal" | "vertical";
  gap?: SpaceGap;
  wrap?: boolean;
};
