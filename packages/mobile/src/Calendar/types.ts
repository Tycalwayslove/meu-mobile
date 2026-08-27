import type { DateAdapter } from "@meu/date-adapter";
import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

export type CalendarSelectionMode = "single" | "multiple" | "range";
export type CalendarWeekStartsOn = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type CalendarRange<TDate> = readonly [TDate, TDate];
export type CalendarValue<TDate> = TDate | ReadonlyArray<TDate> | CalendarRange<TDate> | null;

export type CalendarMonthChangeReason =
  "keyboard" | "next-month" | "outside-day" | "previous-month" | "today";

export type CalendarMonthChangeDetails = {
  reason: CalendarMonthChangeReason;
};

export type CalendarChangeDetails<TDate> = {
  complete: boolean;
  date: TDate;
  mode: CalendarSelectionMode;
  reason: "clear" | "select";
};

export type CalendarDayDetails<TDate> = {
  date: TDate;
  disabled: boolean;
  inRange: boolean;
  locale: "en-US" | "zh-CN";
  outside: boolean;
  rangeEnd: boolean;
  rangeStart: boolean;
  selected: boolean;
  today: boolean;
};

export type CalendarDisabledDateDetails<TDate> = {
  adapter: DateAdapter<TDate>;
  outside: boolean;
};

export type CalendarRef<TDate> = {
  focus: () => void;
  goToMonth: (month: TDate) => void;
  goToToday: () => void;
};

type CalendarNativeProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "children" | "defaultValue" | "onChange"
>;

export type CalendarBaseProps<TDate> = CalendarNativeProps & {
  adapter?: DateAdapter<TDate>;
  allowClear?: boolean;
  defaultMonth?: TDate;
  disabled?: boolean;
  disabledDate?: (date: TDate, details: CalendarDisabledDateDetails<TDate>) => boolean;
  fixedWeeks?: boolean;
  max?: TDate;
  min?: TDate;
  month?: TDate;
  nextMonthAriaLabel?: string;
  onMonthChange?: (month: TDate, details: CalendarMonthChangeDetails) => void;
  previousMonthAriaLabel?: string;
  ref?: Ref<CalendarRef<TDate>>;
  renderDay?: (day: number, details: CalendarDayDetails<TDate>) => ReactNode;
  renderLabel?: (date: TDate, details: CalendarDayDetails<TDate>) => ReactNode;
  showOutsideDays?: boolean;
  weekdayLabels?: ReadonlyArray<string>;
  weekStartsOn?: CalendarWeekStartsOn;
};

export type CalendarSingleProps<TDate> = CalendarBaseProps<TDate> & {
  defaultValue?: TDate | null;
  onChange?: (value: TDate | null, details: CalendarChangeDetails<TDate>) => void;
  selectionMode?: "single";
  value?: TDate | null;
};

export type CalendarMultipleProps<TDate> = CalendarBaseProps<TDate> & {
  defaultValue?: ReadonlyArray<TDate>;
  onChange?: (value: ReadonlyArray<TDate>, details: CalendarChangeDetails<TDate>) => void;
  selectionMode: "multiple";
  value?: ReadonlyArray<TDate>;
};

export type CalendarRangeProps<TDate> = CalendarBaseProps<TDate> & {
  defaultValue?: CalendarRange<TDate> | null;
  onChange?: (value: CalendarRange<TDate> | null, details: CalendarChangeDetails<TDate>) => void;
  selectionMode: "range";
  value?: CalendarRange<TDate> | null;
};

export type CalendarProps<TDate = Date> =
  CalendarSingleProps<TDate> | CalendarMultipleProps<TDate> | CalendarRangeProps<TDate>;

export type { DateAdapter } from "@meu/date-adapter";
