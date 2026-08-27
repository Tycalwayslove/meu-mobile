import type { DateAdapter } from "@meu/date-adapter";
import type { HTMLAttributes, ReactNode, Ref, RefObject } from "react";

import type {
  CalendarDayDetails,
  CalendarDisabledDateDetails,
  CalendarMonthChangeDetails,
  CalendarRange,
  CalendarWeekStartsOn
} from "../Calendar";
import type { MaskOpacity } from "../Mask";
import type { OverlayContainer } from "../overlayTypes";

export type DateRangePickerOpenChangeReason = "cancel" | "confirm" | "escape" | "mask" | "trigger";

export type DateRangePickerOpenChangeDetails = {
  reason: DateRangePickerOpenChangeReason;
};

export type DateRangePickerPreset<TDate> = {
  disabled?: boolean;
  key: string;
  label: ReactNode;
  value: CalendarRange<TDate>;
};

export type DateRangePickerCalendarSelectDetails<TDate> = {
  complete: boolean;
  date: TDate;
  reason: "calendar";
};

export type DateRangePickerPresetSelectDetails = {
  complete: true;
  presetKey: string;
  reason: "preset";
};

export type DateRangePickerSelectDetails<TDate> =
  DateRangePickerCalendarSelectDetails<TDate> | DateRangePickerPresetSelectDetails;

type DateRangePickerAccessibleName =
  | {
      title: ReactNode;
      "aria-label"?: string;
      "aria-labelledby"?: string;
    }
  | {
      title?: undefined;
      "aria-label": string;
      "aria-labelledby"?: never;
    }
  | {
      title?: undefined;
      "aria-label"?: never;
      "aria-labelledby": string;
    };

type DateRangePickerBaseProps<TDate> = Omit<
  HTMLAttributes<HTMLDivElement>,
  "aria-label" | "aria-labelledby" | "children" | "defaultValue" | "onSelect" | "title"
> & {
  adapter?: DateAdapter<TDate>;
  calendarAriaLabel?: string;
  cancelText?: ReactNode;
  closeOnEscape?: boolean;
  closeOnMaskClick?: boolean;
  confirmText?: ReactNode;
  container?: OverlayContainer;
  defaultMonth?: TDate;
  defaultOpen?: boolean;
  defaultValue?: CalendarRange<TDate> | null;
  disabled?: boolean;
  disabledDate?: (date: TDate, details: CalendarDisabledDateDetails<TDate>) => boolean;
  fixedWeeks?: boolean;
  forceMount?: boolean;
  lockScroll?: boolean;
  maskOpacity?: MaskOpacity;
  max?: TDate;
  min?: TDate;
  month?: TDate;
  onCancel?: (details: { reason: "cancel" | "escape" | "mask" }) => void;
  onConfirm?: (value: CalendarRange<TDate>) => void;
  onMonthChange?: (month: TDate, details: CalendarMonthChangeDetails) => void;
  onOpenChange?: (open: boolean, details: DateRangePickerOpenChangeDetails) => void;
  onSelect?: (value: CalendarRange<TDate>, details: DateRangePickerSelectDetails<TDate>) => void;
  open?: boolean;
  presets?: ReadonlyArray<DateRangePickerPreset<TDate>>;
  presetsAriaLabel?: string;
  ref?: Ref<HTMLDivElement>;
  renderDay?: (day: number, details: CalendarDayDetails<TDate>) => ReactNode;
  renderLabel?: (date: TDate, details: CalendarDayDetails<TDate>) => ReactNode;
  renderRangeLabel?: (
    value: CalendarRange<TDate> | null,
    details: {
      adapter: DateAdapter<TDate>;
      complete: boolean;
      locale: "en-US" | "zh-CN";
    }
  ) => ReactNode;
  restoreFocus?: boolean;
  returnFocusRef?: RefObject<HTMLElement | null>;
  safeArea?: boolean;
  showOutsideDays?: boolean;
  value?: CalendarRange<TDate> | null;
  weekdayLabels?: ReadonlyArray<string>;
  weekStartsOn?: CalendarWeekStartsOn;
};

export type DateRangePickerProps<TDate = Date> = DateRangePickerBaseProps<TDate> &
  DateRangePickerAccessibleName;

export type { CalendarRange, DateAdapter };
