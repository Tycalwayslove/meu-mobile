"use client";

import {
  body,
  description as descriptionStyle,
  extra as extraStyle,
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
  const hasLeading = leading !== undefined && leading !== null;
  const hasTitle = title !== undefined && title !== null;
  const hasDescription = description !== undefined && description !== null;
  const hasExtra = extra !== undefined && extra !== null;
  const hasFooter = footer !== undefined && footer !== null;
  const hasHeader = hasLeading || hasTitle || hasDescription || hasExtra;
  const hasBody = children !== undefined && children !== null;
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
      {media !== undefined && media !== null ? (
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
          className={`${footerStyle({ actions: footerLayout === "actions", divided: hasHeader || hasBody })} ${sectionPadding({ padding })}`}
          data-meu-card-footer
          data-layout={footerLayout}
        >
          {footer}
        </div>
      ) : null}
    </div>
  );
}
