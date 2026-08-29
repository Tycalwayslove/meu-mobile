import type { HTMLAttributes, InputHTMLAttributes, ReactNode, Ref } from "react";

/**
 * Preset control size for a checkbox.
 *
 * @public
 */
export type CheckboxSize = "small" | "medium" | "large";
/**
 * Validation state displayed by a checkbox or checkbox group.
 *
 * @public
 */
export type CheckboxStatus = "default" | "error";
/**
 * Stable scalar identity for a checkbox-group option.
 *
 * @public
 */
export type CheckboxValue = string | number;

/**
 * Props accepted by {@link Checkbox}.
 *
 * @public
 */
export type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "checked" | "children" | "defaultChecked" | "onChange" | "size" | "type" | "value"
> & {
  /** Controls the checked state. Do not combine with `defaultChecked`. */
  checked?: boolean;
  /** Visible label content. The whole label remains a minimum 44×44 CSS px touch target. */
  children?: ReactNode;
  /** Initial state for an uncontrolled checkbox. Native form reset restores this value. */
  defaultChecked?: boolean;
  /** Displays and exposes the native mixed state without changing the submitted value. */
  indeterminate?: boolean;
  /** Called after an accepted native change with the next state and original event. */
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Keeps the control focusable and successful in FormData while preventing user changes. */
  readOnly?: boolean;
  /** Visual and touch-target scale. */
  size?: CheckboxSize;
  /** Visual validation state; use `aria-invalid` or Field for accessible validation. */
  status?: CheckboxStatus;
  /** Native submitted value. Defaults to the browser value `"on"` when omitted. */
  value?: CheckboxValue;
};

/**
 * Props accepted by {@link CheckboxGroup}.
 *
 * @public
 */
export type CheckboxGroupProps<TValue extends CheckboxValue = CheckboxValue> = Omit<
  HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onChange"
> & {
  /** Checkbox descendants that opt into the group by supplying `value`. */
  children: ReactNode;
  /** Initial selected values for an uncontrolled group. Form reset restores this snapshot. */
  defaultValue?: TValue[];
  /** Visual flow of the choices. */
  direction?: "horizontal" | "vertical";
  /** Disables every descendant checkbox and excludes them from FormData. */
  disabled?: boolean;
  /** Shared native form field name for descendant checkboxes. */
  name?: string;
  /** Called with the complete next selection after an accepted change. */
  onChange?: (value: TValue[]) => void;
  /** Prevents changes while preserving focus and current values in FormData. */
  readOnly?: boolean;
  /** Ref to the semantic group container. */
  ref?: Ref<HTMLDivElement>;
  /** Visual validation state for the group and descendants. */
  status?: CheckboxStatus;
  /** Controlled selected values. Passing a new array is required after `onChange`. */
  value?: TValue[];
};
