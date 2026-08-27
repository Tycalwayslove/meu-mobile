"use client";

import { MeuIconCheck, MeuIconX } from "@meu/icons-react";
import { useId } from "react";

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

function getDefaultIcon(status: ResultStatus) {
  if (status === "success") return <MeuIconCheck size={28} strokeWidth={2.25} />;
  if (status === "error") return <MeuIconX size={28} strokeWidth={2.25} />;
  if (status === "warning") return "!";
  if (status === "waiting") {
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
  "aria-describedby": ariaDescribedby,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  actions,
  className,
  description,
  icon,
  ref,
  role = "status",
  status = "info",
  title,
  ...props
}: ResultProps) {
  const generatedId = useId();
  const titleId = `${generatedId}-title`;
  const descriptionId = `${generatedId}-description`;
  const resolvedIcon = icon === undefined ? getDefaultIcon(status) : icon;

  return (
    <div
      {...props}
      ref={ref}
      className={className ? `${root} ${className}` : root}
      role={role}
      aria-atomic={role === "status" ? "true" : undefined}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel ? undefined : ariaLabelledby || titleId}
      aria-describedby={
        description === undefined ? ariaDescribedby : ariaDescribedby || descriptionId
      }
      data-meu-component="result"
      data-status={status}
    >
      {resolvedIcon !== null && resolvedIcon !== false ? (
        <div className={iconStyle({ status })} aria-hidden="true">
          {resolvedIcon}
        </div>
      ) : null}
      <div className={titleStyle} id={titleId}>
        {title}
      </div>
      {description !== undefined ? (
        <div className={descriptionStyle} id={descriptionId}>
          {description}
        </div>
      ) : null}
      {actions !== undefined ? <div className={actionsStyle}>{actions}</div> : null}
    </div>
  );
}
