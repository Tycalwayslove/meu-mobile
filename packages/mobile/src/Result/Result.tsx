"use client";

import { MeuIconCheck, MeuIconX } from "@meu/icons-react";
import { createElement, useId } from "react";

import {
  actions as actionsStyle,
  description as descriptionStyle,
  icon as iconStyle,
  root,
  title as titleStyle,
  waitingDot,
  waitingDots
} from "./Result.css";
import type { ResultProps, ResultStatus } from "./types";

function mergeIdReferences(...values: Array<string | undefined>): string | undefined {
  const ids = values.flatMap((value) => (value ? value.trim().split(/\s+/) : []));
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  return uniqueIds.length > 0 ? uniqueIds.join(" ") : undefined;
}

function getDefaultIcon(status: ResultStatus) {
  if (status === "success") return <MeuIconCheck size={28} strokeWidth={2.25} />;
  if (status === "error") return <MeuIconX size={28} strokeWidth={2.25} />;
  if (status === "warning") return "!";
  if (status === "pending" || status === "waiting") {
    return (
      <span className={waitingDots}>
        <span className={waitingDot} />
        <span className={waitingDot} />
        <span className={waitingDot} />
      </span>
    );
  }
  return "i";
}

export function Result({
  "aria-atomic": ariaAtomic,
  "aria-describedby": ariaDescribedby,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  "aria-live": ariaLive,
  actions,
  className,
  description,
  headingLevel = 2,
  icon,
  ref,
  role,
  status = "info",
  title,
  ...props
}: ResultProps) {
  const generatedId = useId();
  const titleId = `${generatedId}-title`;
  const descriptionId = `${generatedId}-description`;
  const resolvedIcon = icon === undefined ? getDefaultIcon(status) : icon;
  const resolvedRole = role || "status";

  return (
    <div
      {...props}
      ref={ref}
      className={className ? `${root} ${className}` : root}
      role={resolvedRole}
      aria-live={
        ariaLive !== undefined
          ? ariaLive
          : resolvedRole === "alert"
            ? "assertive"
            : resolvedRole === "status"
              ? "polite"
              : undefined
      }
      aria-atomic={
        ariaAtomic !== undefined
          ? ariaAtomic
          : resolvedRole === "status" || resolvedRole === "alert"
            ? "true"
            : undefined
      }
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel ? undefined : mergeIdReferences(titleId, ariaLabelledby)}
      aria-describedby={
        description === undefined
          ? ariaDescribedby
          : mergeIdReferences(descriptionId, ariaDescribedby)
      }
      data-meu-component="result"
      data-status={status}
    >
      {resolvedIcon !== null && resolvedIcon !== false ? (
        <div className={iconStyle({ status })} aria-hidden="true">
          {resolvedIcon}
        </div>
      ) : null}
      {createElement(`h${headingLevel}`, { className: titleStyle, id: titleId }, title)}
      {description !== undefined ? (
        <div className={descriptionStyle} id={descriptionId}>
          {description}
        </div>
      ) : null}
      {actions !== undefined ? <div className={actionsStyle}>{actions}</div> : null}
    </div>
  );
}
