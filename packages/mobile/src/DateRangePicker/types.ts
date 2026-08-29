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

/**
 * Interaction that requested a range picker's open state.
 *
 * @public
 */
export type DateRangePickerOpenChangeReason = "cancel" | "confirm" | "escape" | "mask" | "trigger";

/**
 * Details reported with a range-picker open-state request.
 *
 * @public
 */
export type DateRangePickerOpenChangeDetails = {
  /** Interaction that requested the open-state change. */
  reason: DateRangePickerOpenChangeReason;
};

/** A stable, precomputed range offered as a draft shortcut. @public */
export type DateRangePickerPreset<TDate> = {
  /** Prevents the preset from being selected. @defaultValue false */
  disabled?: boolean;
  /** Stable identity reported to `onSelect`. */
  key: string;
  /** Content of the preset button. */
  label: ReactNode;
  /** Inclusive endpoints; they normalize to calendar-day boundaries and ascending order. */
  value: CalendarRange<TDate>;
};

/**
 * Details reported when calendar interaction updates the draft range.
 *
 * @public
 */
export type DateRangePickerCalendarSelectDetails<TDate> = {
  /** Whether the user has selected both range endpoints. */
  complete: boolean;
  /** Normalized day selected in the calendar. */
  date: TDate;
  /** Indicates that the draft came from the calendar. */
  reason: "calendar";
};

/**
 * Details reported when a preset supplies a complete draft range.
 *
 * @public
 */
export type DateRangePickerPresetSelectDetails = {
  /** Presets always provide both endpoints. */
  complete: true;
  /** Key of the selected preset. */
  presetKey: string;
  /** Indicates that the draft came from a preset button. */
  reason: "preset";
};

/**
 * Source-specific details reported with a draft range update.
 *
 * @public
 */
export type DateRangePickerSelectDetails<TDate> =
  DateRangePickerCalendarSelectDetails<TDate> | DateRangePickerPresetSelectDetails;

type DateRangePickerAccessibleName =
  | {
      /** Visible heading used as the popup's accessible name when no ARIA name is supplied. */
      title: ReactNode;
      /** Explicit accessible name; overrides the title-derived name. */
      "aria-label"?: string;
      /** ID of an external element that names the picker. */
      "aria-labelledby"?: string;
    }
  | {
      /** Omitted when the picker is named directly with `aria-label`. */
      title?: undefined;
      /** Accessible name required when no visible title is rendered. */
      "aria-label": string;
      "aria-labelledby"?: never;
    }
  | {
      /** Omitted when an external element supplies the accessible name. */
      title?: undefined;
      "aria-label"?: never;
      /** ID of the external element that names the picker. */
      "aria-labelledby": string;
    };

type DateRangePickerBaseProps<TDate> = Omit<
  HTMLAttributes<HTMLDivElement>,
  "aria-label" | "aria-labelledby" | "children" | "defaultValue" | "onSelect" | "title"
> & {
  /** Date arithmetic and conversion implementation. Defaults to the native `Date` adapter. */
  adapter?: DateAdapter<TDate>;
  /** Accessible name for the embedded range calendar. Defaults to localized text. */
  calendarAriaLabel?: string;
  /** Cancel-button content. Defaults to localized text. */
  cancelText?: ReactNode;
  /** Whether Escape cancels the draft and requests dismissal. @defaultValue true */
  closeOnEscape?: boolean;
  /** Whether pressing the backdrop cancels the draft and requests dismissal. @defaultValue true */
  closeOnMaskClick?: boolean;
  /** Confirm-button content. Defaults to localized text. */
  confirmText?: ReactNode;
  /** Portal host, or a resolver that returns it. Defaults to the configured overlay container or `document.body`. */
  container?: OverlayContainer;
  /** Initial visible calendar month when `month` is uncontrolled. */
  defaultMonth?: TDate;
  /** Initial open state when `open` is uncontrolled. @defaultValue false */
  defaultOpen?: boolean;
  /** Initial committed range when `value` is uncontrolled. @defaultValue null */
  defaultValue?: CalendarRange<TDate> | null;
  /** Disables calendar selection, presets, and confirmation while leaving cancellation available. @defaultValue false */
  disabled?: boolean;
  /** Returns whether a candidate calendar day is unavailable; preset validation checks its endpoints. */
  disabledDate?: (date: TDate, details: CalendarDisabledDateDetails<TDate>) => boolean;
  /** Always renders a six-week calendar grid instead of the minimum full-week grid. @defaultValue true */
  fixedWeeks?: boolean;
  /** Keeps the popup mounted while closed, which preserves its subtree state. @defaultValue false */
  forceMount?: boolean;
  /** Prevents document scrolling while the picker is open. @defaultValue true */
  lockScroll?: boolean;
  /** Backdrop opacity preset or numeric opacity. @defaultValue "default" */
  maskOpacity?: MaskOpacity;
  /** Inclusive latest selectable endpoint and latest navigable calendar month. */
  max?: TDate;
  /** Inclusive earliest selectable endpoint and earliest navigable calendar month. */
  min?: TDate;
  /** Controlled visible calendar month; pair with `onMonthChange` to accept navigation requests. */
  month?: TDate;
  /** Called before cancellation closes the picker, with the cancel, Escape, or backdrop reason. */
  onCancel?: (details: { reason: "cancel" | "escape" | "mask" }) => void;
  /** Called with a complete, selectable draft before confirmation requests dismissal. */
  onConfirm?: (value: CalendarRange<TDate>) => void;
  /** Called when the embedded calendar requests another month. */
  onMonthChange?: (month: TDate, details: CalendarMonthChangeDetails) => void;
  /** Called when cancellation or confirmation requests an open-state change. */
  onOpenChange?: (open: boolean, details: DateRangePickerOpenChangeDetails) => void;
  /** Called whenever calendar or preset interaction changes the uncommitted draft range. */
  onSelect?: (value: CalendarRange<TDate>, details: DateRangePickerSelectDetails<TDate>) => void;
  /** Controlled open state; pair with `onOpenChange` to accept dismissal requests. */
  open?: boolean;
  /** Precomputed quick ranges; invalid, out-of-bounds, or disabled presets render disabled. @defaultValue [] */
  presets?: ReadonlyArray<DateRangePickerPreset<TDate>>;
  /** Accessible name for the preset list. Defaults to localized “Quick ranges” text. */
  presetsAriaLabel?: string;
  /** Ref to the picker content inside the popup panel. */
  ref?: Ref<HTMLDivElement>;
  /** Replaces the visible calendar day number while retaining the calendar's accessible date label. */
  renderDay?: (day: number, details: CalendarDayDetails<TDate>) => ReactNode;
  /** Renders secondary visual content below a calendar day number. */
  renderLabel?: (date: TDate, details: CalendarDayDetails<TDate>) => ReactNode;
  /** Renders the live draft summary from its normalized value, completion state, adapter, and locale. */
  renderRangeLabel?: (
    value: CalendarRange<TDate> | null,
    details: {
      adapter: DateAdapter<TDate>;
      complete: boolean;
      locale: "en-US" | "zh-CN";
    }
  ) => ReactNode;
  /** Returns focus to the prior or explicit return target after the picker closes. @defaultValue true */
  restoreFocus?: boolean;
  /** Explicit focus-return target; otherwise the element focused before opening is used. */
  returnFocusRef?: RefObject<HTMLElement | null>;
  /** Adds bottom safe-area padding to the popup. @defaultValue true */
  safeArea?: boolean;
  /** Displays selectable days from adjacent months in the embedded calendar. @defaultValue true */
  showOutsideDays?: boolean;
  /** Controlled committed range; opening resets the draft from this value. */
  value?: CalendarRange<TDate> | null;
  /** Seven weekday labels in Sunday-first order; other lengths fall back to localized labels. */
  weekdayLabels?: ReadonlyArray<string>;
  /** JavaScript weekday index placed in the first calendar column. @defaultValue 0 */
  weekStartsOn?: CalendarWeekStartsOn;
};

/** Props for the modal confirmation-based range picker. @public */
export type DateRangePickerProps<TDate = Date> = DateRangePickerBaseProps<TDate> &
  DateRangePickerAccessibleName;

export type { CalendarRange, DateAdapter };
