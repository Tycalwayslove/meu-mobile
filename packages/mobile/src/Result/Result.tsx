"use client";

import { MeuIconCheck, MeuIconX } from "@meu/icons-react";
import { Children, createElement, useId } from "react";

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

function hasRenderableContent(value: ResultProps["actions"]): boolean {
  return value !== "" && Children.toArray(value).length > 0;
}

function normalizeHeadingLevel(value: ResultProps["headingLevel"]): 1 | 2 | 3 | 4 | 5 | 6 {
  if (typeof value !== "number" || !Number.isFinite(value)) return 2;
  return Math.min(6, Math.max(1, Math.trunc(value))) as 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * Renders a semantic outcome state with optional description and actions.
 *
 * @public
 */
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
  const resolvedHeadingLevel = normalizeHeadingLevel(headingLevel);
  const hasDescription = hasRenderableContent(description);
  const hasIcon = hasRenderableContent(resolvedIcon);
  const hasActions = hasRenderableContent(actions);

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
        !hasDescription ? ariaDescribedby : mergeIdReferences(descriptionId, ariaDescribedby)
      }
      data-meu-component="result"
      data-status={status}
    >
      {hasIcon ? (
        <div className={iconStyle({ status })} aria-hidden="true">
          {resolvedIcon}
        </div>
      ) : null}
      {createElement(`h${resolvedHeadingLevel}`, { className: titleStyle, id: titleId }, title)}
      {hasDescription ? (
        <div className={descriptionStyle} id={descriptionId}>
          {description}
        </div>
      ) : null}
      {hasActions ? <div className={actionsStyle}>{actions}</div> : null}
    </div>
  );
}
