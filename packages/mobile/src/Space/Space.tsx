import { forwardRef } from "react";

import { space } from "./Space.css";
import type { SpaceProps } from "./types";

/**
 * Arranges sibling elements with a consistent Meu spacing token.
 *
 * @public
 */
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
      data-align={align}
      data-direction={direction}
      data-gap={gap}
      data-wrap={wrap ? "true" : "false"}
    />
  );
});
