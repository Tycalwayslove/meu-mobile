import type { DateParts } from "@meu/date-adapter";
import type { ReactNode } from "react";

import type {
  PickerAccessibleName,
  PickerBaseProps,
  PickerOpenChangeDetails,
  PickerSelectDetails
} from "../Picker";

export type TimePickerPrecision = "hour" | "minute" | "second";
export type TimePickerHourCycle = "h23" | "h12";
export type TimePickerPeriod = "am" | "pm";
export type TimePickerColumn = TimePickerPrecision | "period";
export type TimePickerColumnValue = number | TimePickerPeriod;
export type TimeValue = Pick<DateParts, "hour" | "minute" | "second">;

export type TimePickerFilterDetails = {
  hourCycle: TimePickerHourCycle;
  precision: TimePickerPrecision;
  time: TimeValue | null;
};

export type TimePickerFilter = Partial<
  Record<TimePickerPrecision, (value: number, details: TimePickerFilterDetails) => boolean>
>;

export type TimePickerLabelDetails = {
  column: TimePickerColumn;
  hourCycle: TimePickerHourCycle;
  locale: "en-US" | "zh-CN";
  time: TimeValue | null;
};

export type TimePickerSelectDetails = PickerSelectDetails & {
  column: TimePickerColumn;
};

export type FormatTimeValueOptions = {
  hourCycle?: TimePickerHourCycle;
  locale?: "en-US" | "zh-CN";
  precision?: TimePickerPrecision;
};

type TimePickerBaseProps = Omit<
  PickerBaseProps<TimePickerColumnValue>,
  "columnLabels" | "columns" | "defaultValue" | "onConfirm" | "onSelect" | "renderOption" | "value"
> & {
  columnLabels?: Partial<Record<TimePickerColumn, string>>;
  defaultValue?: TimeValue | null;
  filter?: TimePickerFilter;
  hourCycle?: TimePickerHourCycle;
  hourStep?: number;
  max?: TimeValue;
  min?: TimeValue;
  minuteStep?: number;
  onConfirm?: (value: TimeValue) => void;
  onSelect?: (value: TimeValue, details: TimePickerSelectDetails) => void;
  precision?: TimePickerPrecision;
  renderLabel?: (
    column: TimePickerColumn,
    value: TimePickerColumnValue,
    details: TimePickerLabelDetails
  ) => ReactNode;
  secondStep?: number;
  value?: TimeValue | null;
};

export type TimePickerProps = TimePickerBaseProps & PickerAccessibleName;
export type TimePickerOpenChangeDetails = PickerOpenChangeDetails;
