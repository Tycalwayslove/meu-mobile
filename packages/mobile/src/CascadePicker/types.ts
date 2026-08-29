import type { ReactNode } from "react";

import type {
  PickerAccessibleName,
  PickerBaseProps,
  PickerOption,
  PickerSelectDetails,
  PickerValue
} from "../Picker";

/**
 * Tree option consumed by {@link CascadePicker}. Sibling values must be unique.
 *
 * @public
 */
export type CascadePickerOption<TValue extends PickerValue = PickerValue> = PickerOption<TValue> & {
  /** `undefined` marks a leaf; an empty array keeps an explicit invalid child column. */
  children?: ReadonlyArray<CascadePickerOption<TValue>>;
};

type CascadePickerBaseProps<TValue extends PickerValue> = Omit<
  PickerBaseProps<TValue>,
  "columns" | "onConfirm" | "onSelect" | "renderOption"
> & {
  /** Called on confirmation with the normalized root-to-leaf values and matching options; controlled consumers must update `value`. */
  onConfirm?: (
    value: ReadonlyArray<TValue | null>,
    options: ReadonlyArray<CascadePickerOption<TValue> | null>
  ) => void;
  /** Called as a wheel changes with the normalized descendant path and changed-column metadata. */
  onSelect?: (
    value: ReadonlyArray<TValue | null>,
    options: ReadonlyArray<CascadePickerOption<TValue> | null>,
    details: PickerSelectDetails
  ) => void;
  /** Immutable root options. Replace affected arrays when async data arrives. */
  options: ReadonlyArray<CascadePickerOption<TValue>>;
  /** Renders an option from its tree node, zero-based column index, and selected state. */
  renderOption?: (
    option: CascadePickerOption<TValue>,
    details: { columnIndex: number; selected: boolean }
  ) => ReactNode;
};

/**
 * Props for a confirmation-based cascading wheel picker.
 *
 * @public
 */
export type CascadePickerProps<TValue extends PickerValue = PickerValue> =
  CascadePickerBaseProps<TValue> & PickerAccessibleName;
