import type { DateAdapter, DateParts } from "@meu/date-adapter";

import type {
  CalendarRange,
  CalendarSelectionMode,
  CalendarValue,
  CalendarWeekStartsOn
} from "./types";

export type CalendarGridDay<TDate> = {
  date: TDate;
  key: string;
  outside: boolean;
};

function padded(value: number) {
  return String(value).padStart(2, "0");
}

/**
 * Creates a stable `YYYY-MM-DD` key from an adapter value.
 *
 * @public
 */
export function calendarDayKey<TDate>(adapter: DateAdapter<TDate>, value: TDate) {
  const parts = adapter.getParts(value);
  return `${parts.year}-${padded(parts.month)}-${padded(parts.day)}`;
}

/**
 * Normalizes a valid adapter value to the start of its day.
 *
 * @public
 */
export function normalizeCalendarDay<TDate>(adapter: DateAdapter<TDate>, value: TDate) {
  if (!adapter.isValid(value)) return null;
  const normalized = adapter.startOf(value, "day");
  return adapter.isValid(normalized) ? normalized : null;
}

/**
 * Normalizes a valid adapter value to the start of its month.
 *
 * @public
 */
export function normalizeCalendarMonth<TDate>(adapter: DateAdapter<TDate>, value: TDate) {
  if (!adapter.isValid(value)) return null;
  const normalized = adapter.startOf(value, "month");
  return adapter.isValid(normalized) ? normalized : null;
}

/**
 * Compares two adapter values at calendar-day precision.
 *
 * @public
 */
export function compareCalendarDays<TDate>(adapter: DateAdapter<TDate>, left: TDate, right: TDate) {
  const normalizedLeft = normalizeCalendarDay(adapter, left);
  const normalizedRight = normalizeCalendarDay(adapter, right);
  if (normalizedLeft === null || normalizedRight === null) return 0;
  return adapter.compare(normalizedLeft, normalizedRight);
}

/**
 * Tests whether two optional adapter values represent the same valid day.
 *
 * @public
 */
export function sameCalendarDay<TDate>(
  adapter: DateAdapter<TDate>,
  left: TDate | null | undefined,
  right: TDate | null | undefined
) {
  if (
    left === null ||
    left === undefined ||
    right === null ||
    right === undefined ||
    !adapter.isValid(left) ||
    !adapter.isValid(right)
  )
    return false;
  return compareCalendarDays(adapter, left, right) === 0;
}

/**
 * Tests whether two adapter values share a calendar year and month.
 *
 * @public
 */
export function sameCalendarMonth<TDate>(adapter: DateAdapter<TDate>, left: TDate, right: TDate) {
  const leftParts = adapter.getParts(left);
  const rightParts = adapter.getParts(right);
  return leftParts.year === rightParts.year && leftParts.month === rightParts.month;
}

function uniqueSortedDays<TDate>(adapter: DateAdapter<TDate>, values: ReadonlyArray<TDate>) {
  const byKey = new Map<string, TDate>();
  values.forEach((value) => {
    const normalized = normalizeCalendarDay(adapter, value);
    if (normalized !== null) byKey.set(calendarDayKey(adapter, normalized), normalized);
  });
  return Array.from(byKey.values()).sort((left, right) => adapter.compare(left, right));
}

export function normalizeCalendarValue<TDate>(
  adapter: DateAdapter<TDate>,
  mode: CalendarSelectionMode,
  value: CalendarValue<TDate> | undefined
): CalendarValue<TDate> {
  if (mode === "single") {
    if (value === null || value === undefined) return null;
    return normalizeCalendarDay(adapter, value as TDate);
  }

  const candidates = Array.isArray(value) ? (value as ReadonlyArray<TDate>) : [];
  const days = uniqueSortedDays(adapter, candidates);
  if (mode === "multiple") return days;
  if (days.length === 0) return null;
  const first = days[0]!;
  const last = days[days.length - 1]!;
  return [first, last] as CalendarRange<TDate>;
}

export function selectedCalendarDays<TDate>(
  adapter: DateAdapter<TDate>,
  mode: CalendarSelectionMode,
  value: CalendarValue<TDate>
) {
  if (mode === "single") {
    return value !== null && value !== undefined ? [value as TDate] : [];
  }
  return Array.isArray(value) ? uniqueSortedDays(adapter, value as ReadonlyArray<TDate>) : [];
}

/**
 * Normalizes a calendar value to its earliest and latest selected days.
 *
 * @public
 */
export function calendarRange<TDate>(
  adapter: DateAdapter<TDate>,
  value: CalendarValue<TDate>
): CalendarRange<TDate> | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const days = uniqueSortedDays(adapter, value as ReadonlyArray<TDate>);
  if (days.length === 0) return null;
  return [days[0]!, days[days.length - 1]!] as CalendarRange<TDate>;
}

export function calendarDateFromParts<TDate>(
  adapter: DateAdapter<TDate>,
  parts: Pick<DateParts, "day" | "month" | "year">
) {
  return adapter.fromParts({
    day: parts.day,
    hour: 0,
    millisecond: 0,
    minute: 0,
    month: parts.month,
    second: 0,
    year: parts.year
  });
}

/**
 * Builds the full-week day grid for a visible month.
 *
 * @public
 */
export function createCalendarGrid<TDate>(
  adapter: DateAdapter<TDate>,
  month: TDate,
  weekStartsOn: CalendarWeekStartsOn,
  fixedWeeks: boolean
) {
  const monthParts = adapter.getParts(month);
  const first = calendarDateFromParts(adapter, {
    day: 1,
    month: monthParts.month,
    year: monthParts.year
  });
  if (first === null) return [];
  const offset = (adapter.getDayOfWeek(first) - weekStartsOn + 7) % 7;
  const count = fixedWeeks ? 42 : Math.ceil((offset + adapter.getDaysInMonth(monthParts)) / 7) * 7;
  const start = adapter.add(first, -offset, "day");
  const result: Array<CalendarGridDay<TDate>> = [];
  for (let index = 0; index < count; index += 1) {
    const date = normalizeCalendarDay(adapter, adapter.add(start, index, "day"));
    if (date === null) continue;
    result.push({
      date,
      key: calendarDayKey(adapter, date),
      outside: !sameCalendarMonth(adapter, date, first)
    });
  }
  return result;
}

export function calendarMonthIntersectsBounds<TDate>(
  adapter: DateAdapter<TDate>,
  month: TDate,
  min: TDate | undefined,
  max: TDate | undefined
) {
  const start = normalizeCalendarMonth(adapter, month);
  if (start === null) return false;
  const end = adapter.add(adapter.add(start, 1, "month"), -1, "day");
  const normalizedMin = min === undefined ? null : normalizeCalendarDay(adapter, min);
  const normalizedMax = max === undefined ? null : normalizeCalendarDay(adapter, max);
  if (normalizedMin !== null && adapter.compare(end, normalizedMin) < 0) return false;
  if (normalizedMax !== null && adapter.compare(start, normalizedMax) > 0) return false;
  return true;
}

export function clampCalendarMonth<TDate>(
  adapter: DateAdapter<TDate>,
  month: TDate,
  min: TDate | undefined,
  max: TDate | undefined
) {
  let resolved = normalizeCalendarMonth(adapter, month);
  if (resolved === null) resolved = normalizeCalendarMonth(adapter, adapter.now());
  if (resolved === null) return month;
  const minMonth = min === undefined ? null : normalizeCalendarMonth(adapter, min);
  const maxMonth = max === undefined ? null : normalizeCalendarMonth(adapter, max);
  if (minMonth !== null && adapter.compare(resolved, minMonth) < 0) return minMonth;
  if (maxMonth !== null && adapter.compare(resolved, maxMonth) > 0) return maxMonth;
  return resolved;
}
