import type { DateParts } from "@meu/date-adapter";
import type { ReactNode } from "react";

import type {
  PickerAccessibleName,
  PickerBaseProps,
  PickerOpenChangeDetails,
  PickerSelectDetails
} from "../Picker";

/**
 * Finest time unit displayed and edited by TimePicker.
 *
 * @public
 */
export type TimePickerPrecision = "hour" | "minute" | "second";
/**
 * Selects a 24-hour clock or a 12-hour clock with a day-period column.
 *
 * @public
 */
export type TimePickerHourCycle = "h23" | "h12";
/**
 * Day-period value used by the 12-hour clock column.
 *
 * @public
 */
export type TimePickerPeriod = "am" | "pm";
/**
 * Semantic identity of a TimePicker wheel.
 *
 * @public
 */
export type TimePickerColumn = TimePickerPrecision | "period";
/**
 * Raw value carried by a numeric time wheel or the day-period wheel.
 *
 * @public
 */
export type TimePickerColumnValue = number | TimePickerPeriod;
/** A date- and timezone-independent time of day using canonical 24-hour fields. @public */
export type TimeValue = Pick<DateParts, "hour" | "minute" | "second"> & {
  /** Canonical 24-hour clock hour from 0 through 23. */
  hour: DateParts["hour"];
  /** Minute from 0 through 59. */
  minute: DateParts["minute"];
  /** Second from 0 through 59. */
  second: DateParts["second"];
};

/**
 * Canonical context supplied when a column filter evaluates an option.
 *
 * @public
 */
export type TimePickerFilterDetails = {
  /** Active 12- or 24-hour presentation mode. */
  hourCycle: TimePickerHourCycle;
  /** Column currently evaluating its candidate. */
  precision: TimePickerPrecision;
  /** Canonical candidate time, or `null` when no complete candidate exists. */
  time: TimeValue | null;
};

/** Per-column option predicates evaluated with a canonical 24-hour candidate. @public */
export type TimePickerFilter = Partial<
  Record<TimePickerPrecision, (value: number, details: TimePickerFilterDetails) => boolean>
>;

/**
 * Context supplied when rendering a TimePicker option label.
 *
 * @public
 */
export type TimePickerLabelDetails = {
  /** Column whose option label is being rendered. */
  column: TimePickerColumn;
  /** Active 12- or 24-hour presentation mode. */
  hourCycle: TimePickerHourCycle;
  /** ConfigProvider locale used by the built-in label fallback. */
  locale: "en-US" | "zh-CN";
  /** Canonical candidate time represented by the option. */
  time: TimeValue | null;
};

/**
 * Picker selection metadata augmented with the semantic time column.
 *
 * @public
 */
export type TimePickerSelectDetails = PickerSelectDetails & {
  /** Semantic column corresponding to `columnIndex`. */
  column: TimePickerColumn;
};

/**
 * Locale and precision controls for {@link formatTimeValue}.
 *
 * @public
 */
export type FormatTimeValueOptions = {
  /** Uses 24-hour output or appends/prepends a localized day period. @defaultValue "h23" */
  hourCycle?: TimePickerHourCycle;
  /** Controls localized AM/PM text and ordering. @defaultValue "en-US" */
  locale?: "en-US" | "zh-CN";
  /** Last time unit included in the formatted string. @defaultValue "minute" */
  precision?: TimePickerPrecision;
};

type TimePickerBaseProps = Omit<
  PickerBaseProps<TimePickerColumnValue>,
  "columnLabels" | "columns" | "defaultValue" | "onConfirm" | "onSelect" | "renderOption" | "value"
> & {
  /** Accessible names for individual wheels; omitted entries use localized defaults. */
  columnLabels?: Partial<Record<TimePickerColumn, string>>;
  /** Initial uncontrolled time; invalid, null, or out-of-range input normalizes to a bound. */
  defaultValue?: TimeValue | null;
  /** Per-column predicates that disable candidates without changing their labels. */
  filter?: TimePickerFilter;
  /** Uses canonical 24-hour wheels or 12-hour wheels with an AM/PM column. @defaultValue "h23" */
  hourCycle?: TimePickerHourCycle;
  /** Hour-grid increment anchored at 0 in h23 and at 0/12 in h12, floored and clamped to 1–23. @defaultValue 1 */
  hourStep?: number;
  /** Inclusive raw upper bound; the effective maximum is the last precision/step grid point at or before it. Invalid values fall back to 23:59:59. */
  max?: TimeValue;
  /** Inclusive raw lower bound; the effective minimum is the first precision/step grid point at or after it. Invalid values fall back to 00:00:00. */
  min?: TimeValue;
  /** Minute-grid increment anchored at 0, floored and clamped to 1–59. @defaultValue 1 */
  minuteStep?: number;
  /** Called with the normalized canonical time before confirmation requests closure. */
  onConfirm?: (value: TimeValue) => void;
  /** Reports each valid in-panel draft change without committing it. */
  onSelect?: (value: TimeValue, details: TimePickerSelectDetails) => void;
  /** Last rendered unit; lower units are zeroed and bounds are enforced against the resulting complete time. @defaultValue "minute" */
  precision?: TimePickerPrecision;
  /** Customizes visible option labels; plain text also becomes wheel type-ahead text. */
  renderLabel?: (
    column: TimePickerColumn,
    value: TimePickerColumnValue,
    details: TimePickerLabelDetails
  ) => ReactNode;
  /** Second-grid increment anchored at 0, floored and clamped to 1–59. @defaultValue 1 */
  secondStep?: number;
  /** Controlled committed time; the open wheel keeps an isolated draft until confirm. */
  value?: TimeValue | null;
};

/** Props for the confirmation-based time-of-day wheel. @public */
export type TimePickerProps = TimePickerBaseProps & PickerAccessibleName;
/**
 * Visibility-change metadata shared with Picker.
 *
 * @public
 */
export type TimePickerOpenChangeDetails = PickerOpenChangeDetails;
