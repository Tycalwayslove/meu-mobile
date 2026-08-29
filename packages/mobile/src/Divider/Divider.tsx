import { Children, Fragment, forwardRef, isValidElement } from "react";
import type { ReactNode } from "react";

import { content, divider, line, shortLine } from "./Divider.css";
import type { DividerProps } from "./types";

function hasRenderableContent(node: ReactNode): boolean {
  return Children.toArray(node).some(
    (child) =>
      !isValidElement<{ children?: ReactNode }>(child) ||
      child.type !== Fragment ||
      hasRenderableContent(child.props.children)
  );
}

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
  const hasContent = direction === "horizontal" && hasRenderableContent(children);
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
