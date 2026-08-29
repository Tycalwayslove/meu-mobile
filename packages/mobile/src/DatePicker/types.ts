import type { DateAdapter, DateParts, DatePrecision } from "@meu/date-adapter";
import type { ReactNode } from "react";

import type {
  PickerAccessibleName,
  PickerBaseProps,
  PickerOpenChangeDetails,
  PickerSelectDetails
} from "../Picker";

/**
 * Candidate date state supplied to a date-picker filter.
 *
 * @public
 */
export type DatePickerFilterDetails<TDate> = {
  /** Candidate adapter value, or `null` when the candidate parts cannot form a valid date. */
  date: TDate | null;
  /** Complete candidate parts after applying this column value. */
  parts: DateParts;
  /** Column whose candidate is being filtered. */
  precision: DatePrecision;
};

/** Per-precision option predicates evaluated with the candidate date. @public */
export type DatePickerFilter<TDate> = Partial<
  Record<DatePrecision, (value: number, details: DatePickerFilterDetails<TDate>) => boolean>
>;

/**
 * Candidate date state supplied to an option-label renderer.
 *
 * @public
 */
export type DatePickerLabelDetails<TDate> = DatePickerFilterDetails<TDate> & {
  /** Locale inherited from `ConfigProvider`. */
  locale: "en-US" | "zh-CN";
};

/**
 * Details reported when a date-picker wheel changes.
 *
 * @public
 */
export type DatePickerSelectDetails = PickerSelectDetails & {
  /** Date precision represented by the changed wheel column. */
  precision: DatePrecision;
};

type DatePickerBaseProps<TDate> = Omit<
  PickerBaseProps<number>,
  "columnLabels" | "columns" | "defaultValue" | "onConfirm" | "onSelect" | "renderOption" | "value"
> & {
  /** Date arithmetic and conversion implementation. Defaults to the native `Date` adapter. */
  adapter?: DateAdapter<TDate>;
  /** Accessible labels by wheel precision; omitted entries use localized labels. */
  columnLabels?: Partial<Record<DatePrecision, string>>;
  /** Initial committed date when `value` is uncontrolled; invalid or absent values resolve to the lower bound. */
  defaultValue?: TDate | null;
  /** Per-column predicates; return `false` to disable a candidate option. */
  filter?: DatePickerFilter<TDate>;
  /** Inclusive latest selectable date; defaults to the end of the year ten years after today. */
  max?: TDate;
  /** Inclusive earliest selectable date; defaults to the start of the year ten years before today. */
  min?: TDate;
  /** Minute increment, floored and clamped from 1 through 59. @defaultValue 1 */
  minuteStep?: number;
  /** Called with the valid draft date when the user confirms; controlled consumers must update `value`. */
  onConfirm?: (value: TDate) => void;
  /** Called as a wheel changes with the complete draft date and changed column metadata. */
  onSelect?: (value: TDate, details: DatePickerSelectDetails) => void;
  /** Finest displayed unit; columns run from year through this precision. @defaultValue "day" */
  precision?: DatePrecision;
  /** Renders an option label from its precision, numeric value, candidate date parts, and locale. */
  renderLabel?: (
    precision: DatePrecision,
    value: number,
    details: DatePickerLabelDetails<TDate>
  ) => ReactNode;
  /** Second increment, floored and clamped from 1 through 59. @defaultValue 1 */
  secondStep?: number;
  /** Controlled committed date; `null` displays the lower-bound draft until confirmation. */
  value?: TDate | null;
};

/** Props for an adapter-driven, confirmation-based date wheel. @public */
export type DatePickerProps<TDate = Date> = DatePickerBaseProps<TDate> & PickerAccessibleName;

/**
 * Details reported with a date-picker open-state request.
 *
 * @public
 */
export type DatePickerOpenChangeDetails = PickerOpenChangeDetails;

export type { DateAdapter, DateParts, DatePrecision } from "@meu/date-adapter";
