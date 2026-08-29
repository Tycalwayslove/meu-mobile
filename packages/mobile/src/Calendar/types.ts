import type { DateAdapter } from "@meu/date-adapter";
import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

/** Selection models supported by {@link Calendar}. @public */
export type CalendarSelectionMode = "single" | "multiple" | "range";
/** JavaScript weekday index used as the first grid column. @public */
export type CalendarWeekStartsOn = 0 | 1 | 2 | 3 | 4 | 5 | 6;
/** A normalized inclusive pair of calendar-day endpoints. @public */
export type CalendarRange<TDate> = readonly [TDate, TDate];
/** Runtime union used by Calendar helper functions. @public */
export type CalendarValue<TDate> = TDate | ReadonlyArray<TDate> | CalendarRange<TDate> | null;

/**
 * Interaction that requested a visible-month change.
 *
 * @public
 */
export type CalendarMonthChangeReason =
  "keyboard" | "next-month" | "outside-day" | "previous-month" | "today";

/**
 * Details reported with a visible-month request.
 *
 * @public
 */
export type CalendarMonthChangeDetails = {
  /** Keyboard, control, outside-day, or imperative-today action that requested the month. */
  reason: CalendarMonthChangeReason;
};

/**
 * Details reported after a calendar selection changes.
 *
 * @public
 */
export type CalendarChangeDetails<TDate> = {
  /** Whether this interaction completed a selection; the first range endpoint reports `false`. */
  complete: boolean;
  /** Normalized day activated by the user. */
  date: TDate;
  /** Selection model active when the value changed. */
  mode: CalendarSelectionMode;
  /** Whether the interaction selected a day or cleared an existing single/multiple selection. */
  reason: "clear" | "select";
};

/**
 * Render state supplied to calendar day renderers.
 *
 * @public
 */
export type CalendarDayDetails<TDate> = {
  /** Adapter value normalized to the start of this calendar day. */
  date: TDate;
  /** Whether global disablement, bounds, or `disabledDate` prevents selection. */
  disabled: boolean;
  /** Whether the day lies within the inclusive range selection. */
  inRange: boolean;
  /** Locale inherited from `ConfigProvider`. */
  locale: "en-US" | "zh-CN";
  /** Whether the day belongs to an adjacent month displayed in the current grid. */
  outside: boolean;
  /** Whether the day is the normalized range's ending endpoint. */
  rangeEnd: boolean;
  /** Whether the day is the normalized range's starting endpoint. */
  rangeStart: boolean;
  /** Whether the day is a selected single/multiple value or a range endpoint. */
  selected: boolean;
  /** Whether the day matches the adapter's current day. */
  today: boolean;
};

/**
 * Context supplied to a calendar's disabled-date predicate.
 *
 * @public
 */
export type CalendarDisabledDateDetails<TDate> = {
  /** Active adapter for application-specific comparisons and formatting. */
  adapter: DateAdapter<TDate>;
  /** Whether the candidate belongs to an adjacent month in the current grid. */
  outside: boolean;
};

/** Imperative focus and month-navigation surface exposed by Calendar. @public */
export type CalendarRef<TDate> = {
  /** Focuses the preferred enabled day, or the calendar root when no day is focusable. */
  focus: () => void;
  /** Requests the month containing `month`; controlled consumers must update `month`. */
  goToMonth: (month: TDate) => void;
  /**
   * Requests the adapter's current month and focuses today, or the nearest enabled in-bounds day
   * found within 366 days. Focus falls back to the calendar root when none is found. Controlled
   * consumers must accept the month request before cross-month focus can complete.
   */
  goToToday: () => void;
};

type CalendarNativeProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "children" | "defaultValue" | "onChange"
>;

/**
 * Props shared by every calendar selection mode.
 *
 * @public
 */
export type CalendarBaseProps<TDate> = CalendarNativeProps & {
  /** Date arithmetic and conversion implementation. Defaults to the native `Date` adapter. */
  adapter?: DateAdapter<TDate>;
  /** Allows reselecting a selected day to clear it in single and multiple modes. @defaultValue true */
  allowClear?: boolean;
  /** Initial visible month when `month` is uncontrolled; falls back to the first selection, then today. */
  defaultMonth?: TDate;
  /** Disables month controls and every day button. @defaultValue false */
  disabled?: boolean;
  /** Returns whether a candidate day is unavailable after global bounds are applied. */
  disabledDate?: (date: TDate, details: CalendarDisabledDateDetails<TDate>) => boolean;
  /** Always renders a six-week, 42-day grid instead of the minimum full-week grid. @defaultValue true */
  fixedWeeks?: boolean;
  /** Inclusive latest selectable day and latest navigable month. */
  max?: TDate;
  /** Inclusive earliest selectable day and earliest navigable month. */
  min?: TDate;
  /** Controlled visible month; pair with `onMonthChange` to accept navigation requests. */
  month?: TDate;
  /** Accessible label for the next-month button. Defaults to localized text. */
  nextMonthAriaLabel?: string;
  /** Called when keyboard, controls, outside-day selection, or an imperative method requests another month. */
  onMonthChange?: (month: TDate, details: CalendarMonthChangeDetails) => void;
  /** Accessible label for the previous-month button. Defaults to localized text. */
  previousMonthAriaLabel?: string;
  /** Imperative handle for focus and month navigation. */
  ref?: Ref<CalendarRef<TDate>>;
  /** Replaces the visible day number; the calendar keeps its ISO-like accessible date label. */
  renderDay?: (day: number, details: CalendarDayDetails<TDate>) => ReactNode;
  /** Renders secondary visual content below a day number. */
  renderLabel?: (date: TDate, details: CalendarDayDetails<TDate>) => ReactNode;
  /** Displays selectable days from adjacent months; hidden outside cells remain in the grid. @defaultValue true */
  showOutsideDays?: boolean;
  /** Seven labels in Sunday-first order; arrays of any other length fall back to localized labels. */
  weekdayLabels?: ReadonlyArray<string>;
  /** JavaScript weekday index placed in the first grid column. @defaultValue 0 */
  weekStartsOn?: CalendarWeekStartsOn;
};

/**
 * Props for a single-selection calendar.
 *
 * @public
 */
export type CalendarSingleProps<TDate> = CalendarBaseProps<TDate> & {
  /** Initial selected day when `value` is uncontrolled. @defaultValue null */
  defaultValue?: TDate | null;
  /** Called after selection or clearing; controlled consumers must update `value`. */
  onChange?: (value: TDate | null, details: CalendarChangeDetails<TDate>) => void;
  /** Selects at most one day. @defaultValue "single" */
  selectionMode?: "single";
  /** Controlled selected day, or `null` for no selection. */
  value?: TDate | null;
};

/**
 * Props for a multiple-selection calendar.
 *
 * @public
 */
export type CalendarMultipleProps<TDate> = CalendarBaseProps<TDate> & {
  /** Initial selected days when `value` is uncontrolled; invalid dates and duplicates are removed. @defaultValue [] */
  defaultValue?: ReadonlyArray<TDate>;
  /** Called after adding or clearing a day; controlled consumers must update `value`. */
  onChange?: (value: ReadonlyArray<TDate>, details: CalendarChangeDetails<TDate>) => void;
  /** Selects an ordered set of unique calendar days. */
  selectionMode: "multiple";
  /** Controlled selected days; values normalize to unique days in ascending order. */
  value?: ReadonlyArray<TDate>;
};

/**
 * Props for an inclusive range-selection calendar.
 *
 * @public
 */
export type CalendarRangeProps<TDate> = CalendarBaseProps<TDate> & {
  /** Initial inclusive range when `value` is uncontrolled; endpoints normalize into ascending order. @defaultValue null */
  defaultValue?: CalendarRange<TDate> | null;
  /** Called after each endpoint selection; inspect `details.complete` to distinguish the range anchor. */
  onChange?: (value: CalendarRange<TDate> | null, details: CalendarChangeDetails<TDate>) => void;
  /** Selects an inclusive two-endpoint range. */
  selectionMode: "range";
  /** Controlled inclusive range, or `null` for no selection. */
  value?: CalendarRange<TDate> | null;
};

/** Discriminated props whose value and callback types follow selectionMode. @public */
export type CalendarProps<TDate = Date> =
  CalendarSingleProps<TDate> | CalendarMultipleProps<TDate> | CalendarRangeProps<TDate>;

export type { DateAdapter } from "@meu/date-adapter";
