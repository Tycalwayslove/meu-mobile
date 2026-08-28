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

function mergeIdReferences(...values: Array<string | undefined>): string | undefined {
  const ids = values.flatMap((value) => (value ? value.trim().split(/\s+/) : []));
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  return uniqueIds.length > 0 ? uniqueIds.join(" ") : undefined;
}

export function Empty({
  "aria-describedby": ariaDescribedby,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  action,
  className,
  description,
  illustration,
  reason = "no-data",
  ref,
  role = "group",
  secondaryAction,
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
      aria-labelledby={ariaLabel ? undefined : mergeIdReferences(titleId, ariaLabelledby)}
      aria-describedby={mergeIdReferences(descriptionId, ariaDescribedby)}
      data-meu-component="empty"
      data-reason={reason}
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
      {action !== undefined || secondaryAction !== undefined ? (
        <div className={actionStyle} data-meu-slot="actions">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}
