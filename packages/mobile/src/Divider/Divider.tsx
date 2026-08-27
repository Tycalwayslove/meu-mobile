import { forwardRef } from "react";

import { content, divider, line, shortLine } from "./Divider.css";
import type { DividerProps } from "./types";

export const Divider = forwardRef<HTMLDivElement, DividerProps>(function Divider(
  { align = "center", children, className, direction = "horizontal", ...props },
  ref
) {
  const classes = divider({ direction });
  const hasContent = direction === "horizontal" && children;
  return (
    <div
      {...props}
      ref={ref}
      role="separator"
      aria-orientation={direction}
      className={className ? `${classes} ${className}` : classes}
      data-meu-component="divider"
      data-direction={direction}
    >
      {direction === "horizontal" ? (
        hasContent ? (
          <>
            <span
              className={align === "start" ? `${line} ${shortLine}` : line}
              aria-hidden="true"
            />
            <span className={content}>{children}</span>
            <span className={align === "end" ? `${line} ${shortLine}` : line} aria-hidden="true" />
          </>
        ) : (
          <span className={line} aria-hidden="true" />
        )
      ) : null}
    </div>
  );
});
