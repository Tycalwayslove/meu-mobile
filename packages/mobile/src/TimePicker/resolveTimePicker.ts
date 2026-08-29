import type { ReactNode } from "react";

import type { PickerColumn } from "../Picker";
import type {
  FormatTimeValueOptions,
  TimePickerColumn,
  TimePickerColumnValue,
  TimePickerFilter,
  TimePickerHourCycle,
  TimePickerPeriod,
  TimePickerPrecision,
  TimeValue
} from "./types";

/**
 * Ordered time units from coarsest to finest precision.
 *
 * @public
 */
export const timePickerPrecisions = [
  "hour",
  "minute",
  "second"
] as const satisfies ReadonlyArray<TimePickerPrecision>;

export type TimePickerBounds = {
  max: TimeValue;
  min: TimeValue;
};

export type ResolvedTimePicker = {
  columns: Array<PickerColumn<TimePickerColumnValue>>;
  columnTypes: ReadonlyArray<TimePickerColumn>;
  time: TimeValue | null;
  values: Array<TimePickerColumnValue | null>;
};

type ResolveTimePickerOptions = {
  bounds: TimePickerBounds;
  filter?: TimePickerFilter;
  hourCycle: TimePickerHourCycle;
  hourStep?: number;
  label: (
    column: TimePickerColumn,
    value: TimePickerColumnValue,
    details: { time: TimeValue | null }
  ) => { label: ReactNode; textValue: string };
  minuteStep?: number;
  precision: TimePickerPrecision;
  secondStep?: number;
  source: TimeValue | null | undefined;
};

const defaultMin: TimeValue = { hour: 0, minute: 0, second: 0 };
const defaultMax: TimeValue = { hour: 23, minute: 59, second: 59 };

function cloneTime(value: TimeValue): TimeValue {
  return { hour: value.hour, minute: value.minute, second: value.second };
}

/**
 * Checks that a value contains integer hour, minute, and second fields in their canonical ranges.
 *
 * @public
 */
export function isValidTimeValue(value: TimeValue | null | undefined): value is TimeValue {
  return Boolean(
    value &&
    Number.isInteger(value.hour) &&
    value.hour >= 0 &&
    value.hour <= 23 &&
    Number.isInteger(value.minute) &&
    value.minute >= 0 &&
    value.minute <= 59 &&
    Number.isInteger(value.second) &&
    value.second >= 0 &&
    value.second <= 59
  );
}

function precisionIndex(precision: TimePickerPrecision) {
  return timePickerPrecisions.indexOf(precision);
}

/**
 * Returns the ordered wheel identities required by a precision and hour cycle.
 *
 * @public
 */
export function timePickerColumns(
  precision: TimePickerPrecision,
  hourCycle: TimePickerHourCycle
): ReadonlyArray<TimePickerColumn> {
  const columns: TimePickerColumn[] = timePickerPrecisions.slice(0, precisionIndex(precision) + 1);
  if (hourCycle === "h12") columns.push("period");
  return columns;
}

function normalizedStep(value: number | undefined, max: number) {
  if (value === undefined || !Number.isFinite(value)) return 1;
  return Math.max(1, Math.min(max, Math.floor(value)));
}

function valuesBetween(start: number, end: number, step: number) {
  const values: number[] = [];
  for (let value = start; value <= end; value += step) values.push(value);
  return values;
}

function normalizeLowerTime(value: TimeValue, precision: TimePickerPrecision): TimeValue {
  const next = cloneTime(value);
  const index = precisionIndex(precision);
  if (index < precisionIndex("minute")) next.minute = 0;
  if (index < precisionIndex("second")) next.second = 0;
  return next;
}

function compareTimeAtPrecision(left: TimeValue, right: TimeValue, precision: TimePickerPrecision) {
  const end = precisionIndex(precision);
  for (let index = 0; index <= end; index += 1) {
    const key = timePickerPrecisions[index]!;
    if (left[key] !== right[key]) return left[key] < right[key] ? -1 : 1;
  }
  return 0;
}

function isWithinBounds(time: TimeValue, precision: TimePickerPrecision, bounds: TimePickerBounds) {
  return (
    compareTimeAtPrecision(time, bounds.min, precision) >= 0 &&
    compareTimeAtPrecision(time, bounds.max, precision) <= 0
  );
}

function initialTime(
  source: TimeValue | null | undefined,
  bounds: TimePickerBounds,
  precision: TimePickerPrecision
) {
  if (!isValidTimeValue(source)) return normalizeLowerTime(bounds.min, precision);
  if (compareTimeAtPrecision(source, bounds.min, precision) < 0) {
    return normalizeLowerTime(bounds.min, precision);
  }
  if (compareTimeAtPrecision(source, bounds.max, precision) > 0) {
    return normalizeLowerTime(bounds.max, precision);
  }
  return normalizeLowerTime(source, precision);
}

function periodForHour(hour: number): TimePickerPeriod {
  return hour >= 12 ? "pm" : "am";
}

function hourForPeriod(hour: number, period: TimePickerPeriod) {
  const displayHour = hour % 12;
  return period === "am" ? displayHour : displayHour + 12;
}

function hourValues(period: TimePickerPeriod, hourCycle: TimePickerHourCycle, hourStep: number) {
  if (hourCycle === "h23") return valuesBetween(0, 23, hourStep);
  const start = period === "am" ? 0 : 12;
  return valuesBetween(start, start + 11, hourStep);
}

function candidateAllowed(
  time: TimeValue,
  precision: TimePickerPrecision,
  hourCycle: TimePickerHourCycle,
  bounds: TimePickerBounds,
  filter: TimePickerFilter | undefined
) {
  const currentFilter = filter && filter[precision];
  return (
    isWithinBounds(time, precision, bounds) &&
    (currentFilter
      ? currentFilter(time[precision], { hourCycle, precision, time: cloneTime(time) })
      : true)
  );
}

function periodAvailable(
  period: TimePickerPeriod,
  time: TimeValue,
  hourCycle: TimePickerHourCycle,
  hourStep: number,
  bounds: TimePickerBounds,
  filter: TimePickerFilter | undefined
) {
  return hourValues(period, hourCycle, hourStep).some((hour) =>
    candidateAllowed({ ...time, hour }, "hour", hourCycle, bounds, filter)
  );
}

export function resolveTimePickerBounds(
  min: TimeValue | undefined,
  max: TimeValue | undefined
): TimePickerBounds {
  return {
    max: isValidTimeValue(max) ? cloneTime(max) : cloneTime(defaultMax),
    min: isValidTimeValue(min) ? cloneTime(min) : cloneTime(defaultMin)
  };
}

export function resolveTimePicker({
  bounds,
  filter,
  hourCycle,
  hourStep,
  label,
  minuteStep,
  precision,
  secondStep,
  source
}: ResolveTimePickerOptions): ResolvedTimePicker {
  const resolvedHourStep = normalizedStep(hourStep, 23);
  const resolvedMinuteStep = normalizedStep(minuteStep, 59);
  const resolvedSecondStep = normalizedStep(secondStep, 59);
  const columnTypes = timePickerColumns(precision, hourCycle);
  let time = initialTime(source, bounds, precision);
  let period = periodForHour(time.hour);
  let periodOptions: PickerColumn<TimePickerColumnValue> = [];

  if (hourCycle === "h12") {
    periodOptions = (["am", "pm"] as const).map((value) => {
      const candidateTime = { ...time, hour: hourForPeriod(time.hour, value) };
      const rendered = label("period", value, { time: candidateTime });
      return {
        disabled: !periodAvailable(
          value,
          candidateTime,
          hourCycle,
          resolvedHourStep,
          bounds,
          filter
        ),
        label: rendered.label,
        textValue: rendered.textValue,
        value
      };
    });
    const selectedPeriod =
      periodOptions.find((option) => !option.disabled && option.value === period) ||
      periodOptions.find((option) => !option.disabled) ||
      null;
    if (selectedPeriod) {
      period = selectedPeriod.value as TimePickerPeriod;
      time.hour = hourForPeriod(time.hour, period);
    }
  }

  const columns: Array<PickerColumn<TimePickerColumnValue>> = [];
  const values: Array<TimePickerColumnValue | null> = [];
  const numericColumns = timePickerPrecisions.slice(0, precisionIndex(precision) + 1);

  numericColumns.forEach((column) => {
    const rawValues =
      column === "hour"
        ? hourValues(period, hourCycle, resolvedHourStep)
        : column === "minute"
          ? valuesBetween(0, 59, resolvedMinuteStep)
          : valuesBetween(0, 59, resolvedSecondStep);
    const options: PickerColumn<TimePickerColumnValue> = rawValues.map((value) => {
      const candidateTime = { ...time, [column]: value };
      const rendered = label(column, value, { time: candidateTime });
      return {
        disabled: !candidateAllowed(candidateTime, column, hourCycle, bounds, filter),
        label: rendered.label,
        textValue: rendered.textValue,
        value
      };
    });
    const selected =
      options.find((option) => !option.disabled && option.value === time[column]) ||
      options.find((option) => !option.disabled) ||
      null;
    columns.push(options);
    values.push(selected ? selected.value : null);
    if (selected) time = { ...time, [column]: selected.value as number };
  });

  if (hourCycle === "h12") {
    const selectedPeriod =
      periodOptions.find((option) => !option.disabled && option.value === period) || null;
    columns.push(periodOptions);
    values.push(selectedPeriod ? selectedPeriod.value : null);
  }

  const complete = values.length > 0 && values.every((value) => value !== null);
  return { columns, columnTypes, time: complete ? cloneTime(time) : null, values };
}

export function timeFromPickerValues(
  base: TimeValue,
  values: ReadonlyArray<TimePickerColumnValue | null>,
  precision: TimePickerPrecision,
  hourCycle: TimePickerHourCycle
) {
  const columnTypes = timePickerColumns(precision, hourCycle);
  let time = normalizeLowerTime(base, precision);
  let period: TimePickerPeriod | null = null;

  for (let index = 0; index < columnTypes.length; index += 1) {
    const column = columnTypes[index]!;
    const value = values[index];
    if (value === null || value === undefined) return null;
    if (column === "period") {
      if (value !== "am" && value !== "pm") return null;
      period = value;
    } else {
      if (typeof value !== "number") return null;
      time = { ...time, [column]: value };
    }
  }

  if (hourCycle === "h12") {
    if (!period) return null;
    time.hour = hourForPeriod(time.hour, period);
  }
  return isValidTimeValue(time) ? time : null;
}

export function sameTimeValue(
  left: TimeValue | null | undefined,
  right: TimeValue | null | undefined
) {
  if (!left || !right) return left === right;
  return left.hour === right.hour && left.minute === right.minute && left.second === right.second;
}

function padded(value: number) {
  return String(value).padStart(2, "0");
}

/**
 * Formats a valid canonical time for compact display, returning an empty string for invalid input.
 *
 * @public
 */
export function formatTimeValue(value: TimeValue, options: FormatTimeValueOptions = {}) {
  if (!isValidTimeValue(value)) return "";
  const hourCycle = options.hourCycle || "h23";
  const locale = options.locale || "en-US";
  const precision = options.precision || "minute";
  const hour = hourCycle === "h12" ? value.hour % 12 || 12 : value.hour;
  const parts = [padded(hour)];
  if (precision !== "hour") parts.push(padded(value.minute));
  if (precision === "second") parts.push(padded(value.second));
  const formatted = parts.join(":");
  if (hourCycle === "h23") return formatted;
  const period =
    value.hour >= 12 ? (locale === "zh-CN" ? "下午" : "PM") : locale === "zh-CN" ? "上午" : "AM";
  return locale === "zh-CN" ? `${period} ${formatted}` : `${formatted} ${period}`;
}
