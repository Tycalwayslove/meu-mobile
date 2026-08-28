import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode, Ref, RefObject } from "react";

import type { MaskOpacity } from "../Mask";
import type { OverlayContainer } from "../overlayTypes";

/** Primitive value supported by picker options. */
export type PickerValue = string | number;

/** One immutable option in a {@link PickerColumn}. Values must be unique within the column. */
export type PickerOption<TValue extends PickerValue = PickerValue> = {
  /** Prevents pointer, keyboard, and settled-scroll selection. */
  disabled?: boolean;
  /** Visible option content. Provide `textValue` when this is not plain text. */
  label: ReactNode;
  /** Stable accessible and type-ahead text for rich labels. */
  textValue?: string;
  /** Business value returned by picker events. */
  value: TValue;
};

/** Ordered options rendered as one independently scrollable wheel. */
export type PickerColumn<TValue extends PickerValue = PickerValue> = ReadonlyArray<
  PickerOption<TValue>
>;

export type PickerOpenChangeReason = "cancel" | "confirm" | "escape" | "mask" | "trigger";

export type PickerOpenChangeDetails = {
  reason: PickerOpenChangeReason;
};

export type PickerSelectReason = "keyboard" | "pointer" | "scroll";

export type PickerSelectDetails = {
  columnIndex: number;
  reason: PickerSelectReason;
};

export type PickerAccessibleName =
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

export type PickerBaseProps<TValue extends PickerValue> = Omit<
  HTMLAttributes<HTMLDivElement>,
  "aria-label" | "aria-labelledby" | "children" | "defaultValue" | "onSelect" | "title"
> & {
  "data-meu-component"?: string;
  /** Cancel action content. Defaults to the ConfigProvider locale. */
  cancelText?: ReactNode;
  closeOnEscape?: boolean;
  closeOnMaskClick?: boolean;
  /** Accessible names for each wheel; localized positional names are the fallback. */
  columnLabels?: ReadonlyArray<string>;
  /** Immutable wheel definitions. Replace the array when options change. */
  columns: ReadonlyArray<PickerColumn<TValue>>;
  /** Confirm action content. Defaults to the ConfigProvider locale. */
  confirmText?: ReactNode;
  container?: OverlayContainer;
  defaultOpen?: boolean;
  /** Initial committed value for uncontrolled usage. Invalid values normalize silently. */
  defaultValue?: ReadonlyArray<TValue | null>;
  forceMount?: boolean;
  lockScroll?: boolean;
  maskOpacity?: MaskOpacity;
  /** Reports a discarded draft and the dismissal source. */
  onCancel?: (details: { reason: "cancel" | "escape" | "mask" }) => void;
  /** Reports a valid confirmed draft. Controlled callers must update `value` themselves. */
  onConfirm?: (
    value: ReadonlyArray<TValue | null>,
    options: ReadonlyArray<PickerOption<TValue> | null>
  ) => void;
  onOpenChange?: (open: boolean, details: PickerOpenChangeDetails) => void;
  /** Reports an in-panel draft change without committing it. */
  onSelect?: (
    value: ReadonlyArray<TValue | null>,
    options: ReadonlyArray<PickerOption<TValue> | null>,
    details: PickerSelectDetails
  ) => void;
  open?: boolean;
  ref?: Ref<HTMLDivElement>;
  /** Customizes visible option content; it must not introduce nested interactive controls. */
  renderOption?: (
    option: PickerOption<TValue>,
    details: { columnIndex: number; selected: boolean }
  ) => ReactNode;
  restoreFocus?: boolean;
  returnFocusRef?: RefObject<HTMLElement | null>;
  safeArea?: boolean;
  /** Controlled committed value. The open panel keeps an isolated draft until confirmation. */
  value?: ReadonlyArray<TValue | null>;
};

export type PickerProps<TValue extends PickerValue = PickerValue> = PickerBaseProps<TValue> &
  PickerAccessibleName;

export type PickerTriggerStatus = "default" | "error";

export type PickerTriggerProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-required" | "children" | "value"
> & {
  /** Mirrors the associated popup state through `aria-expanded`. */
  open?: boolean;
  /** Content shown when `value` is absent. */
  placeholder?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
  /** Visual validation state; Field context errors also resolve to `error`. */
  status?: PickerTriggerStatus;
  /** Committed value summary. */
  value?: ReactNode;
};
