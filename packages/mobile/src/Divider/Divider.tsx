import { forwardRef } from "react";

import { content, divider, line, shortLine } from "./Divider.css";
import type { DividerProps } from "./types";

/**
 * Separates related content groups with native `separator` semantics.
 *
 * @public
 */
export const Divider = forwardRef<HTMLDivElement, DividerProps>(function Divider(
  {
    align = "center",
    "aria-label": ariaLabel,
    children,
    className,
    direction = "horizontal",
    ...props
  },
  ref
) {
  const classes = divider({ direction });
  const hasContent =
    direction === "horizontal" && children !== undefined && children !== null && children !== false;
  const contentLabel =
    hasContent && (typeof children === "string" || typeof children === "number")
      ? String(children)
      : undefined;
  return (
    <div
      {...props}
      ref={ref}
      role="separator"
      aria-label={ariaLabel !== undefined ? ariaLabel : contentLabel}
      aria-orientation={direction}
      className={className ? `${classes} ${className}` : classes}
      data-meu-component="divider"
      data-align={align}
      data-content={hasContent ? "true" : "false"}
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
