import type { DateAdapter } from "@meu/date-adapter";

import { compareCalendarDays, normalizeCalendarDay, sameCalendarDay } from "../Calendar";
import type { CalendarDisabledDateDetails, CalendarRange } from "../Calendar";

export function normalizeDateRange<TDate>(
  adapter: DateAdapter<TDate>,
  value: CalendarRange<TDate> | null | undefined
): CalendarRange<TDate> | null {
  if (value === null || value === undefined || value.length !== 2) return null;
  const first = normalizeCalendarDay(adapter, value[0]);
  const second = normalizeCalendarDay(adapter, value[1]);
  if (first === null || second === null) return null;
  return compareCalendarDays(adapter, first, second) <= 0
    ? ([first, second] as const)
    : ([second, first] as const);
}

export function sameDateRange<TDate>(
  adapter: DateAdapter<TDate>,
  left: CalendarRange<TDate> | null | undefined,
  right: CalendarRange<TDate> | null | undefined
) {
  const normalizedLeft = normalizeDateRange(adapter, left);
  const normalizedRight = normalizeDateRange(adapter, right);
  if (normalizedLeft === null || normalizedRight === null) {
    return normalizedLeft === normalizedRight;
  }
  return (
    sameCalendarDay(adapter, normalizedLeft[0], normalizedRight[0]) &&
    sameCalendarDay(adapter, normalizedLeft[1], normalizedRight[1])
  );
}

export function dateRangeIsSelectable<TDate>(
  adapter: DateAdapter<TDate>,
  value: CalendarRange<TDate> | null,
  options: {
    disabled?: boolean;
    disabledDate?: (date: TDate, details: CalendarDisabledDateDetails<TDate>) => boolean;
    max?: TDate;
    min?: TDate;
  }
) {
  if (options.disabled || value === null) return false;
  const normalized = normalizeDateRange(adapter, value);
  if (normalized === null) return false;
  const min = options.min === undefined ? null : normalizeCalendarDay(adapter, options.min);
  const max = options.max === undefined ? null : normalizeCalendarDay(adapter, options.max);
  if (min !== null && compareCalendarDays(adapter, normalized[0], min) < 0) return false;
  if (max !== null && compareCalendarDays(adapter, normalized[1], max) > 0) return false;
  if (
    options.disabledDate &&
    (options.disabledDate(normalized[0], { adapter, outside: false }) ||
      options.disabledDate(normalized[1], { adapter, outside: false }))
  )
    return false;
  return true;
}
