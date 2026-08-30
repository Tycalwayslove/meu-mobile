"use client";

import { nativeDateAdapter } from "@meu/date-adapter";
import type { DateAdapter, DateParts, DatePrecision } from "@meu/date-adapter";
import { useMemo, useState } from "react";

import { useMeuConfig } from "../ConfigProvider";
import { useControllableOpen } from "../internal/useControllableOpen";
import { Picker } from "../Picker";
import type { PickerOpenChangeDetails } from "../Picker";
import {
  dateFromPickerValues,
  resolveDatePicker,
  resolveDatePickerBounds,
  sameDateValue
} from "./resolveDatePicker";
import type { DatePickerProps } from "./types";

const defaultColumnLabels = {
  "en-US": {
    day: "Day",
    hour: "Hour",
    minute: "Minute",
    month: "Month",
    second: "Second",
    year: "Year"
  },
  "zh-CN": {
    day: "日",
    hour: "时",
    minute: "分",
    month: "月",
    second: "秒",
    year: "年"
  }
} as const;

function padded(value: number) {
  return String(value).padStart(2, "0");
}

function defaultLabel(precision: DatePrecision, value: number, locale: "en-US" | "zh-CN") {
  if (locale === "en-US") return precision === "year" ? String(value) : padded(value);
  switch (precision) {
    case "year":
      return `${value}年`;
    case "month":
      return `${value}月`;
    case "day":
      return `${value}日`;
    case "hour":
      return `${padded(value)}时`;
    case "minute":
      return `${padded(value)}分`;
    case "second":
      return `${padded(value)}秒`;
  }
}

type DatePickerState<TDate> = {
  adapter: DateAdapter<TDate>;
  committedValue: TDate | null;
  draftValue: TDate | null;
  filter: DatePickerProps<TDate>["filter"];
  max: TDate | undefined;
  min: TDate | undefined;
  minuteStep: number | undefined;
  open: boolean;
  precision: DatePrecision;
  secondStep: number | undefined;
  valueSnapshot: TDate | null | undefined;
};

/**
 * Renders a confirmation-based date wheel backed by a pluggable DateAdapter.
 *
 * @public
 */
export function DatePicker<TDate = Date>({
  adapter,
  columnLabels,
  defaultOpen = false,
  defaultValue,
  filter,
  max,
  min,
  minuteStep,
  onConfirm,
  onOpenChange,
  onSelect,
  open,
  precision = "day",
  renderLabel,
  secondStep,
  value,
  ...pickerProps
}: DatePickerProps<TDate>) {
  const config = useMeuConfig();
  const resolvedAdapter = (adapter || nativeDateAdapter) as DateAdapter<TDate>;
  const anchor = useMemo(() => resolvedAdapter.now(), [resolvedAdapter]);
  const bounds = resolveDatePickerBounds(resolvedAdapter, anchor, min, max);
  const controlledValue = value !== undefined;
  const [resolvedOpen, requestOpenChange] = useControllableOpen<PickerOpenChangeDetails>({
    defaultOpen,
    onOpenChange,
    open
  });
  const textLabel = (currentPrecision: DatePrecision, nextValue: number) =>
    defaultLabel(currentPrecision, nextValue, config.locale);
  const label = renderLabel
    ? (
        currentPrecision: DatePrecision,
        nextValue: number,
        details: { date: TDate | null; parts: DateParts }
      ) =>
        renderLabel(currentPrecision, nextValue, {
          ...details,
          locale: config.locale,
          precision: currentPrecision
        })
    : textLabel;
  const resolve = (source: TDate | null | undefined) =>
    resolveDatePicker({
      adapter: resolvedAdapter,
      bounds,
      label,
      precision,
      source,
      textLabel,
      ...(filter ? { filter } : {}),
      ...(minuteStep === undefined ? {} : { minuteStep }),
      ...(secondStep === undefined ? {} : { secondStep })
    });
  const [storedState, setStoredState] = useState<DatePickerState<TDate>>(() => {
    const initial = resolve(controlledValue ? value : defaultValue);
    return {
      adapter: resolvedAdapter,
      committedValue: initial.date,
      draftValue: initial.date,
      filter,
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
  const adapterChanged = pickerState.adapter !== resolvedAdapter;
  const openChanged = pickerState.open !== resolvedOpen;
  const valueModeChanged = (pickerState.valueSnapshot !== undefined) !== controlledValue;
  const controlledValueChanged =
    controlledValue &&
    !sameDateValue(resolvedAdapter, pickerState.valueSnapshot, value === undefined ? null : value);
  const inputsChanged =
    adapterChanged ||
    pickerState.filter !== filter ||
    pickerState.max !== max ||
    pickerState.min !== min ||
    pickerState.minuteStep !== minuteStep ||
    pickerState.precision !== precision ||
    pickerState.secondStep !== secondStep;

  if (openChanged || valueModeChanged || controlledValueChanged || inputsChanged) {
    let committedValue = pickerState.committedValue;
    let draftValue = pickerState.draftValue;
    if (adapterChanged) {
      committedValue = resolve(controlledValue ? value : committedValue).date;
    }
    if (controlledValue && (controlledValueChanged || adapterChanged || inputsChanged)) {
      committedValue = resolve(value).date;
    }
    if (resolvedOpen) {
      if (!pickerState.open || valueModeChanged || controlledValueChanged) {
        draftValue = resolve(controlledValue ? value : committedValue).date;
      } else if (inputsChanged) {
        draftValue = resolve(draftValue).date;
      }
    }
    pickerState = {
      adapter: resolvedAdapter,
      committedValue,
      draftValue,
      filter,
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
  const resolvedColumnLabels = resolved.precisions.map(
    (currentPrecision) =>
      (columnLabels && columnLabels[currentPrecision]) ||
      (defaultColumnLabels[config.locale] as Record<DatePrecision, string>)[currentPrecision]
  );

  return (
    <Picker<number>
      {...pickerProps}
      data-meu-component="date-picker"
      columnLabels={resolvedColumnLabels}
      columns={resolved.columns}
      open={resolvedOpen}
      value={resolved.values}
      onConfirm={(nextValues) => {
        const base = resolved.date || pickerState.draftValue || bounds.min;
        const nextSource = dateFromPickerValues(resolvedAdapter, base, nextValues, precision);
        const next = resolve(nextSource);
        if (!next.date) return;
        if (!controlledValue) {
          setStoredState({
            ...pickerState,
            committedValue: next.date,
            draftValue: next.date
          });
        }
        if (onConfirm) onConfirm(next.date);
      }}
      onOpenChange={(nextOpen, details) => requestOpenChange(nextOpen, details)}
      onSelect={(nextValues, _options, details) => {
        const base = resolved.date || pickerState.draftValue || bounds.min;
        const nextSource = dateFromPickerValues(resolvedAdapter, base, nextValues, precision);
        const next = resolve(nextSource);
        setStoredState({ ...pickerState, draftValue: next.date });
        if (next.date && onSelect) {
          onSelect(next.date, {
            ...details,
            precision: resolved.precisions[details.columnIndex]!
          });
        }
      }}
    />
  );
}
