"use client";

import { useState } from "react";

import { useMeuConfig } from "../ConfigProvider";
import { useControllableOpen } from "../internal/useControllableOpen";
import { Picker } from "../Picker";
import type { PickerOpenChangeDetails } from "../Picker";
import {
  resolveTimePicker,
  resolveTimePickerBounds,
  sameTimeValue,
  timeFromPickerValues
} from "./resolveTimePicker";
import type {
  TimePickerColumn,
  TimePickerColumnValue,
  TimePickerHourCycle,
  TimePickerProps,
  TimePickerPrecision,
  TimeValue
} from "./types";

const defaultColumnLabels = {
  "en-US": { hour: "Hour", minute: "Minute", period: "Period", second: "Second" },
  "zh-CN": { hour: "时", minute: "分", period: "时段", second: "秒" }
} as const;

function padded(value: number) {
  return String(value).padStart(2, "0");
}

function defaultLabel(
  column: TimePickerColumn,
  value: TimePickerColumnValue,
  hourCycle: TimePickerHourCycle,
  locale: "en-US" | "zh-CN"
) {
  if (column === "period") {
    if (locale === "en-US") return value === "pm" ? "PM" : "AM";
    return value === "pm" ? "下午" : "上午";
  }
  const numericValue = value as number;
  const displayValue =
    column === "hour" && hourCycle === "h12" ? numericValue % 12 || 12 : numericValue;
  if (locale === "en-US") return padded(displayValue);
  if (column === "hour") return `${padded(displayValue)}时`;
  if (column === "minute") return `${padded(displayValue)}分`;
  return `${padded(displayValue)}秒`;
}

type TimePickerState = {
  committedValue: TimeValue | null;
  draftValue: TimeValue | null;
  filter: TimePickerProps["filter"];
  hourCycle: TimePickerHourCycle;
  hourStep: number | undefined;
  max: TimeValue | undefined;
  min: TimeValue | undefined;
  minuteStep: number | undefined;
  open: boolean;
  precision: TimePickerPrecision;
  secondStep: number | undefined;
  valueSnapshot: TimeValue | null | undefined;
};

/**
 * Renders a confirmation-based time-of-day wheel with 12- or 24-hour presentation.
 *
 * @public
 */
export function TimePicker({
  columnLabels,
  defaultOpen = false,
  defaultValue,
  filter,
  hourCycle = "h23",
  hourStep,
  max,
  min,
  minuteStep,
  onConfirm,
  onOpenChange,
  onSelect,
  open,
  precision = "minute",
  renderLabel,
  secondStep,
  value,
  ...pickerProps
}: TimePickerProps) {
  const config = useMeuConfig();
  const bounds = resolveTimePickerBounds(min, max);
  const controlledValue = value !== undefined;
  const [resolvedOpen, requestOpenChange] = useControllableOpen<PickerOpenChangeDetails>({
    defaultOpen,
    onOpenChange,
    open
  });
  const label = (
    column: TimePickerColumn,
    nextValue: TimePickerColumnValue,
    details: { time: TimeValue | null }
  ) => {
    const fallback = defaultLabel(column, nextValue, hourCycle, config.locale);
    const rendered = renderLabel
      ? renderLabel(column, nextValue, {
          column,
          hourCycle,
          locale: config.locale,
          time: details.time
        })
      : fallback;
    return {
      label: rendered,
      textValue:
        typeof rendered === "string" || typeof rendered === "number" ? String(rendered) : fallback
    };
  };
  const resolve = (source: TimeValue | null | undefined) =>
    resolveTimePicker({
      bounds,
      hourCycle,
      label,
      precision,
      source,
      ...(filter ? { filter } : {}),
      ...(hourStep === undefined ? {} : { hourStep }),
      ...(minuteStep === undefined ? {} : { minuteStep }),
      ...(secondStep === undefined ? {} : { secondStep })
    });
  const [storedState, setStoredState] = useState<TimePickerState>(() => {
    const initial = resolve(controlledValue ? value : defaultValue);
    return {
      committedValue: initial.time,
      draftValue: initial.time,
      filter,
      hourCycle,
      hourStep,
      max,
      min,
      minuteStep,
      open: resolvedOpen,
      precision,
      secondStep,
      valueSnapshot: controlledValue ? value : undefined
    };
  });
  let pickerState = storedState;
  const openChanged = pickerState.open !== resolvedOpen;
  const valueModeChanged = (pickerState.valueSnapshot !== undefined) !== controlledValue;
  const controlledValueChanged =
    controlledValue &&
    !sameTimeValue(pickerState.valueSnapshot, value === undefined ? null : value);
  const inputsChanged =
    pickerState.filter !== filter ||
    pickerState.hourCycle !== hourCycle ||
    pickerState.hourStep !== hourStep ||
    pickerState.max !== max ||
    pickerState.min !== min ||
    pickerState.minuteStep !== minuteStep ||
    pickerState.precision !== precision ||
    pickerState.secondStep !== secondStep;

  if (openChanged || valueModeChanged || controlledValueChanged || inputsChanged) {
    let committedValue = pickerState.committedValue;
    let draftValue = pickerState.draftValue;
    if (inputsChanged) committedValue = resolve(controlledValue ? value : committedValue).time;
    if (controlledValue && (controlledValueChanged || inputsChanged)) {
      committedValue = resolve(value).time;
    }
    if (resolvedOpen) {
      if (!pickerState.open || valueModeChanged || controlledValueChanged) {
        draftValue = resolve(controlledValue ? value : committedValue).time;
      } else if (inputsChanged) {
        draftValue = resolve(draftValue).time;
      }
    }
    pickerState = {
      committedValue,
      draftValue,
      filter,
      hourCycle,
      hourStep,
      max,
      min,
      minuteStep,
      open: resolvedOpen,
      precision,
      secondStep,
      valueSnapshot: controlledValue ? value : undefined
    };
    setStoredState(pickerState);
  }

  const resolved = resolve(pickerState.draftValue);
  const resolvedColumnLabels = resolved.columnTypes.map(
    (column) =>
      (columnLabels && columnLabels[column]) ||
      (defaultColumnLabels[config.locale] as Record<TimePickerColumn, string>)[column]
  );

  return (
    <Picker<TimePickerColumnValue>
      {...pickerProps}
      data-meu-component="time-picker"
      columnLabels={resolvedColumnLabels}
      columns={resolved.columns}
      open={resolvedOpen}
      value={resolved.values}
      onConfirm={(nextValues) => {
        const base = resolved.time || pickerState.draftValue || bounds.min;
        const nextSource = timeFromPickerValues(base, nextValues, precision, hourCycle);
        const next = resolve(nextSource);
        if (!next.time) return;
        if (!controlledValue) {
          setStoredState({
            ...pickerState,
            committedValue: next.time,
            draftValue: next.time
          });
        }
        if (onConfirm) onConfirm(next.time);
      }}
      onOpenChange={(nextOpen, details) => requestOpenChange(nextOpen, details)}
      onSelect={(nextValues, _options, details) => {
        const base = resolved.time || pickerState.draftValue || bounds.min;
        const nextSource = timeFromPickerValues(base, nextValues, precision, hourCycle);
        const next = resolve(nextSource);
        setStoredState({ ...pickerState, draftValue: next.time });
        if (next.time && onSelect) {
          onSelect(next.time, {
            ...details,
            column: resolved.columnTypes[details.columnIndex]!
          });
        }
      }}
    />
  );
}
