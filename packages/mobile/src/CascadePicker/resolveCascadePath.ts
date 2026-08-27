import type { PickerValue } from "../Picker";
import type { CascadePickerOption } from "./types";

export type ResolvedCascadePath<TValue extends PickerValue> = {
  columns: Array<ReadonlyArray<CascadePickerOption<TValue>>>;
  options: Array<CascadePickerOption<TValue> | null>;
  values: Array<TValue | null>;
};

function optionForValue<TValue extends PickerValue>(
  options: ReadonlyArray<CascadePickerOption<TValue>>,
  value: TValue | null | undefined
) {
  if (value === null || value === undefined) return null;
  return options.find((option) => !option.disabled && option.value === value) || null;
}

export function sameCascadeValues<TValue extends PickerValue>(
  left: ReadonlyArray<TValue | null>,
  right: ReadonlyArray<TValue | null>
) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

export function resolveCascadePath<TValue extends PickerValue>(
  rootOptions: ReadonlyArray<CascadePickerOption<TValue>>,
  source: ReadonlyArray<TValue | null> | undefined
): ResolvedCascadePath<TValue> {
  const columns: Array<ReadonlyArray<CascadePickerOption<TValue>>> = [];
  const options: Array<CascadePickerOption<TValue> | null> = [];
  const values: Array<TValue | null> = [];
  const visitedOptions = new Set<CascadePickerOption<TValue>>();
  let currentOptions = rootOptions;
  let columnIndex = 0;

  while (true) {
    columns.push(currentOptions);
    const selected =
      optionForValue(currentOptions, source ? source[columnIndex] : undefined) ||
      currentOptions.find((option) => !option.disabled) ||
      null;
    options.push(selected);
    values.push(selected ? selected.value : null);

    if (!selected || selected.children === undefined || visitedOptions.has(selected)) break;
    visitedOptions.add(selected);
    currentOptions = selected.children;
    columnIndex += 1;
  }

  return { columns, options, values };
}
