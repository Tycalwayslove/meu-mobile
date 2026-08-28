"use client";

import { nativeDateAdapter } from "@meu/date-adapter";
import type { DateAdapter } from "@meu/date-adapter";
import { useId, useMemo, useRef, useState } from "react";

import { Button } from "../Button";
import { Calendar } from "../Calendar";
import type { CalendarRange } from "../Calendar";
import { useMeuConfig } from "../ConfigProvider";
import { useControllableOpen } from "../internal/useControllableOpen";
import { Popup } from "../Popup";
import {
  calendar,
  cancelButton,
  confirmButton,
  content,
  header,
  headerButton,
  popupPanel,
  presetButton,
  presets as presetsStyle,
  root,
  summary,
  title as titleStyle
} from "./DateRangePicker.css";
import { dateRangeIsSelectable, normalizeDateRange, sameDateRange } from "./resolveDateRangePicker";
import type {
  DateRangePickerOpenChangeDetails,
  DateRangePickerOpenChangeReason,
  DateRangePickerProps,
  DateRangePickerSelectDetails
} from "./types";

type DateRangePickerState<TDate> = {
  adapter: DateAdapter<TDate>;
  calendarVersion: number;
  committedValue: CalendarRange<TDate> | null;
  draftComplete: boolean;
  draftValue: CalendarRange<TDate> | null;
  open: boolean;
  valueSnapshot: CalendarRange<TDate> | null | undefined;
};

/**
 * Renders a modal, confirmation-based date range flow composed from Calendar and Popup.
 *
 * @public
 */
export function DateRangePicker<TDate = Date>({
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  adapter,
  calendarAriaLabel,
  cancelText,
  className,
  closeOnEscape = true,
  closeOnMaskClick = true,
  confirmText,
  container,
  defaultMonth,
  defaultOpen = false,
  defaultValue,
  disabled = false,
  disabledDate,
  fixedWeeks = true,
  forceMount = false,
  lockScroll = true,
  maskOpacity = "default",
  max,
  min,
  month,
  onCancel,
  onConfirm,
  onMonthChange,
  onOpenChange,
  onSelect,
  open,
  presets = [],
  presetsAriaLabel,
  ref,
  renderDay,
  renderLabel,
  renderRangeLabel,
  restoreFocus = true,
  returnFocusRef,
  safeArea = true,
  showOutsideDays = true,
  title,
  value,
  weekdayLabels,
  weekStartsOn = 0,
  ...props
}: DateRangePickerProps<TDate>) {
  const config = useMeuConfig();
  const generatedId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const resolvedAdapter = (adapter || nativeDateAdapter) as DateAdapter<TDate>;
  const controlledValue = value !== undefined;
  const [resolvedOpen, requestOpenChange] = useControllableOpen<DateRangePickerOpenChangeDetails>({
    defaultOpen,
    onOpenChange,
    open
  });
  const [storedState, setStoredState] = useState<DateRangePickerState<TDate>>(() => {
    const initialValue = normalizeDateRange(
      resolvedAdapter,
      controlledValue ? value : defaultValue
    );
    return {
      adapter: resolvedAdapter,
      calendarVersion: 0,
      committedValue: initialValue,
      draftComplete: initialValue !== null,
      draftValue: initialValue,
      open: resolvedOpen,
      valueSnapshot: controlledValue ? value : undefined
    };
  });
  let pickerState = storedState;
  const adapterChanged = pickerState.adapter !== resolvedAdapter;
  const openChanged = pickerState.open !== resolvedOpen;
  const valueModeChanged = (pickerState.valueSnapshot !== undefined) !== controlledValue;
  const controlledValueChanged =
    controlledValue && !sameDateRange(resolvedAdapter, pickerState.valueSnapshot, value);

  if (adapterChanged || openChanged || valueModeChanged || controlledValueChanged) {
    let committedValue = pickerState.committedValue;
    let draftValue = pickerState.draftValue;
    let draftComplete = pickerState.draftComplete;
    let calendarVersion = pickerState.calendarVersion;
    if (adapterChanged) {
      committedValue = normalizeDateRange(
        resolvedAdapter,
        controlledValue ? value : committedValue
      );
    }
    if (controlledValue && (controlledValueChanged || adapterChanged)) {
      committedValue = normalizeDateRange(resolvedAdapter, value);
    }
    if (
      resolvedOpen &&
      (adapterChanged || !pickerState.open || valueModeChanged || controlledValueChanged)
    ) {
      draftValue = normalizeDateRange(resolvedAdapter, controlledValue ? value : committedValue);
      draftComplete = draftValue !== null;
      calendarVersion += 1;
    }
    pickerState = {
      adapter: resolvedAdapter,
      calendarVersion,
      committedValue,
      draftComplete,
      draftValue,
      open: resolvedOpen,
      valueSnapshot: controlledValue ? value : undefined
    };
    setStoredState(pickerState);
  }

  const titleId = `meu-date-range-picker-title-${generatedId}`;
  const hasTitle = title !== undefined && title !== null;
  const resolvedLabelledby = ariaLabelledby || (!ariaLabel && hasTitle ? titleId : undefined);
  const accessibleNameProps = ariaLabel
    ? ({ "aria-label": ariaLabel } as const)
    : resolvedLabelledby
      ? ({ "aria-labelledby": resolvedLabelledby } as const)
      : ({
          "aria-label": config.locale === "en-US" ? "Date range picker" : "日期范围选择器"
        } as const);
  const localizedCancel =
    cancelText === undefined ? (config.locale === "en-US" ? "Cancel" : "取消") : cancelText;
  const localizedConfirm =
    confirmText === undefined ? (config.locale === "en-US" ? "Confirm" : "确定") : confirmText;
  const localizedCalendarLabel =
    calendarAriaLabel || (config.locale === "en-US" ? "Date range calendar" : "日期范围日历");
  const localizedPresetsLabel =
    presetsAriaLabel || (config.locale === "en-US" ? "Quick ranges" : "快捷范围");
  const canConfirm =
    pickerState.draftComplete &&
    dateRangeIsSelectable(resolvedAdapter, pickerState.draftValue, {
      disabled,
      ...(disabledDate ? { disabledDate } : {}),
      ...(max === undefined ? {} : { max }),
      ...(min === undefined ? {} : { min })
    });
  const defaultSummary = useMemo(() => {
    if (pickerState.draftValue === null) {
      return config.locale === "en-US" ? "Choose a start date" : "请选择开始日期";
    }
    const start = resolvedAdapter.format(pickerState.draftValue[0], "YYYY-MM-DD", config.locale);
    if (!pickerState.draftComplete) {
      return config.locale === "en-US"
        ? `${start} – choose an end date`
        : `${start} – 请选择结束日期`;
    }
    const end = resolvedAdapter.format(pickerState.draftValue[1], "YYYY-MM-DD", config.locale);
    return `${start} – ${end}`;
  }, [config.locale, pickerState.draftComplete, pickerState.draftValue, resolvedAdapter]);
  const rangeSummary = renderRangeLabel
    ? renderRangeLabel(pickerState.draftValue, {
        adapter: resolvedAdapter,
        complete: pickerState.draftComplete,
        locale: config.locale
      })
    : defaultSummary;

  function closeAsCancel(
    reason: Extract<DateRangePickerOpenChangeReason, "cancel" | "escape" | "mask">
  ) {
    if (onCancel) onCancel({ reason });
    requestOpenChange(false, { reason });
  }

  function confirm() {
    if (!canConfirm || pickerState.draftValue === null) return;
    const nextValue = pickerState.draftValue;
    if (!controlledValue) {
      setStoredState({ ...pickerState, committedValue: nextValue });
    }
    if (onConfirm) onConfirm(nextValue);
    requestOpenChange(false, { reason: "confirm" });
  }

  function publishSelection(
    nextValue: CalendarRange<TDate>,
    details: DateRangePickerSelectDetails<TDate>
  ) {
    setStoredState({
      ...pickerState,
      calendarVersion:
        details.reason === "preset" ? pickerState.calendarVersion + 1 : pickerState.calendarVersion,
      draftComplete: details.complete,
      draftValue: nextValue
    });
    if (onSelect) onSelect(nextValue, details);
  }

  return (
    <Popup
      {...accessibleNameProps}
      {...(container === undefined ? {} : { container })}
      {...(returnFocusRef === undefined ? {} : { returnFocusRef })}
      className={popupPanel}
      closeOnEscape={closeOnEscape}
      closeOnMaskClick={closeOnMaskClick}
      forceMount={forceMount}
      initialFocusRef={cancelRef}
      lockScroll={lockScroll}
      maskOpacity={maskOpacity}
      open={resolvedOpen}
      position="bottom"
      restoreFocus={restoreFocus}
      safeArea={safeArea}
      onOpenChange={(nextOpen, details) => {
        if (nextOpen) return;
        if (details.reason === "mask" || details.reason === "escape") {
          closeAsCancel(details.reason);
        }
      }}
    >
      <div
        {...props}
        ref={ref}
        className={className ? `${root} ${className}` : root}
        data-meu-component="date-range-picker"
        data-range-complete={pickerState.draftComplete ? "true" : "false"}
      >
        <div className={header}>
          <Button
            ref={cancelRef}
            className={`${headerButton} ${cancelButton}`}
            size="small"
            tone="neutral"
            variant="text"
            onClick={() => closeAsCancel("cancel")}
          >
            {localizedCancel}
          </Button>
          {hasTitle ? (
            <h2 className={titleStyle} id={titleId}>
              {title}
            </h2>
          ) : (
            <span aria-hidden="true" />
          )}
          <Button
            className={`${headerButton} ${confirmButton}`}
            disabled={!canConfirm}
            size="small"
            variant="text"
            onClick={confirm}
          >
            {localizedConfirm}
          </Button>
        </div>
        <div className={content}>
          <div className={summary} aria-live="polite">
            {rangeSummary}
          </div>
          {presets.length > 0 ? (
            <ul className={presetsStyle} aria-label={localizedPresetsLabel}>
              {presets.map((preset) => {
                const normalized = normalizeDateRange(resolvedAdapter, preset.value);
                const selectable = dateRangeIsSelectable(resolvedAdapter, normalized, {
                  disabled: Boolean(disabled || preset.disabled),
                  ...(disabledDate ? { disabledDate } : {}),
                  ...(max === undefined ? {} : { max }),
                  ...(min === undefined ? {} : { min })
                });
                return (
                  <li key={preset.key}>
                    <Button
                      className={presetButton}
                      disabled={!selectable}
                      size="small"
                      tone="neutral"
                      variant="outline"
                      onClick={() => {
                        if (normalized === null) return;
                        publishSelection(normalized, {
                          complete: true,
                          presetKey: preset.key,
                          reason: "preset"
                        });
                      }}
                    >
                      {preset.label}
                    </Button>
                  </li>
                );
              })}
            </ul>
          ) : null}
          <Calendar<TDate>
            key={pickerState.calendarVersion}
            {...(defaultMonth === undefined ? {} : { defaultMonth })}
            {...(disabledDate === undefined ? {} : { disabledDate })}
            {...(max === undefined ? {} : { max })}
            {...(min === undefined ? {} : { min })}
            {...(month === undefined ? {} : { month })}
            {...(onMonthChange === undefined ? {} : { onMonthChange })}
            {...(renderDay === undefined ? {} : { renderDay })}
            {...(renderLabel === undefined ? {} : { renderLabel })}
            {...(weekdayLabels === undefined ? {} : { weekdayLabels })}
            className={calendar}
            adapter={resolvedAdapter}
            allowClear={false}
            aria-label={localizedCalendarLabel}
            disabled={disabled}
            fixedWeeks={fixedWeeks}
            selectionMode="range"
            showOutsideDays={showOutsideDays}
            value={pickerState.draftValue}
            weekStartsOn={weekStartsOn}
            onChange={(nextValue, details) => {
              if (nextValue === null) return;
              publishSelection(nextValue, {
                complete: details.complete,
                date: details.date,
                reason: "calendar"
              });
            }}
          />
        </div>
      </div>
    </Popup>
  );
}
