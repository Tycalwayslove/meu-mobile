import type { DateAdapter, DateParts, DatePrecision } from "@meu/date-adapter";
import type { ReactNode } from "react";

import type { PickerColumn } from "../Picker";
import type { DatePickerFilter } from "./types";

/**
 * Date-picker column order from coarsest to finest precision.
 *
 * @public
 */
export const datePickerPrecisions = [
  "year",
  "month",
  "day",
  "hour",
  "minute",
  "second"
] as const satisfies ReadonlyArray<DatePrecision>;

export type DatePickerBounds<TDate> = {
  max: TDate;
  min: TDate;
};

export type ResolvedDatePicker<TDate> = {
  columns: Array<PickerColumn<number>>;
  date: TDate | null;
  precisions: ReadonlyArray<DatePrecision>;
  values: Array<number | null>;
};

type ResolveDatePickerOptions<TDate> = {
  adapter: DateAdapter<TDate>;
  bounds: DatePickerBounds<TDate>;
  filter?: DatePickerFilter<TDate>;
  label: (
    precision: DatePrecision,
    value: number,
    details: { date: TDate | null; parts: DateParts }
  ) => ReactNode;
  minuteStep?: number;
  precision: DatePrecision;
  secondStep?: number;
  source: TDate | null | undefined;
  textLabel: (precision: DatePrecision, value: number) => string;
};

function precisionIndex(precision: DatePrecision) {
  return datePickerPrecisions.indexOf(precision);
}

function normalizedStep(value: number | undefined) {
  if (value === undefined || !Number.isFinite(value)) return 1;
  return Math.max(1, Math.min(59, Math.floor(value)));
}

function stepForPrecision(precision: DatePrecision, minuteStep: number, secondStep: number) {
  if (precision === "minute") return minuteStep;
  if (precision === "second") return secondStep;
  return 1;
}

function valuesBetween(start: number, end: number, step = 1) {
  const values: number[] = [];
  for (let value = start; value <= end; value += step) values.push(value);
  return values;
}

function valuesForPrecision(
  precision: DatePrecision,
  parts: DateParts,
  minParts: DateParts,
  maxParts: DateParts,
  adapter: DateAdapter<unknown>,
  minuteStep: number,
  secondStep: number
) {
  switch (precision) {
    case "year":
      return valuesBetween(minParts.year, maxParts.year);
    case "month":
      return valuesBetween(1, 12);
    case "day":
      return valuesBetween(1, adapter.getDaysInMonth({ month: parts.month, year: parts.year }));
    case "hour":
      return valuesBetween(0, 23);
    case "minute":
      return valuesBetween(0, 59, minuteStep);
    case "second":
      return valuesBetween(0, 59, secondStep);
  }
  return [];
}

function setPrecisionPart(
  parts: DateParts,
  precision: DatePrecision,
  value: number,
  adapter: DateAdapter<unknown>
) {
  const next = { ...parts, [precision]: value };
  if (precision === "year" || precision === "month" || precision === "day") {
    next.day = Math.min(next.day, adapter.getDaysInMonth({ month: next.month, year: next.year }));
  }
  return next;
}

function normalizeLowerParts(parts: DateParts, precision: DatePrecision) {
  const next = { ...parts, millisecond: 0 };
  const index = precisionIndex(precision);
  if (index < precisionIndex("month")) next.month = 1;
  if (index < precisionIndex("day")) next.day = 1;
  if (index < precisionIndex("hour")) next.hour = 0;
  if (index < precisionIndex("minute")) next.minute = 0;
  if (index < precisionIndex("second")) next.second = 0;
  return next;
}

function alignDateBound<TDate>(
  adapter: DateAdapter<TDate>,
  bound: TDate,
  precision: DatePrecision,
  step: number,
  direction: "ceil" | "floor"
) {
  const parts = normalizeLowerParts(adapter.getParts(bound), precision);
  if (precision === "minute" || precision === "second") {
    parts[precision] = Math.floor(parts[precision] / step) * step;
  }
  let candidate = adapter.fromParts(parts);
  if (candidate === null) return bound;
  if (direction === "ceil" && adapter.compare(candidate, bound) < 0) {
    candidate = adapter.add(candidate, step, precision);
  }
  return candidate;
}

function comparePartsAtPrecision(left: DateParts, right: DateParts, precision: DatePrecision) {
  const end = precisionIndex(precision);
  for (let index = 0; index <= end; index += 1) {
    const key = datePickerPrecisions[index]!;
    if (left[key] !== right[key]) return left[key] < right[key] ? -1 : 1;
  }
  return 0;
}

function isWithinBounds<TDate>(
  parts: DateParts,
  currentPrecision: DatePrecision,
  terminalPrecision: DatePrecision,
  minParts: DateParts,
  maxParts: DateParts,
  candidate: TDate | null,
  adapter: DateAdapter<TDate>,
  bounds: DatePickerBounds<TDate>
) {
  if (currentPrecision === terminalPrecision) {
    return (
      candidate !== null &&
      adapter.compare(candidate, bounds.min) >= 0 &&
      adapter.compare(candidate, bounds.max) <= 0
    );
  }
  return (
    comparePartsAtPrecision(parts, minParts, currentPrecision) >= 0 &&
    comparePartsAtPrecision(parts, maxParts, currentPrecision) <= 0
  );
}

function initialDate<TDate>(
  adapter: DateAdapter<TDate>,
  source: TDate | null | undefined,
  bounds: DatePickerBounds<TDate>
) {
  if (source === null || source === undefined || !adapter.isValid(source)) return bounds.min;
  if (adapter.compare(source, bounds.min) < 0) return bounds.min;
  if (adapter.compare(source, bounds.max) > 0) return bounds.max;
  return source;
}

export function resolveDatePickerBounds<TDate>(
  adapter: DateAdapter<TDate>,
  anchor: TDate,
  min: TDate | undefined,
  max: TDate | undefined
): DatePickerBounds<TDate> {
  const anchorParts = adapter.getParts(anchor);
  const defaultMinCandidate = adapter.fromParts({
    day: 1,
    hour: 0,
    millisecond: 0,
    minute: 0,
    month: 1,
    second: 0,
    year: anchorParts.year - 10
  });
  const defaultMin =
    defaultMinCandidate === null ? adapter.add(anchor, -10, "year") : defaultMinCandidate;
  const defaultMaxCandidate = adapter.fromParts({
    day: 31,
    hour: 23,
    millisecond: 999,
    minute: 59,
    month: 12,
    second: 59,
    year: anchorParts.year + 10
  });
  const defaultMax =
    defaultMaxCandidate === null ? adapter.add(anchor, 10, "year") : defaultMaxCandidate;
  return {
    max: max !== undefined && adapter.isValid(max) ? max : defaultMax,
    min: min !== undefined && adapter.isValid(min) ? min : defaultMin
  };
}

export function resolveDatePicker<TDate>({
  adapter,
  bounds,
  filter,
  label,
  minuteStep,
  precision,
  secondStep,
  source,
  textLabel
}: ResolveDatePickerOptions<TDate>): ResolvedDatePicker<TDate> {
  const resolvedMinuteStep = normalizedStep(minuteStep);
  const resolvedSecondStep = normalizedStep(secondStep);
  const boundStep = stepForPrecision(precision, resolvedMinuteStep, resolvedSecondStep);
  const effectiveBounds = {
    max: alignDateBound(adapter, bounds.max, precision, boundStep, "floor"),
    min: alignDateBound(adapter, bounds.min, precision, boundStep, "ceil")
  };
  const minParts = adapter.getParts(effectiveBounds.min);
  const maxParts = adapter.getParts(effectiveBounds.max);
  const precisions = datePickerPrecisions.slice(0, precisionIndex(precision) + 1);
  const columns: Array<PickerColumn<number>> = [];
  const values: Array<number | null> = [];
  let parts = normalizeLowerParts(
    adapter.getParts(initialDate(adapter, source, effectiveBounds)),
    precision
  );
  const genericAdapter = adapter as DateAdapter<unknown>;

  precisions.forEach((currentPrecision) => {
    const rawValues = valuesForPrecision(
      currentPrecision,
      parts,
      minParts,
      maxParts,
      genericAdapter,
      resolvedMinuteStep,
      resolvedSecondStep
    );
    const options = rawValues.map((value) => {
      const candidateParts = setPrecisionPart(parts, currentPrecision, value, genericAdapter);
      const candidate = adapter.fromParts(candidateParts);
      const details = { date: candidate, parts: candidateParts, precision: currentPrecision };
      const currentFilter = filter && filter[currentPrecision];
      const allowedByFilter = currentFilter ? currentFilter(value, details) : true;
      const renderedLabel = label(currentPrecision, value, {
        date: candidate,
        parts: candidateParts
      });
      return {
        disabled:
          !candidate ||
          !isWithinBounds(
            candidateParts,
            currentPrecision,
            precision,
            minParts,
            maxParts,
            candidate,
            adapter,
            effectiveBounds
          ) ||
          !allowedByFilter,
        label: renderedLabel,
        textValue:
          typeof renderedLabel === "string" || typeof renderedLabel === "number"
            ? String(renderedLabel)
            : textLabel(currentPrecision, value),
        value
      };
    });
    const currentValue = parts[currentPrecision];
    const selected =
      options.find((option) => !option.disabled && option.value === currentValue) ||
      options.find((option) => !option.disabled) ||
      null;
    columns.push(options);
    values.push(selected ? selected.value : null);
    if (selected) {
      parts = setPrecisionPart(parts, currentPrecision, selected.value, genericAdapter);
    }
  });

  const complete = values.length > 0 && values.every((value) => value !== null);
  const date = complete ? adapter.fromParts(parts) : null;
  return { columns, date, precisions, values };
}

export function dateFromPickerValues<TDate>(
  adapter: DateAdapter<TDate>,
  base: TDate,
  values: ReadonlyArray<number | null>,
  precision: DatePrecision
) {
  let parts = normalizeLowerParts(adapter.getParts(base), precision);
  const genericAdapter = adapter as DateAdapter<unknown>;
  const precisions = datePickerPrecisions.slice(0, precisionIndex(precision) + 1);
  for (let index = 0; index < precisions.length; index += 1) {
    const value = values[index];
    if (value === null || value === undefined) return null;
    parts = setPrecisionPart(parts, precisions[index]!, value, genericAdapter);
  }
  return adapter.fromParts(parts);
}

export function sameDateValue<TDate>(
  adapter: DateAdapter<TDate>,
  left: TDate | null | undefined,
  right: TDate | null | undefined
) {
  if (left === null || left === undefined || right === null || right === undefined) {
    return left === right;
  }
  if (!adapter.isValid(left) || !adapter.isValid(right)) return left === right;
  return adapter.compare(left, right) === 0;
}
