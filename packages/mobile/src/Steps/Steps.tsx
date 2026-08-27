"use client";

import { MeuIconCheck } from "@meu/icons-react";

import { useMeuConfig } from "../ConfigProvider";
import { VisuallyHidden } from "../internal/VisuallyHidden";
import {
  content,
  description as descriptionStyle,
  indicator,
  root,
  step,
  title as titleStyle
} from "./Steps.css";
import type { StepStatus, StepsProps } from "./types";

const statusLabels = {
  "zh-CN": { wait: "未开始", process: "进行中", finish: "已完成", error: "有错误" },
  "en-US": { wait: "Not started", process: "In progress", finish: "Completed", error: "Error" }
} as const;

export function Steps({
  "aria-label": ariaLabel,
  className,
  current = 0,
  direction = "horizontal",
  items,
  ref,
  ...props
}: StepsProps) {
  const { locale } = useMeuConfig();
  const safeCurrent = Number.isFinite(current) ? Math.trunc(current) : 0;
  const labels = statusLabels[locale];
  const resolvedLabel = ariaLabel || (locale === "en-US" ? "Progress" : "进度");
  const classes = root({ direction });

  function resolveStatus(index: number, explicitStatus: StepStatus | undefined): StepStatus {
    if (explicitStatus) return explicitStatus;
    if (index < safeCurrent) return "finish";
    if (index === safeCurrent) return "process";
    return "wait";
  }

  return (
    <ol
      {...props}
      ref={ref}
      className={className ? `${classes} ${className}` : classes}
      aria-label={resolvedLabel}
      data-meu-component="steps"
      data-direction={direction}
    >
      {items.map((item, index) => {
        const status = resolveStatus(index, item.status);
        const defaultIcon =
          status === "finish" ? (
            <MeuIconCheck size={18} strokeWidth={2.25} />
          ) : status === "error" ? (
            "!"
          ) : (
            index + 1
          );
        return (
          <li
            className={step({ direction, status })}
            aria-current={index === safeCurrent ? "step" : undefined}
            data-status={status}
            data-last={index === items.length - 1 ? "true" : "false"}
            key={index}
          >
            <span className={indicator({ status })} aria-hidden="true">
              {item.icon !== undefined && item.icon !== null ? item.icon : defaultIcon}
            </span>
            <div className={content({ direction })}>
              <div className={titleStyle}>
                <VisuallyHidden>{labels[status]}：</VisuallyHidden>
                {item.title}
              </div>
              {item.description !== undefined && item.description !== null ? (
                <div className={descriptionStyle}>{item.description}</div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
