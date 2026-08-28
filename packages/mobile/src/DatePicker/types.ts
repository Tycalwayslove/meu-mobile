import type { DateAdapter, DateParts, DatePrecision } from "@meu/date-adapter";
import type { ReactNode } from "react";

import type {
  PickerAccessibleName,
  PickerBaseProps,
  PickerOpenChangeDetails,
  PickerSelectDetails
} from "../Picker";

export type DatePickerFilterDetails<TDate> = {
  date: TDate | null;
  parts: DateParts;
  precision: DatePrecision;
};

/** Per-precision option predicates evaluated with the candidate date. @public */
export type DatePickerFilter<TDate> = Partial<
  Record<DatePrecision, (value: number, details: DatePickerFilterDetails<TDate>) => boolean>
>;

export type DatePickerLabelDetails<TDate> = DatePickerFilterDetails<TDate> & {
  locale: "en-US" | "zh-CN";
};

export type DatePickerSelectDetails = PickerSelectDetails & {
  precision: DatePrecision;
};

type DatePickerBaseProps<TDate> = Omit<
  PickerBaseProps<number>,
  "columnLabels" | "columns" | "defaultValue" | "onConfirm" | "onSelect" | "renderOption" | "value"
> & {
  adapter?: DateAdapter<TDate>;
  columnLabels?: Partial<Record<DatePrecision, string>>;
  defaultValue?: TDate | null;
  filter?: DatePickerFilter<TDate>;
  max?: TDate;
  min?: TDate;
  minuteStep?: number;
  onConfirm?: (value: TDate) => void;
  onSelect?: (value: TDate, details: DatePickerSelectDetails) => void;
  precision?: DatePrecision;
  renderLabel?: (
    precision: DatePrecision,
    value: number,
    details: DatePickerLabelDetails<TDate>
  ) => ReactNode;
  secondStep?: number;
  value?: TDate | null;
};

/** Props for an adapter-driven, confirmation-based date wheel. @public */
export type DatePickerProps<TDate = Date> = DatePickerBaseProps<TDate> & PickerAccessibleName;

export type DatePickerOpenChangeDetails = PickerOpenChangeDetails;

export type { DateAdapter, DateParts, DatePrecision } from "@meu/date-adapter";
