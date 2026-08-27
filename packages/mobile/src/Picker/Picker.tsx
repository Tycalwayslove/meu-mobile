"use client";

import { useId, useRef, useState } from "react";

import { Button } from "../Button";
import { useMeuConfig } from "../ConfigProvider";
import { useControllableOpen } from "../internal/useControllableOpen";
import { Popup } from "../Popup";
import {
  cancelButton,
  confirmButton,
  fadeBottom,
  fadeTop,
  header,
  headerButton,
  popupPanel,
  root,
  selectionWindow,
  title as titleStyle,
  wheels
} from "./Picker.css";
import { PickerWheel } from "./PickerWheel";
import type {
  PickerColumn,
  PickerOpenChangeReason,
  PickerProps,
  PickerSelectReason,
  PickerValue
} from "./types";

function sameValues<TValue extends PickerValue>(
  left: ReadonlyArray<TValue | null>,
  right: ReadonlyArray<TValue | null>
) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function optionForValue<TValue extends PickerValue>(
  column: PickerColumn<TValue>,
  value: TValue | null | undefined
) {
  if (value === null || value === undefined) return null;
  return column.find((option) => !option.disabled && option.value === value) || null;
}

function normalizeValues<TValue extends PickerValue>(
  columns: ReadonlyArray<PickerColumn<TValue>>,
  source: ReadonlyArray<TValue | null> | undefined
) {
  return columns.map((column, index) => {
    const selected = optionForValue(column, source ? source[index] : undefined);
    if (selected) return selected.value;
    const firstEnabled = column.find((option) => !option.disabled);
    return firstEnabled ? firstEnabled.value : null;
  });
}

function resolveOptions<TValue extends PickerValue>(
  columns: ReadonlyArray<PickerColumn<TValue>>,
  values: ReadonlyArray<TValue | null>
) {
  return columns.map((column, index) => optionForValue(column, values[index]));
}

type PickerState<TValue extends PickerValue> = {
  columns: ReadonlyArray<PickerColumn<TValue>>;
  committedValue: Array<TValue | null>;
  draftValue: Array<TValue | null>;
  open: boolean;
  valueSnapshot: ReadonlyArray<TValue | null> | undefined;
};

export function Picker<TValue extends PickerValue = PickerValue>({
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  "data-meu-component": componentName = "picker",
  cancelText,
  className,
  closeOnEscape = true,
  closeOnMaskClick = true,
  columnLabels,
  columns,
  confirmText,
  container,
  defaultOpen = false,
  defaultValue = [],
  forceMount = false,
  lockScroll = true,
  maskOpacity = "default",
  onCancel,
  onConfirm,
  onOpenChange,
  onSelect,
  open,
  ref,
  renderOption,
  restoreFocus = true,
  returnFocusRef,
  safeArea = true,
  title,
  value,
  ...props
}: PickerProps<TValue>) {
  const config = useMeuConfig();
  const generatedId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const controlledValue = value !== undefined;
  const [resolvedOpen, requestOpenChange] = useControllableOpen({
    defaultOpen,
    onOpenChange,
    open
  });
  const [storedState, setStoredState] = useState<PickerState<TValue>>(() => {
    const initialValue = normalizeValues(columns, controlledValue ? value : defaultValue);
    return {
      columns,
      committedValue: initialValue,
      draftValue: initialValue,
      open: resolvedOpen,
      valueSnapshot: controlledValue ? value : undefined
    };
  });
  let pickerState = storedState;
  const openChanged = pickerState.open !== resolvedOpen;
  const columnsChanged = pickerState.columns !== columns;
  const valueModeChanged = (pickerState.valueSnapshot !== undefined) !== controlledValue;
  const controlledValueChanged =
    controlledValue &&
    !sameValues(pickerState.valueSnapshot || [], value === undefined ? [] : value);
  if (openChanged || columnsChanged || valueModeChanged || controlledValueChanged) {
    let nextDraft = pickerState.draftValue;
    if (resolvedOpen) {
      if (!pickerState.open || valueModeChanged || controlledValueChanged) {
        nextDraft = normalizeValues(columns, controlledValue ? value : pickerState.committedValue);
      } else if (columnsChanged) {
        nextDraft = normalizeValues(columns, pickerState.draftValue);
      }
    }
    pickerState = {
      ...pickerState,
      columns,
      draftValue: nextDraft,
      open: resolvedOpen,
      valueSnapshot: controlledValue ? value : undefined
    };
    setStoredState(pickerState);
  }
  const draftValue = pickerState.draftValue;
  const titleId = `meu-picker-title-${generatedId}`;
  const hasTitle = title !== undefined && title !== null;
  const resolvedLabelledby = ariaLabelledby || (!ariaLabel && hasTitle ? titleId : undefined);
  const accessibleNameProps = ariaLabel
    ? ({ "aria-label": ariaLabel } as const)
    : resolvedLabelledby
      ? ({ "aria-labelledby": resolvedLabelledby } as const)
      : ({ "aria-label": config.locale === "en-US" ? "Picker" : "选择器" } as const);
  const localizedCancel =
    cancelText === undefined ? (config.locale === "en-US" ? "Cancel" : "取消") : cancelText;
  const localizedConfirm =
    confirmText === undefined ? (config.locale === "en-US" ? "Confirm" : "确定") : confirmText;
  const canConfirm =
    columns.length > 0 &&
    columns.every((column, index) => optionForValue(column, draftValue[index]) !== null);

  const publishSelection = (columnIndex: number, nextValue: TValue, reason: PickerSelectReason) => {
    const current = normalizeValues(columns, pickerState.draftValue);
    current[columnIndex] = nextValue;
    setStoredState({ ...pickerState, draftValue: current });
    if (onSelect) {
      onSelect(current, resolveOptions(columns, current), { columnIndex, reason });
    }
  };

  const closeAsCancel = (reason: Extract<PickerOpenChangeReason, "cancel" | "escape" | "mask">) => {
    if (onCancel) onCancel({ reason });
    requestOpenChange(false, { reason });
  };

  const confirm = () => {
    if (!canConfirm) return;
    const next = normalizeValues(columns, pickerState.draftValue);
    if (!controlledValue) {
      setStoredState({ ...pickerState, committedValue: next, draftValue: next });
    }
    if (onConfirm) onConfirm(next, resolveOptions(columns, next));
    requestOpenChange(false, { reason: "confirm" });
  };

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
        data-meu-component={componentName}
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
        <div className={wheels}>
          <div className={selectionWindow} aria-hidden="true" />
          <div className={fadeTop} aria-hidden="true" />
          <div className={fadeBottom} aria-hidden="true" />
          {columns.map((column, columnIndex) => (
            <PickerWheel
              column={column}
              columnIndex={columnIndex}
              key={columnIndex}
              label={
                columnLabels && columnLabels[columnIndex]
                  ? columnLabels[columnIndex]
                  : config.locale === "en-US"
                    ? `Column ${columnIndex + 1}`
                    : `第 ${columnIndex + 1} 列`
              }
              renderOption={renderOption}
              value={draftValue[columnIndex] === undefined ? null : draftValue[columnIndex]!}
              onSelect={(nextValue, reason) => publishSelection(columnIndex, nextValue, reason)}
            />
          ))}
        </div>
      </div>
    </Popup>
  );
}
