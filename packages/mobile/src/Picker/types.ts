import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode, Ref, RefObject } from "react";

import type { MaskOpacity } from "../Mask";
import type { OverlayContainer } from "../overlayTypes";

export type PickerValue = string | number;

export type PickerOption<TValue extends PickerValue = PickerValue> = {
  disabled?: boolean;
  label: ReactNode;
  textValue?: string;
  value: TValue;
};

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
  cancelText?: ReactNode;
  closeOnEscape?: boolean;
  closeOnMaskClick?: boolean;
  columnLabels?: ReadonlyArray<string>;
  columns: ReadonlyArray<PickerColumn<TValue>>;
  confirmText?: ReactNode;
  container?: OverlayContainer;
  defaultOpen?: boolean;
  defaultValue?: ReadonlyArray<TValue | null>;
  forceMount?: boolean;
  lockScroll?: boolean;
  maskOpacity?: MaskOpacity;
  onCancel?: (details: { reason: "cancel" | "escape" | "mask" }) => void;
  onConfirm?: (
    value: ReadonlyArray<TValue | null>,
    options: ReadonlyArray<PickerOption<TValue> | null>
  ) => void;
  onOpenChange?: (open: boolean, details: PickerOpenChangeDetails) => void;
  onSelect?: (
    value: ReadonlyArray<TValue | null>,
    options: ReadonlyArray<PickerOption<TValue> | null>,
    details: PickerSelectDetails
  ) => void;
  open?: boolean;
  ref?: Ref<HTMLDivElement>;
  renderOption?: (
    option: PickerOption<TValue>,
    details: { columnIndex: number; selected: boolean }
  ) => ReactNode;
  restoreFocus?: boolean;
  returnFocusRef?: RefObject<HTMLElement | null>;
  safeArea?: boolean;
  value?: ReadonlyArray<TValue | null>;
};

export type PickerProps<TValue extends PickerValue = PickerValue> = PickerBaseProps<TValue> &
  PickerAccessibleName;

export type PickerTriggerStatus = "default" | "error";

export type PickerTriggerProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-required" | "children" | "value"
> & {
  open?: boolean;
  placeholder?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
  status?: PickerTriggerStatus;
  value?: ReactNode;
};
