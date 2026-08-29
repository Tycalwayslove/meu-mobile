"use client";

import { Children, Fragment, isValidElement } from "react";
import type { ReactNode } from "react";

import {
  body,
  description as descriptionStyle,
  extra as extraStyle,
  footerActions,
  footer as footerStyle,
  header,
  heading,
  leading as leadingStyle,
  media as mediaStyle,
  root,
  sectionPadding,
  title as titleStyle
} from "./Card.css";
import type { CardProps } from "./types";

function hasRenderableContent(node: ReactNode): boolean {
  return Children.toArray(node).some(
    (child) =>
      !isValidElement<{ children?: ReactNode }>(child) ||
      child.type !== Fragment ||
      hasRenderableContent(child.props.children)
  );
}

/**
 * Renders a structured surface with optional header, body, and footer regions.
 *
 * @public
 */
export function Card({
  children,
  className,
  description,
  extra,
  footer,
  footerLayout = "content",
  leading,
  media,
  mediaAspectRatio,
  padding = "medium",
  ref,
  title,
  variant = "outlined",
  ...props
}: CardProps) {
  const hasLeading = hasRenderableContent(leading);
  const hasTitle = hasRenderableContent(title);
  const hasDescription = hasRenderableContent(description);
  const hasExtra = hasRenderableContent(extra);
  const hasFooter = hasRenderableContent(footer);
  const hasHeader = hasLeading || hasTitle || hasDescription || hasExtra;
  const hasBody = hasRenderableContent(children);
  const classes = root({ variant });

  return (
    <div
      {...props}
      ref={ref}
      className={className ? `${classes} ${className}` : classes}
      data-meu-component="card"
      data-padding={padding}
      data-variant={variant}
    >
      {hasRenderableContent(media) ? (
        <div
          className={mediaStyle}
          style={mediaAspectRatio === undefined ? undefined : { aspectRatio: mediaAspectRatio }}
          data-meu-card-media
        >
          {media}
        </div>
      ) : null}
      {hasHeader ? (
        <div
          className={`${header({ divided: hasBody || hasFooter })} ${sectionPadding({ padding })}`}
          data-meu-card-header
        >
          {hasLeading ? <div className={leadingStyle}>{leading}</div> : null}
          <div className={heading}>
            {hasTitle ? <div className={titleStyle}>{title}</div> : null}
            {hasDescription ? <div className={descriptionStyle}>{description}</div> : null}
          </div>
          {hasExtra ? <div className={extraStyle}>{extra}</div> : null}
        </div>
      ) : null}
      {hasBody ? (
        <div className={`${body} ${sectionPadding({ padding })}`} data-meu-card-body>
          {children}
        </div>
      ) : null}
      {hasFooter ? (
        <div
          className={`${footerStyle({ divided: hasHeader || hasBody })} ${sectionPadding({ padding })}${footerLayout === "actions" ? ` ${footerActions}` : ""}`}
          data-meu-card-footer
          data-layout={footerLayout}
        >
          {footer}
        </div>
      ) : null}
    </div>
  );
}
