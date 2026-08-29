"use client";

import { MeuIconChevronLeft } from "@meu/icons-react";
import type { MouseEvent, Ref } from "react";

import {
  arrow as arrowStyle,
  cellFrame,
  content,
  defaultArrowIcon,
  description as descriptionStyle,
  divider as dividerStyle,
  extra as extraStyle,
  prefix as prefixStyle,
  row,
  suffix as suffixStyle,
  title as titleStyle
} from "./List.css";
import { useListContext } from "./ListContext";
import type { CellProps } from "./types";

/**
 * Renders a semantic list row as an anchor, button, or static element.
 *
 * @public
 */
export function Cell({
  arrow,
  className,
  clickable = false,
  description,
  disabled = false,
  download,
  extra,
  href,
  onClick,
  prefix,
  ref,
  rel,
  suffix,
  target,
  title,
  type = "button",
  ...props
}: CellProps) {
  const listContext = useListContext();
  const hasHref = Boolean(href);
  const interactive = Boolean(hasHref || clickable || onClick);
  const showDefaultArrow = arrow === undefined && interactive;
  const classes = row({ disabled, interactive });
  const resolvedClasses = className ? `${classes} ${className}` : classes;
  const arrowNode = showDefaultArrow ? (
    <MeuIconChevronLeft className={defaultArrowIcon} size={18} strokeWidth={2} />
  ) : arrow === true ? (
    <MeuIconChevronLeft className={defaultArrowIcon} size={18} strokeWidth={2} />
  ) : (
    arrow || null
  );

  const cellContent = (
    <>
      {prefix !== undefined && prefix !== null ? (
        <span className={prefixStyle}>{prefix}</span>
      ) : null}
      <span className={content}>
        <span className={titleStyle}>{title}</span>
        {description !== undefined && description !== null ? (
          <span className={descriptionStyle}>{description}</span>
        ) : null}
      </span>
      {extra !== undefined && extra !== null ? <span className={extraStyle}>{extra}</span> : null}
      {suffix !== undefined && suffix !== null ? (
        <span className={suffixStyle}>{suffix}</span>
      ) : null}
      {arrowNode ? (
        <span className={arrowStyle} aria-hidden="true">
          {arrowNode}
        </span>
      ) : null}
    </>
  );

  function handleDisabledLink(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    event.stopPropagation();
  }

  let rowNode;
  if (hasHref) {
    rowNode = (
      <a
        {...props}
        ref={ref as Ref<HTMLAnchorElement>}
        className={resolvedClasses}
        href={disabled ? undefined : href}
        target={target}
        rel={rel}
        download={download}
        tabIndex={disabled ? -1 : props.tabIndex}
        aria-disabled={disabled || undefined}
        onClick={disabled ? handleDisabledLink : onClick}
        data-meu-component="cell"
        data-state={disabled ? "disabled" : "interactive"}
      >
        {cellContent}
      </a>
    );
  } else if (interactive) {
    rowNode = (
      <button
        {...props}
        ref={ref as Ref<HTMLButtonElement>}
        className={resolvedClasses}
        type={type}
        disabled={disabled}
        onClick={onClick}
        data-meu-component="cell"
        data-state={disabled ? "disabled" : "interactive"}
      >
        {cellContent}
      </button>
    );
  } else {
    rowNode = (
      <div
        {...props}
        ref={ref as Ref<HTMLDivElement>}
        className={resolvedClasses}
        aria-disabled={disabled || undefined}
        data-meu-component="cell"
        data-state={disabled ? "disabled" : "static"}
      >
        {cellContent}
      </div>
    );
  }

  return (
    <div className={cellFrame} role={listContext.insideList ? "listitem" : undefined}>
      {rowNode}
      {listContext.insideList && listContext.divider !== "none" ? (
        <span
          className={dividerStyle({
            kind: listContext.divider,
            prefix: prefix !== undefined && prefix !== null
          })}
          aria-hidden="true"
          data-meu-cell-divider
        />
      ) : null}
    </div>
  );
}
