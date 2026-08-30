"use client";

import { nativeDateAdapter } from "@meu/date-adapter";
import type { DateAdapter } from "@meu/date-adapter";
import { MeuIconChevronLeft } from "@meu/icons-react";
import { useEffect, useId, useImperativeHandle, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import { useMeuConfig } from "../ConfigProvider";
import { useFieldContext } from "../Field/FieldContext";
import { mergeIdReferences } from "../internal/mergeIdReferences";
import {
  dayButton,
  dayCell,
  dayLabel,
  dayNumber,
  dayRow,
  days,
  emptyDay,
  header,
  monthTitle,
  navigationButton,
  nextIcon,
  root,
  weekday,
  weekdayRow
} from "./Calendar.css";
import {
  calendarDayKey,
  calendarMonthIntersectsBounds,
  calendarRange,
  clampCalendarMonth,
  compareCalendarDays,
  createCalendarGrid,
  normalizeCalendarDay,
  normalizeCalendarValue,
  sameCalendarDay,
  sameCalendarMonth,
  selectedCalendarDays
} from "./resolveCalendar";
import type {
  CalendarChangeDetails,
  CalendarDayDetails,
  CalendarProps,
  CalendarRange,
  CalendarRef,
  CalendarSelectionMode,
  CalendarValue,
  CalendarWeekStartsOn
} from "./types";

const weekdayNames = {
  "en-US": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  "zh-CN": ["日", "一", "二", "三", "四", "五", "六"]
} as const;

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
] as const;

function modeOf<TDate>(props: CalendarProps<TDate>): CalendarSelectionMode {
  return props.selectionMode || "single";
}

function propValue<TDate>(props: CalendarProps<TDate>) {
  return props.value;
}

function propDefaultValue<TDate>(props: CalendarProps<TDate>) {
  return props.defaultValue;
}

function formatMonthTitle<TDate>(
  adapter: DateAdapter<TDate>,
  month: TDate,
  locale: "en-US" | "zh-CN"
) {
  const parts = adapter.getParts(month);
  return locale === "zh-CN"
    ? `${parts.year}年${parts.month}月`
    : `${monthNames[parts.month - 1]} ${parts.year}`;
}

function rotateWeekdays(labels: ReadonlyArray<string>, start: CalendarWeekStartsOn) {
  return Array.from({ length: 7 }, (_, index) => labels[(start + index) % 7] || "");
}

function chunks<T>(items: ReadonlyArray<T>) {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += 7) result.push(items.slice(index, index + 7));
  return result;
}

/**
 * Renders an adapter-driven inline month grid with single, multiple, or range selection.
 *
 * @public
 */
export function Calendar<TDate = Date>(props: CalendarProps<TDate>) {
  const {
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-required": _ariaRequired,
    adapter,
    allowClear = true,
    className,
    defaultMonth,
    defaultValue: _defaultValue,
    disabled = false,
    disabledDate,
    fixedWeeks = true,
    id,
    max,
    min,
    month,
    nextMonthAriaLabel,
    onChange: _onChange,
    onMonthChange,
    previousMonthAriaLabel,
    ref,
    renderDay,
    renderLabel,
    selectionMode: _selectionMode,
    showOutsideDays = true,
    style,
    weekdayLabels,
    weekStartsOn = 0,
    value: _value,
    ...nativeProps
  } = props;
  void _defaultValue;
  void _onChange;
  void _selectionMode;
  void _value;
  const config = useMeuConfig();
  const generatedId = useId();
  const fieldContext = useFieldContext();
  const resolvedAdapter = (adapter || nativeDateAdapter) as DateAdapter<TDate>;
  const mode = modeOf(props);
  const today = useMemo(() => {
    const now = resolvedAdapter.now();
    const normalized = normalizeCalendarDay(resolvedAdapter, now);
    return normalized === null ? now : normalized;
  }, [resolvedAdapter]);
  const [uncontrolledValue, setUncontrolledValue] = useState<CalendarValue<TDate>>(() =>
    normalizeCalendarValue(resolvedAdapter, mode, propDefaultValue(props))
  );
  const controlledValue = propValue(props) !== undefined;
  const currentValue = normalizeCalendarValue(
    resolvedAdapter,
    mode,
    controlledValue ? propValue(props) : uncontrolledValue
  );
  const selectedDays = selectedCalendarDays(resolvedAdapter, mode, currentValue);
  const initialMonthSource =
    month !== undefined
      ? month
      : defaultMonth !== undefined
        ? defaultMonth
        : selectedDays[0] !== undefined
          ? selectedDays[0]
          : today;
  const [uncontrolledMonth, setUncontrolledMonth] = useState(() =>
    clampCalendarMonth(resolvedAdapter, initialMonthSource, min, max)
  );
  const controlledMonth = month !== undefined;
  const currentMonth = clampCalendarMonth(
    resolvedAdapter,
    controlledMonth && month !== undefined ? month : uncontrolledMonth,
    min,
    max
  );
  if (!controlledMonth && !sameCalendarMonth(resolvedAdapter, uncontrolledMonth, currentMonth)) {
    setUncontrolledMonth(currentMonth);
  }
  const rangeAnchor = useRef<{ date: TDate; mode: CalendarSelectionMode } | null>(null);
  const [focusedDay, setFocusedDay] = useState<TDate | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const dayRefs = useRef(new Map<string, HTMLButtonElement>());
  const focusAfterNavigation = useRef(false);
  const grid = createCalendarGrid(resolvedAdapter, currentMonth, weekStartsOn, fixedWeeks);
  const visibleRange = mode === "range" ? calendarRange(resolvedAdapter, currentValue) : null;
  const normalizedMin = min === undefined ? null : normalizeCalendarDay(resolvedAdapter, min);
  const normalizedMax = max === undefined ? null : normalizeCalendarDay(resolvedAdapter, max);
  const resolvedId = id || (fieldContext ? fieldContext.controlId : undefined);
  const describedBy = mergeIdReferences(
    ariaDescribedBy,
    fieldContext ? fieldContext.describedBy : undefined
  );
  const labelledBy = ariaLabel
    ? undefined
    : mergeIdReferences(ariaLabelledBy, fieldContext ? fieldContext.labelId : undefined);
  const callerInvalid =
    ariaInvalid === true ||
    ariaInvalid === "true" ||
    ariaInvalid === "grammar" ||
    ariaInvalid === "spelling";
  const contextualInvalid = Boolean(fieldContext && fieldContext.invalid);
  const invalid = callerInvalid || contextualInvalid;
  const resolvedAriaInvalid = contextualInvalid
    ? true
    : ariaInvalid === "grammar" || ariaInvalid === "spelling"
      ? ariaInvalid
      : callerInvalid
        ? true
        : ariaInvalid === false || ariaInvalid === "false"
          ? ariaInvalid
          : undefined;
  void _ariaRequired;
  const titleId = resolvedId ? `${resolvedId}-month` : `meu-calendar-month-${generatedId}`;
  const calendarLabel = ariaLabel || (config.locale === "en-US" ? "Calendar" : "日历");

  function isDisabledDate(date: TDate, outside: boolean) {
    if (disabled) return true;
    if (normalizedMin !== null && compareCalendarDays(resolvedAdapter, date, normalizedMin) < 0)
      return true;
    if (normalizedMax !== null && compareCalendarDays(resolvedAdapter, date, normalizedMax) > 0)
      return true;
    return disabledDate ? disabledDate(date, { adapter: resolvedAdapter, outside }) : false;
  }

  const focusableDays = grid.filter((item) => !isDisabledDate(item.date, item.outside));
  const fallbackFocusItem = focusableDays.find((item) => !item.outside) || focusableDays[0] || null;
  const preferredFocus =
    focusedDay !== null &&
    focusableDays.some((item) => sameCalendarDay(resolvedAdapter, item.date, focusedDay))
      ? focusedDay
      : selectedDays.find((date) =>
          focusableDays.some((item) => sameCalendarDay(resolvedAdapter, item.date, date))
        ) ||
        (focusableDays.some((item) => sameCalendarDay(resolvedAdapter, item.date, today))
          ? today
          : fallbackFocusItem
            ? fallbackFocusItem.date
            : null);

  function requestMonth(
    nextMonth: TDate,
    reason: Parameters<NonNullable<typeof onMonthChange>>[1]["reason"]
  ) {
    const next = clampCalendarMonth(resolvedAdapter, nextMonth, min, max);
    if (sameCalendarMonth(resolvedAdapter, currentMonth, next)) return;
    if (!controlledMonth) setUncontrolledMonth(next);
    if (onMonthChange) onMonthChange(next, { reason });
  }

  function publish(nextValue: CalendarValue<TDate>, details: CalendarChangeDetails<TDate>) {
    const normalized = normalizeCalendarValue(resolvedAdapter, mode, nextValue);
    if (!controlledValue) setUncontrolledValue(normalized);
    if (mode === "single" && (!props.selectionMode || props.selectionMode === "single")) {
      if (props.onChange) props.onChange(normalized as TDate | null, details);
    } else if (mode === "multiple" && props.selectionMode === "multiple") {
      if (props.onChange) props.onChange(normalized as ReadonlyArray<TDate>, details);
    } else if (mode === "range" && props.selectionMode === "range") {
      if (props.onChange) props.onChange(normalized as CalendarRange<TDate> | null, details);
    }
  }

  function selectDate(date: TDate, outside: boolean) {
    if (isDisabledDate(date, outside)) return;
    const normalized = normalizeCalendarDay(resolvedAdapter, date);
    if (normalized === null) return;
    if (outside) requestMonth(normalized, "outside-day");
    const selected = selectedDays.some((candidate) =>
      sameCalendarDay(resolvedAdapter, candidate, normalized)
    );

    if (mode === "single") {
      const clearing = selected && allowClear;
      publish(clearing ? null : normalized, {
        complete: true,
        date: normalized,
        mode,
        reason: clearing ? "clear" : "select"
      });
      return;
    }

    if (mode === "multiple") {
      const next =
        selected && allowClear
          ? selectedDays.filter(
              (candidate) => !sameCalendarDay(resolvedAdapter, candidate, normalized)
            )
          : [...selectedDays, normalized];
      publish(next, {
        complete: true,
        date: normalized,
        mode,
        reason: selected && allowClear ? "clear" : "select"
      });
      return;
    }

    const activeRangeAnchor =
      rangeAnchor.current && rangeAnchor.current.mode === mode ? rangeAnchor.current.date : null;
    if (activeRangeAnchor === null) {
      rangeAnchor.current = { date: normalized, mode };
      publish([normalized, normalized], {
        complete: false,
        date: normalized,
        mode,
        reason: "select"
      });
      return;
    }

    const nextRange =
      compareCalendarDays(resolvedAdapter, activeRangeAnchor, normalized) <= 0
        ? ([activeRangeAnchor, normalized] as const)
        : ([normalized, activeRangeAnchor] as const);
    rangeAnchor.current = null;
    publish(nextRange, {
      complete: true,
      date: normalized,
      mode,
      reason: "select"
    });
  }

  function focusDate(target: TDate, reason: "keyboard" | "outside-day" | "today") {
    const normalized = normalizeCalendarDay(resolvedAdapter, target);
    if (normalized === null) return;
    let clamped = normalized;
    if (
      normalizedMin !== null &&
      compareCalendarDays(resolvedAdapter, clamped, normalizedMin) < 0
    ) {
      clamped = normalizedMin;
    }
    if (
      normalizedMax !== null &&
      compareCalendarDays(resolvedAdapter, clamped, normalizedMax) > 0
    ) {
      clamped = normalizedMax;
    }
    const direction =
      compareCalendarDays(
        resolvedAdapter,
        normalized,
        preferredFocus === null ? normalized : preferredFocus
      ) < 0
        ? -1
        : 1;

    let candidate: TDate | null = null;
    for (let distance = 0; distance <= 366 && candidate === null; distance += 1) {
      const offsets = distance === 0 ? [0] : [distance * direction, distance * -direction];
      for (const offset of offsets) {
        const next = offset === 0 ? clamped : resolvedAdapter.add(clamped, offset, "day");
        if (
          normalizedMin !== null &&
          compareCalendarDays(resolvedAdapter, next, normalizedMin) < 0
        ) {
          continue;
        }
        if (
          normalizedMax !== null &&
          compareCalendarDays(resolvedAdapter, next, normalizedMax) > 0
        ) {
          continue;
        }
        // A navigation target is evaluated as a day in its destination month. Treating it as an
        // outside cell here would make predicates such as `details.outside` block every
        // cross-month keyboard or imperative focus request.
        if (!isDisabledDate(next, false)) {
          candidate = next;
          break;
        }
      }
    }

    if (candidate === null) {
      setFocusedDay(null);
      focusAfterNavigation.current = false;
      if (rootRef.current) rootRef.current.focus();
      return;
    }

    setFocusedDay(candidate);
    const visibleTarget = dayRefs.current.get(calendarDayKey(resolvedAdapter, candidate));
    if (visibleTarget && sameCalendarMonth(resolvedAdapter, candidate, currentMonth)) {
      focusAfterNavigation.current = false;
      visibleTarget.focus();
      return;
    }
    focusAfterNavigation.current = true;
    requestMonth(candidate, reason);
  }

  function handleDayKeyDown(event: KeyboardEvent<HTMLButtonElement>, date: TDate) {
    let target: TDate | null = null;
    if (event.key === "ArrowLeft") {
      target = resolvedAdapter.add(date, config.dir === "rtl" ? 1 : -1, "day");
    } else if (event.key === "ArrowRight") {
      target = resolvedAdapter.add(date, config.dir === "rtl" ? -1 : 1, "day");
    } else if (event.key === "ArrowUp") target = resolvedAdapter.add(date, -7, "day");
    else if (event.key === "ArrowDown") target = resolvedAdapter.add(date, 7, "day");
    else if (event.key === "Home") {
      const offset = (resolvedAdapter.getDayOfWeek(date) - weekStartsOn + 7) % 7;
      target = resolvedAdapter.add(date, -offset, "day");
    } else if (event.key === "End") {
      const offset = (resolvedAdapter.getDayOfWeek(date) - weekStartsOn + 7) % 7;
      target = resolvedAdapter.add(date, 6 - offset, "day");
    } else if (event.key === "PageUp") {
      target = resolvedAdapter.add(date, -1, event.shiftKey ? "year" : "month");
    } else if (event.key === "PageDown") {
      target = resolvedAdapter.add(date, 1, event.shiftKey ? "year" : "month");
    }
    if (target === null) return;
    event.preventDefault();
    focusDate(target, "keyboard");
  }

  useEffect(() => {
    if (!focusAfterNavigation.current || focusedDay === null) return;
    const target = dayRefs.current.get(calendarDayKey(resolvedAdapter, focusedDay));
    if (!target) return;
    focusAfterNavigation.current = false;
    target.focus();
  }, [currentMonth, focusedDay, resolvedAdapter]);

  useImperativeHandle(ref, (): CalendarRef<TDate> => ({
    focus() {
      const target =
        preferredFocus !== null
          ? dayRefs.current.get(calendarDayKey(resolvedAdapter, preferredFocus))
          : null;
      if (target) target.focus();
      else if (rootRef.current) rootRef.current.focus();
    },
    goToMonth(nextMonth) {
      requestMonth(nextMonth, "keyboard");
    },
    goToToday() {
      focusDate(today, "today");
    }
  }));

  const labels = rotateWeekdays(
    weekdayLabels && weekdayLabels.length === 7 ? weekdayLabels : weekdayNames[config.locale],
    weekStartsOn
  );
  const previousMonth = resolvedAdapter.add(currentMonth, -1, "month");
  const nextMonth = resolvedAdapter.add(currentMonth, 1, "month");
  const canGoPrevious = calendarMonthIntersectsBounds(resolvedAdapter, previousMonth, min, max);
  const canGoNext = calendarMonthIntersectsBounds(resolvedAdapter, nextMonth, min, max);
  const monthLabel = formatMonthTitle(resolvedAdapter, currentMonth, config.locale);

  return (
    /* aria-invalid is a global WAI-ARIA state carried by the calendar's semantic group root. */
    /* eslint-disable-next-line jsx-a11y/role-supports-aria-props */
    <div
      {...nativeProps}
      ref={rootRef}
      id={resolvedId}
      role="group"
      tabIndex={focusableDays.length === 0 ? 0 : -1}
      className={className ? `${root({ invalid })} ${className}` : root({ invalid })}
      style={style}
      aria-describedby={describedBy}
      aria-invalid={resolvedAriaInvalid}
      aria-label={ariaLabel ? ariaLabel : labelledBy ? undefined : calendarLabel}
      aria-labelledby={ariaLabel ? undefined : labelledBy}
      data-meu-component="calendar"
      data-disabled={disabled ? "true" : "false"}
      data-selection-mode={mode}
    >
      <div className={header}>
        <button
          className={navigationButton}
          type="button"
          aria-label={
            previousMonthAriaLabel || (config.locale === "en-US" ? "Previous month" : "上个月")
          }
          disabled={!canGoPrevious || disabled}
          onClick={() => requestMonth(previousMonth, "previous-month")}
        >
          <span className={config.dir === "rtl" ? nextIcon : undefined}>
            <MeuIconChevronLeft size={20} strokeWidth={2} aria-hidden="true" />
          </span>
        </button>
        <h3 className={monthTitle} id={titleId} aria-live="polite">
          {monthLabel}
        </h3>
        <button
          className={navigationButton}
          type="button"
          aria-label={nextMonthAriaLabel || (config.locale === "en-US" ? "Next month" : "下个月")}
          disabled={!canGoNext || disabled}
          onClick={() => requestMonth(nextMonth, "next-month")}
        >
          <span className={config.dir === "rtl" ? undefined : nextIcon}>
            <MeuIconChevronLeft size={20} strokeWidth={2} aria-hidden="true" />
          </span>
        </button>
      </div>
      <div
        className={days}
        role="grid"
        aria-labelledby={titleId}
        aria-multiselectable={mode === "single" ? undefined : true}
        aria-readonly={disabled || undefined}
      >
        <div className={weekdayRow} role="row">
          {labels.map((label, index) => (
            <span className={weekday} role="columnheader" key={`${index}-${label}`}>
              {label}
            </span>
          ))}
        </div>
        {chunks(grid).map((week, weekIndex) => (
          <div className={dayRow} role="row" key={`week-${weekIndex}`}>
            {week.map((item) => {
              const dayDisabled = isDisabledDate(item.date, item.outside);
              const selected = selectedDays.some((candidate) =>
                sameCalendarDay(resolvedAdapter, candidate, item.date)
              );
              const rangeStart = Boolean(
                visibleRange && sameCalendarDay(resolvedAdapter, visibleRange[0], item.date)
              );
              const rangeEnd = Boolean(
                visibleRange && sameCalendarDay(resolvedAdapter, visibleRange[1], item.date)
              );
              const inRange = Boolean(
                visibleRange &&
                compareCalendarDays(resolvedAdapter, item.date, visibleRange[0]) >= 0 &&
                compareCalendarDays(resolvedAdapter, item.date, visibleRange[1]) <= 0
              );
              const semanticallySelected = mode === "range" ? inRange : selected;
              const isToday = sameCalendarDay(resolvedAdapter, today, item.date);
              const details: CalendarDayDetails<TDate> = {
                date: item.date,
                disabled: dayDisabled,
                inRange,
                locale: config.locale,
                outside: item.outside,
                rangeEnd,
                rangeStart,
                selected,
                today: isToday
              };
              const parts = resolvedAdapter.getParts(item.date);
              const labelContent = renderLabel ? renderLabel(item.date, details) : null;
              const ariaDate = calendarDayKey(resolvedAdapter, item.date);
              const statusText = [
                isToday ? (config.locale === "en-US" ? "today" : "今天") : "",
                semanticallySelected ? (config.locale === "en-US" ? "selected" : "已选择") : ""
              ]
                .filter(Boolean)
                .join(", ");
              const ariaDayLabel = statusText ? `${ariaDate}, ${statusText}` : ariaDate;
              const active =
                preferredFocus !== null
                  ? sameCalendarDay(resolvedAdapter, preferredFocus, item.date)
                  : false;

              return (
                <div
                  className={dayCell({ inRange, rangeEnd, rangeStart, rtl: config.dir === "rtl" })}
                  role="gridcell"
                  aria-selected={semanticallySelected}
                  key={item.key}
                >
                  {item.outside && !showOutsideDays ? (
                    <span className={emptyDay} aria-hidden="true" />
                  ) : (
                    <button
                      ref={(node) => {
                        if (node) dayRefs.current.set(item.key, node);
                        else dayRefs.current.delete(item.key);
                      }}
                      className={dayButton({
                        disabled: dayDisabled,
                        outside: item.outside,
                        selected: mode === "range" ? rangeStart || rangeEnd : selected,
                        today: isToday && !selected
                      })}
                      type="button"
                      tabIndex={active ? 0 : -1}
                      aria-current={isToday ? "date" : undefined}
                      aria-label={ariaDayLabel}
                      aria-pressed={semanticallySelected}
                      disabled={dayDisabled}
                      data-date={item.key}
                      data-outside={item.outside ? "true" : "false"}
                      data-range-end={rangeEnd ? "true" : "false"}
                      data-range-start={rangeStart ? "true" : "false"}
                      onClick={() => selectDate(item.date, item.outside)}
                      onFocus={() => setFocusedDay(item.date)}
                      onKeyDown={(event) => handleDayKeyDown(event, item.date)}
                    >
                      <span className={dayNumber}>
                        {renderDay ? renderDay(parts.day, details) : parts.day}
                      </span>
                      {labelContent !== null && labelContent !== undefined ? (
                        <span className={dayLabel}>{labelContent}</span>
                      ) : null}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
