"use client";

import { useId } from "react";

import { body, footer as footerStyle, header as headerStyle, root } from "./List.css";
import { ListContext } from "./ListContext";
import type { ListProps } from "./types";

/**
 * Renders an accessible group of cells with shared dividers and surface styling.
 *
 * @public
 */
export function List({
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  children,
  className,
  divider = "inset",
  footer,
  header,
  mode = "plain",
  ref,
  ...props
}: ListProps) {
  const generatedHeaderId = `meu-list-header-${useId()}`;
  const resolvedLabelledBy = ariaLabel
    ? undefined
    : ariaLabelledBy || (header !== undefined && header !== null ? generatedHeaderId : undefined);

  return (
    <div
      {...props}
      ref={ref}
      className={className ? `${root} ${className}` : root}
      data-meu-component="list"
      data-mode={mode}
      data-divider={divider}
    >
      {header !== undefined && header !== null ? (
        <div id={generatedHeaderId} className={headerStyle({ mode })} data-meu-list-header>
          {header}
        </div>
      ) : null}
      <div
        className={body({ mode })}
        role="list"
        aria-label={ariaLabel}
        aria-labelledby={resolvedLabelledBy}
        data-meu-list-body
      >
        <ListContext.Provider value={{ divider, insideList: true }}>
          {children}
        </ListContext.Provider>
      </div>
      {footer !== undefined && footer !== null ? (
        <div className={footerStyle({ mode })} data-meu-list-footer>
          {footer}
        </div>
      ) : null}
    </div>
  );
}
