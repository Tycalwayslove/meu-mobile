"use client";

import { MeuIconChevronLeft } from "@meu/icons-react";
import { VisuallyHidden } from "@meu/primitives-react";
import type { MouseEvent, Ref } from "react";

import { useMeuConfig } from "../ConfigProvider";
import {
  arrow as arrowStyle,
  cellFrame,
  content,
  defaultArrowIcon,
  description as descriptionStyle,
  divider as dividerStyle,
  extra as extraStyle,
  loadingIndicator,
  prefix as prefixStyle,
  row,
  spinner,
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
  loading = false,
  loadingLabel: loadingLabelProp,
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
  const config = useMeuConfig();
  const listContext = useListContext();
  const resolvedDir = props.dir === "ltr" || props.dir === "rtl" ? props.dir : config.dir;
  const hasHref = Boolean(href);
  const interactive = Boolean(hasHref || clickable || onClick);
  const unavailable = disabled || loading;
  const showDefaultArrow = arrow === undefined && interactive && !loading;
  const classes = row({ disabled: disabled || (loading && interactive), interactive });
  const resolvedClasses = className ? `${classes} ${className}` : classes;
  const loadingLabel =
    loadingLabelProp !== undefined
      ? loadingLabelProp
      : config.locale === "en-US"
        ? "Loading"
        : "正在加载";
  const arrowNode = loading ? null : showDefaultArrow || arrow === true ? (
    <MeuIconChevronLeft
      className={defaultArrowIcon({ direction: resolvedDir })}
      size={18}
      strokeWidth={2}
    />
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
      {loading ? (
        <span className={loadingIndicator} aria-hidden="true">
          <span className={spinner({ motion: config.motion })} />
        </span>
      ) : null}
      {arrowNode ? (
        <span className={arrowStyle} aria-hidden="true">
          {arrowNode}
        </span>
      ) : null}
    </>
  );

  function handleUnavailableLink(event: MouseEvent<HTMLAnchorElement>) {
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
        href={unavailable ? undefined : href}
        role={unavailable ? "link" : props.role}
        target={target}
        rel={rel}
        download={download}
        tabIndex={unavailable ? -1 : props.tabIndex}
        aria-busy={loading ? true : props["aria-busy"]}
        aria-disabled={unavailable || undefined}
        onClick={unavailable ? handleUnavailableLink : onClick}
        data-meu-component="cell"
        data-state={loading ? "loading" : disabled ? "disabled" : "interactive"}
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
        disabled={unavailable}
        aria-busy={loading ? true : props["aria-busy"]}
        onClick={onClick}
        data-meu-component="cell"
        data-state={loading ? "loading" : disabled ? "disabled" : "interactive"}
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
        aria-busy={loading ? true : props["aria-busy"]}
        data-meu-component="cell"
        data-state={loading ? "loading" : disabled ? "disabled" : "static"}
      >
        {cellContent}
      </div>
    );
  }

  return (
    <div className={cellFrame} role={listContext.insideList ? "listitem" : undefined}>
      {rowNode}
      {loading && loadingLabel ? (
        <VisuallyHidden role="status" aria-atomic="true" aria-live="polite">
          {loadingLabel}
        </VisuallyHidden>
      ) : null}
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
