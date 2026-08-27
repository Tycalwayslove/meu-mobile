import { forwardRef } from "react";

import { space } from "./Space.css";
import type { SpaceProps } from "./types";

export const Space = forwardRef<HTMLDivElement, SpaceProps>(function Space(
  {
    align = "center",
    block = false,
    className,
    direction = "horizontal",
    gap = 2,
    wrap = false,
    ...props
  },
  ref
) {
  const classes = space({ align, block, direction, gap, wrap });
  return (
    <div
      {...props}
      ref={ref}
      className={className ? `${classes} ${className}` : classes}
      data-meu-component="space"
      data-direction={direction}
    />
  );
});
