"use client";

import { useId } from "react";

import {
  action as actionStyle,
  defaultIllustration,
  description as descriptionStyle,
  illustration as illustrationStyle,
  root,
  title as titleStyle
} from "./Empty.css";
import type { EmptyProps } from "./types";

export function Empty({
  "aria-describedby": ariaDescribedby,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  action,
  className,
  description,
  illustration,
  ref,
  role = "group",
  title,
  ...props
}: EmptyProps) {
  const generatedId = useId();
  const titleId = `${generatedId}-title`;
  const descriptionId = `${generatedId}-description`;
  const resolvedIllustration =
    illustration === undefined ? <span className={defaultIllustration} /> : illustration;

  return (
    <div
      {...props}
      ref={ref}
      className={className ? `${root} ${className}` : root}
      role={role}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel ? undefined : ariaLabelledby || titleId}
      aria-describedby={ariaDescribedby || descriptionId}
      data-meu-component="empty"
    >
      {resolvedIllustration !== null && resolvedIllustration !== false ? (
        <div className={illustrationStyle} aria-hidden="true">
          {resolvedIllustration}
        </div>
      ) : null}
      <div className={titleStyle} id={titleId}>
        {title}
      </div>
      <div className={descriptionStyle} id={descriptionId}>
        {description}
      </div>
      <div className={actionStyle}>{action}</div>
    </div>
  );
}
