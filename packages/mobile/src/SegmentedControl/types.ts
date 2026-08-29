import type { ChangeEvent, HTMLAttributes, ReactNode, Ref } from "react";

/** Primitive value used as the stable identity of a SegmentedControl option. @public */
export type SegmentedControlValue = string | number;
/** SegmentedControl touch-target and typography scale. @public */
export type SegmentedControlSize = "small" | "medium" | "large";
/** SegmentedControl validation presentation. @public */
export type SegmentedControlStatus = "default" | "error";

/** One mutually exclusive native radio option. @public */
export type SegmentedControlOption<TValue extends SegmentedControlValue = SegmentedControlValue> = {
  /** Accessible name override for labels that do not expose useful text. */
  ariaLabel?: string;
  /** Disables the option and excludes its identity from selection, validation, and form data. @defaultValue false */
  disabled?: boolean;
  /** Decorative leading icon. It is hidden from assistive technology. */
  icon?: ReactNode;
  /** Visible option content. Do not include nested interactive elements. */
  label: ReactNode;
  /** Unique option identity and native form value. */
  value: TValue;
};

/** Props for the native radio-backed SegmentedControl. @public */
export type SegmentedControlProps<TValue extends SegmentedControlValue = SegmentedControlValue> =
  Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> & {
    /** Expands all options evenly across the available inline width. @defaultValue false */
    block?: boolean;
    /** Initial identity for an uncontrolled control; the first enabled option is used when omitted. */
    defaultValue?: TValue;
    /** Disables every option without discarding selection. @defaultValue false */
    disabled?: boolean;
    /** Associates all native radios with a form by id, including outside that form. */
    form?: string;
    /** Native form field name shared by the radios. A stable private name is generated when omitted. */
    name?: string;
    /** Called after the user selects an enabled option. */
    onChange?: (value: TValue, event: ChangeEvent<HTMLInputElement>) => void;
    /** Available options. Values are identities and must be unique; the first duplicate wins. */
    options: readonly SegmentedControlOption<TValue>[];
    /** Root element ref. Calling `focus()` forwards focus to the checked or first enabled native radio. */
    ref?: Ref<HTMLDivElement>;
    /** Requires one selection using native radio-group constraint validation. @defaultValue false */
    required?: boolean;
    /** Controls minimum touch-target height and typography. @defaultValue "medium" */
    size?: SegmentedControlSize;
    /** Applies validation styling and `aria-invalid="true"`; caller grammar/spelling tokens are otherwise preserved on the radiogroup. @defaultValue "default" */
    status?: SegmentedControlStatus;
    /** Selected identity for a controlled control; `null` intentionally leaves every option unchecked. */
    value?: TValue | null;
  };
