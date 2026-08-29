"use client";

/* eslint-disable jsx-a11y/no-redundant-roles -- Safari/VoiceOver may drop list semantics after CSS removes native markers. */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions -- The focusable horizontal list handles arrows only to expose overflow; step actions remain native buttons. */

import { MeuIconCheck } from "@meu/icons-react";
import { Fragment } from "react";

import { useMeuConfig } from "../ConfigProvider";
import { VisuallyHidden } from "../internal/VisuallyHidden";
import {
  action,
  content,
  description as descriptionStyle,
  dotGlyph,
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

/**
 * Renders an ordered process indicator with optional native step buttons.
 *
 * @public
 */
export function Steps({
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  className,
  current = 0,
  direction = "horizontal",
  indicator: indicatorType = "number",
  items,
  onChange,
  onKeyDown,
  ref,
  size = "medium",
  tabIndex,
  ...props
}: StepsProps) {
  const { locale } = useMeuConfig();
  const safeCurrent = Number.isFinite(current) ? Math.trunc(current) : 0;
  const labels = statusLabels[locale];
  const resolvedLabel =
    ariaLabel !== undefined
      ? ariaLabel
      : ariaLabelledBy
        ? undefined
        : locale === "en-US"
          ? "Progress"
          : "进度";
  const interactive = Boolean(onChange);
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
      aria-labelledby={ariaLabel !== undefined ? undefined : ariaLabelledBy}
      role="list"
      tabIndex={tabIndex !== undefined ? tabIndex : direction === "horizontal" ? 0 : undefined}
      onKeyDown={(event) => {
        if (onKeyDown) onKeyDown(event);
        if (
          event.defaultPrevented ||
          direction !== "horizontal" ||
          event.target !== event.currentTarget ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          (event.key !== "ArrowLeft" && event.key !== "ArrowRight")
        ) {
          return;
        }
        event.preventDefault();
        const distance = Math.max(48, Math.round(event.currentTarget.clientWidth * 0.8));
        event.currentTarget.scrollLeft += event.key === "ArrowRight" ? distance : -distance;
      }}
      data-meu-component="steps"
      data-direction={direction}
      data-indicator={indicatorType}
      data-interactive={interactive ? "true" : "false"}
      data-size={size}
    >
      {items.map((item, index) => {
        const status = resolveStatus(index, item.status);
        const isCurrent = index === safeCurrent;
        const defaultIcon =
          indicatorType === "dot" ? (
            <span className={dotGlyph} data-step-dot="true" />
          ) : status === "finish" ? (
            <MeuIconCheck size={size === "small" ? 14 : 18} strokeWidth={2.25} />
          ) : status === "error" ? (
            "!"
          ) : (
            index + 1
          );
        const itemContent = (
          <Fragment>
            <span className={indicator({ size, status })} aria-hidden="true">
              {item.icon !== undefined && item.icon !== null ? item.icon : defaultIcon}
            </span>
            <div className={content({ direction, size })}>
              <div className={titleStyle({ size })}>
                <VisuallyHidden>{labels[status]}：</VisuallyHidden>
                {item.title}
              </div>
              {item.description !== undefined && item.description !== null ? (
                <div className={descriptionStyle({ size })}>{item.description}</div>
              ) : null}
            </div>
          </Fragment>
        );
        return (
          <li
            className={step({ direction, size, status })}
            aria-current={isCurrent ? "step" : undefined}
            data-disabled={interactive && item.disabled ? "true" : "false"}
            data-status={status}
            data-last={index === items.length - 1 ? "true" : "false"}
            key={item.key !== undefined ? item.key : index}
          >
            {interactive ? (
              <button
                aria-label={item.ariaLabel ? `${labels[status]}：${item.ariaLabel}` : undefined}
                className={action({ direction, size })}
                data-step-index={index}
                disabled={Boolean(item.disabled || isCurrent)}
                type="button"
                onClick={(event) => {
                  if (!isCurrent && !item.disabled && onChange) onChange(index, event);
                }}
              >
                {itemContent}
              </button>
            ) : (
              <div className={action({ direction, size })}>{itemContent}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
