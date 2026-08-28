"use client";

import { useMemo, useState } from "react";

import { useControllableOpen } from "../internal/useControllableOpen";
import { Picker } from "../Picker";
import type { PickerOpenChangeDetails, PickerValue } from "../Picker";
import { resolveCascadePath, sameCascadeValues } from "./resolveCascadePath";
import type { CascadePickerOption, CascadePickerProps } from "./types";

type CascadePickerState<TValue extends PickerValue> = {
  committedValue: Array<TValue | null>;
  draftValue: Array<TValue | null>;
  open: boolean;
  options: ReadonlyArray<CascadePickerOption<TValue>>;
  valueSnapshot: ReadonlyArray<TValue | null> | undefined;
};

/** Tree-to-wheel adapter that commits one normalized root-to-leaf path. @public */
export function CascadePicker<TValue extends PickerValue = PickerValue>({
  defaultOpen = false,
  defaultValue = [],
  onConfirm,
  onOpenChange,
  onSelect,
  open,
  options,
  renderOption,
  value,
  ...pickerProps
}: CascadePickerProps<TValue>) {
  const controlledValue = value !== undefined;
  const [resolvedOpen, requestOpenChange] = useControllableOpen<PickerOpenChangeDetails>({
    defaultOpen,
    onOpenChange,
    open
  });
  const [storedState, setStoredState] = useState<CascadePickerState<TValue>>(() => {
    const initialPath = resolveCascadePath(options, controlledValue ? value : defaultValue);
    return {
      committedValue: initialPath.values,
      draftValue: initialPath.values,
      open: resolvedOpen,
      options,
      valueSnapshot: controlledValue ? value : undefined
    };
  });
  let pickerState = storedState;
  const openChanged = pickerState.open !== resolvedOpen;
  const optionsChanged = pickerState.options !== options;
  const valueModeChanged = (pickerState.valueSnapshot !== undefined) !== controlledValue;
  const controlledValueChanged =
    controlledValue &&
    !sameCascadeValues(pickerState.valueSnapshot || [], value === undefined ? [] : value);

  if (openChanged || optionsChanged || valueModeChanged || controlledValueChanged) {
    let nextCommittedValue = pickerState.committedValue;
    let nextDraftValue = pickerState.draftValue;

    if (!controlledValue && pickerState.valueSnapshot !== undefined) {
      nextCommittedValue = resolveCascadePath(options, pickerState.valueSnapshot).values;
    }
    if (resolvedOpen) {
      if (!pickerState.open || valueModeChanged || controlledValueChanged) {
        nextDraftValue = resolveCascadePath(
          options,
          controlledValue ? value : nextCommittedValue
        ).values;
      } else if (optionsChanged) {
        nextDraftValue = resolveCascadePath(options, pickerState.draftValue).values;
      }
    }

    pickerState = {
      committedValue: nextCommittedValue,
      draftValue: nextDraftValue,
      open: resolvedOpen,
      options,
      valueSnapshot: controlledValue ? value : undefined
    };
    setStoredState(pickerState);
  }

  const resolvedPath = useMemo(
    () => resolveCascadePath(options, pickerState.draftValue),
    [options, pickerState.draftValue]
  );

  return (
    <Picker<TValue>
      {...pickerProps}
      data-meu-component="cascade-picker"
      columns={resolvedPath.columns}
      open={resolvedOpen}
      value={resolvedPath.values}
      {...(renderOption
        ? {
            renderOption: (option, details) => renderOption(option, details)
          }
        : {})}
      onConfirm={(nextValue) => {
        const nextPath = resolveCascadePath(options, nextValue);
        if (!controlledValue) {
          setStoredState({
            ...pickerState,
            committedValue: nextPath.values,
            draftValue: nextPath.values
          });
        }
        if (onConfirm) onConfirm(nextPath.values, nextPath.options);
      }}
      onOpenChange={(nextOpen, details) => requestOpenChange(nextOpen, details)}
      onSelect={(nextValue, _selectedOptions, details) => {
        const nextPath = resolveCascadePath(options, nextValue.slice(0, details.columnIndex + 1));
        setStoredState({ ...pickerState, draftValue: nextPath.values });
        if (onSelect) onSelect(nextPath.values, nextPath.options, details);
      }}
    />
  );
}
