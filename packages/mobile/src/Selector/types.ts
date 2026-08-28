import type { ChangeEvent, HTMLAttributes, MouseEvent, ReactNode, Ref } from "react";

/** Selector touch-target and typography scale. @public */
export type SelectorSize = "small" | "medium" | "large";
/** Selector validation presentation. @public */
export type SelectorStatus = "default" | "error";
/** Primitive value used as the stable identity of a Selector option. @public */
export type SelectorValue = string | number;

/** One native radio or checkbox option rendered by Selector. @public */
export type SelectorOption<TValue extends SelectorValue = SelectorValue> = {
  /** Accessible name override for labels that do not expose useful text. */
  ariaLabel?: string;
  /** Secondary explanation announced after the option name. */
  description?: ReactNode;
  /** Disables the option and excludes its identity from selection, validation, and form data. @defaultValue false */
  disabled?: boolean;
  /** Visible option content. Do not include nested interactive elements. */
  label: ReactNode;
  /** Unique option identity and native form value. */
  value: TValue;
};

/** Metadata emitted after a direct Selector interaction. @public */
export type SelectorChangeDetails<TValue extends SelectorValue = SelectorValue> = {
  /** Native event that caused the update. */
  event: ChangeEvent<HTMLInputElement> | MouseEvent<HTMLInputElement>;
  /** Option that was toggled or cleared. */
  option: SelectorOption<TValue>;
  /** Distinguishes a normal option update from clearing the active single option. */
  source: "option" | "clear";
};

/** Props for the native radio/checkbox-backed Selector. @public */
export type SelectorProps<TValue extends SelectorValue = SelectorValue> = Omit<
  HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onChange"
> & {
  /** Allows an optional single selection to be cleared by activating it again. Ignored when required. @defaultValue true */
  allowClear?: boolean;
  /** Number of equal-width grid columns, clamped to 1–6. @defaultValue 2 */
  columns?: number;
  /** Initial selected identities for an uncontrolled Selector. */
  defaultValue?: TValue[];
  /** Disables every option without discarding selection. @defaultValue false */
  disabled?: boolean;
  /** Associates all native inputs with a form by id, including outside that form. */
  form?: string;
  /** Switches from one native radio group to independent native checkboxes. @defaultValue false */
  multiple?: boolean;
  /** Native form field name shared by the options. A stable private name is generated when omitted. */
  name?: string;
  /** Called after user interaction with values and options normalized into source option order. */
  onChange?: (
    value: TValue[],
    options: SelectorOption<TValue>[],
    details?: SelectorChangeDetails<TValue>
  ) => void;
  /** Available options. Values are identities and must be unique; the first duplicate wins. */
  options: readonly SelectorOption<TValue>[];
  /** Root element ref. Calling `focus()` forwards focus to the checked or first enabled native input. */
  ref?: Ref<HTMLDivElement>;
  /** Requires one selection using native constraint validation. @defaultValue false */
  required?: boolean;
  /** Shows a visual check in selected cards. @defaultValue true */
  showCheckMark?: boolean;
  /** Controls minimum touch-target height and spacing. @defaultValue "medium" */
  size?: SelectorSize;
  /** Applies validation styling and `aria-invalid`. @defaultValue "default" */
  status?: SelectorStatus;
  /** Selected identities for a controlled Selector. */
  value?: TValue[];
};
