import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode, Ref, RefObject } from "react";

import type { MaskOpacity } from "../Mask";
import type { OverlayContainer } from "../overlayTypes";

/**
 * Primitive value supported by picker options.
 *
 * @public
 */
export type PickerValue = string | number;

/**
 * One immutable option in a {@link PickerColumn}. Values must be unique within the column.
 *
 * @public
 */
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

/**
 * Ordered options rendered as one independently scrollable wheel.
 *
 * @public
 */
export type PickerColumn<TValue extends PickerValue = PickerValue> = ReadonlyArray<
  PickerOption<TValue>
>;

/**
 * Interaction that requested the picker visibility change.
 *
 * @public
 */
export type PickerOpenChangeReason = "cancel" | "confirm" | "escape" | "mask" | "trigger";

/**
 * Metadata emitted with a picker visibility request.
 *
 * @public
 */
export type PickerOpenChangeDetails = {
  /** Action that requested the picker's visibility change. */
  reason: PickerOpenChangeReason;
};

/**
 * Input path that changed a wheel's draft selection.
 *
 * @public
 */
export type PickerSelectReason = "keyboard" | "pointer" | "scroll";

/**
 * Metadata emitted with an in-panel picker selection.
 *
 * @public
 */
export type PickerSelectDetails = {
  /** Zero-based wheel index whose draft selection changed. */
  columnIndex: number;
  /** Input path that selected the draft option. */
  reason: PickerSelectReason;
};

export type PickerAccessibleName =
  | {
      /** Visible dialog heading and default accessible name. */
      title: ReactNode;
      /** Optional direct name; when omitted, the visible title labels the dialog. */
      "aria-label"?: string;
      /** Optional external labelling relationship; takes precedence over the title. */
      "aria-labelledby"?: string;
    }
  | {
      /** Omitted when an ARIA attribute names the dialog. */
      title?: undefined;
      /** Direct accessible name required when no visible title is supplied. */
      "aria-label": string;
      /** Mutually exclusive with `aria-label`. */
      "aria-labelledby"?: never;
    }
  | {
      /** Omitted when an ARIA attribute names the dialog. */
      title?: undefined;
      /** Mutually exclusive with `aria-labelledby`. */
      "aria-label"?: never;
      /** ID of an external element that labels a titleless picker. */
      "aria-labelledby": string;
    };

export type PickerBaseProps<TValue extends PickerValue> = Omit<
  HTMLAttributes<HTMLDivElement>,
  "aria-label" | "aria-labelledby" | "children" | "defaultValue" | "onSelect" | "title"
> & {
  /** Component identifier forwarded to the picker root. @defaultValue "picker" */
  "data-meu-component"?: string;
  /** Cancel action content. Defaults to the ConfigProvider locale. */
  cancelText?: ReactNode;
  /** Lets Escape discard the draft and request closure. @defaultValue true */
  closeOnEscape?: boolean;
  /** Lets a mask press discard the draft and request closure. @defaultValue true */
  closeOnMaskClick?: boolean;
  /** Accessible names for each wheel; localized positional names are the fallback. */
  columnLabels?: ReadonlyArray<string>;
  /** Immutable wheel definitions. Replace the array when options change. */
  columns: ReadonlyArray<PickerColumn<TValue>>;
  /** Confirm action content. Defaults to the ConfigProvider locale. */
  confirmText?: ReactNode;
  /** Portal target; `null` renders next to the caller. Defaults to ConfigProvider's target. */
  container?: OverlayContainer;
  /** Initial visibility for uncontrolled usage. @defaultValue false */
  defaultOpen?: boolean;
  /** Initial committed value for uncontrolled usage. Invalid values normalize silently. */
  defaultValue?: ReadonlyArray<TValue | null>;
  /** Keeps the closed picker mounted and hidden after hydration. @defaultValue false */
  forceMount?: boolean;
  /** Prevents document-body scrolling while open. @defaultValue true */
  lockScroll?: boolean;
  /** Backdrop opacity token. @defaultValue "default" */
  maskOpacity?: MaskOpacity;
  /** Reports a discarded draft and the dismissal source. */
  onCancel?: (details: { reason: "cancel" | "escape" | "mask" }) => void;
  /** Reports a valid confirmed draft. Controlled callers must update `value` themselves. */
  onConfirm?: (
    value: ReadonlyArray<TValue | null>,
    options: ReadonlyArray<PickerOption<TValue> | null>
  ) => void;
  /** Reports visibility requests after cancel, confirm, trigger, Escape, or mask interaction. */
  onOpenChange?: (open: boolean, details: PickerOpenChangeDetails) => void;
  /** Reports an in-panel draft change without committing it. */
  onSelect?: (
    value: ReadonlyArray<TValue | null>,
    options: ReadonlyArray<PickerOption<TValue> | null>,
    details: PickerSelectDetails
  ) => void;
  /** Controlled visibility. */
  open?: boolean;
  /** Ref to the picker content root inside the popup. */
  ref?: Ref<HTMLDivElement>;
  /** Customizes visible option content; it must not introduce nested interactive controls. */
  renderOption?: (
    option: PickerOption<TValue>,
    details: { columnIndex: number; selected: boolean }
  ) => ReactNode;
  /** Restores focus after close when focus remains inside the picker. @defaultValue true */
  restoreFocus?: boolean;
  /** Explicit focus-restoration target; otherwise the previously focused element is used. */
  returnFocusRef?: RefObject<HTMLElement | null>;
  /** Adds the bottom device safe-area inset. @defaultValue true */
  safeArea?: boolean;
  /** Controlled committed value. The open panel keeps an isolated draft until confirmation. */
  value?: ReadonlyArray<TValue | null>;
};

/**
 * Props for the confirmation-based wheel picker.
 *
 * @public
 */
export type PickerProps<TValue extends PickerValue = PickerValue> = PickerBaseProps<TValue> &
  PickerAccessibleName;

/**
 * Visual validation state for PickerTrigger.
 *
 * @public
 */
export type PickerTriggerStatus = "default" | "error";

/**
 * Props for the Field-aware picker trigger button.
 *
 * @public
 */
export type PickerTriggerProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-required" | "children" | "value"
> & {
  /** Mirrors the associated popup state through `aria-expanded`. */
  open?: boolean;
  /** Content shown when `value` is absent. */
  placeholder?: ReactNode;
  /** Ref to the native trigger button. */
  ref?: Ref<HTMLButtonElement>;
  /**
   * Visual validation state. `error` and Field errors expose `aria-invalid="true"` on the native
   * button; otherwise caller grammar, spelling, true, and false tokens are preserved.
   */
  status?: PickerTriggerStatus;
  /** Committed value summary. */
  value?: ReactNode;
};
