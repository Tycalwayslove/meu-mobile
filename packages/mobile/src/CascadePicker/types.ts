import type { ReactNode } from "react";

import type {
  PickerAccessibleName,
  PickerBaseProps,
  PickerOption,
  PickerSelectDetails,
  PickerValue
} from "../Picker";

/** Tree option consumed by {@link CascadePicker}. Sibling values must be unique. */
export type CascadePickerOption<TValue extends PickerValue = PickerValue> = PickerOption<TValue> & {
  /** `undefined` marks a leaf; an empty array keeps an explicit invalid child column. */
  children?: ReadonlyArray<CascadePickerOption<TValue>>;
};

type CascadePickerBaseProps<TValue extends PickerValue> = Omit<
  PickerBaseProps<TValue>,
  "columns" | "onConfirm" | "onSelect" | "renderOption"
> & {
  onConfirm?: (
    value: ReadonlyArray<TValue | null>,
    options: ReadonlyArray<CascadePickerOption<TValue> | null>
  ) => void;
  onSelect?: (
    value: ReadonlyArray<TValue | null>,
    options: ReadonlyArray<CascadePickerOption<TValue> | null>,
    details: PickerSelectDetails
  ) => void;
  /** Immutable root options. Replace affected arrays when async data arrives. */
  options: ReadonlyArray<CascadePickerOption<TValue>>;
  renderOption?: (
    option: CascadePickerOption<TValue>,
    details: { columnIndex: number; selected: boolean }
  ) => ReactNode;
};

export type CascadePickerProps<TValue extends PickerValue = PickerValue> =
  CascadePickerBaseProps<TValue> & PickerAccessibleName;
