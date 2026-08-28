"use client";

import type { CSSProperties } from "react";

import { useMeuConfig } from "../ConfigProvider";
import {
  fill,
  header,
  label as labelStyle,
  root,
  track,
  value as valueStyle
} from "./Progress.css";
import type { ProgressProps } from "./types";

type ProgressStyle = CSSProperties & { "--meu-progress-scale"?: number };

function clampValue(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

export function Progress({
  "aria-atomic": ariaAtomic,
  "aria-label": ariaLabel,
  "aria-live": ariaLive,
  "aria-valuetext": ariaValueText,
  announce = false,
  className,
  formatValue,
  indeterminate = false,
  label,
  ref,
  showValue = false,
  size = "medium",
  style,
  tone = "accent",
  value = 0,
  valueText,
  ...props
}: ProgressProps) {
  const { locale } = useMeuConfig();
  const safeValue = clampValue(value);
  const visibleValue = formatValue ? formatValue(safeValue) : `${Math.round(safeValue)}%`;
  const resolvedLabel =
    ariaLabel || (typeof label === "string" ? label : locale === "en-US" ? "Progress" : "任务进度");
  const resolvedStyle: ProgressStyle = { ...style, "--meu-progress-scale": safeValue / 100 };
  const state = indeterminate ? "indeterminate" : "determinate";

  return (
    <div
      {...props}
      ref={ref}
      className={className ? `${root} ${className}` : root}
      style={resolvedStyle}
      role="progressbar"
      aria-label={resolvedLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : safeValue}
      aria-valuetext={
        indeterminate ? undefined : valueText !== undefined ? valueText : ariaValueText
      }
      aria-live={ariaLive !== undefined ? ariaLive : announce ? "polite" : undefined}
      aria-atomic={ariaAtomic !== undefined ? ariaAtomic : announce ? "true" : undefined}
      data-meu-component="progress"
      data-size={size}
      data-state={state}
      data-tone={tone}
    >
      {label !== undefined || showValue ? (
        <div className={header}>
          {label !== undefined ? <span className={labelStyle}>{label}</span> : <span />}
          {showValue && !indeterminate ? <span className={valueStyle}>{visibleValue}</span> : null}
        </div>
      ) : null}
      <div className={track({ size })} aria-hidden="true">
        <div className={fill({ state, tone })} />
      </div>
    </div>
  );
}
