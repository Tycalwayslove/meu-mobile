import type { HTMLAttributes, InputHTMLAttributes, ReactNode, Ref } from "react";

/**
 * Visual and touch-target size for Radio.
 *
 * @public
 */
export type RadioSize = "small" | "medium" | "large";
/**
 * Visual validation state for Radio.
 *
 * @public
 */
export type RadioStatus = "default" | "error";
/**
 * Primitive value supported by RadioGroup.
 *
 * @public
 */
export type RadioValue = string | number;

/**
 * Props accepted by {@link Radio}.
 *
 * @public
 */
export type RadioProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "checked" | "children" | "defaultChecked" | "onChange" | "size" | "type" | "value"
> & {
  /** Controls the selected state. Do not combine with `defaultChecked`. */
  checked?: boolean;
  /** Visible label content; the whole label is the touch target. */
  children?: ReactNode;
  /** Initial state for an uncontrolled standalone radio. */
  defaultChecked?: boolean;
  /** Called after an accepted native change with the next state and original event. */
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Prevents selection changes while preserving focus and FormData submission. */
  readOnly?: boolean;
  /** Visual and touch-target scale. */
  size?: RadioSize;
  /** Visual validation state that emits `aria-invalid="true"`; explicit `grammar` or `spelling` tokens remain intact. */
  status?: RadioStatus;
  /** Native submitted value and the identity used by RadioGroup. */
  value?: RadioValue;
};

/**
 * Props accepted by {@link RadioGroup}.
 *
 * @public
 */
export type RadioGroupProps<TValue extends RadioValue = RadioValue> = Omit<
  HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onChange"
> & {
  /** Radio descendants that opt into the group by supplying `value`. */
  children: ReactNode;
  /** Initial selection for an uncontrolled group. Form reset restores this value. */
  defaultValue?: TValue;
  /** Visual flow of the choices. */
  direction?: "horizontal" | "vertical";
  /** Disables every radio and excludes the selected value from FormData. */
  disabled?: boolean;
  /** Shared native form field name. A stable generated name is used when omitted. */
  name?: string;
  /** Called with the next selected value and original native event. */
  onChange?: (value: TValue, event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Prevents selection changes while preserving keyboard focus and FormData. */
  readOnly?: boolean;
  /** Ref to the semantic radiogroup container. */
  ref?: Ref<HTMLDivElement>;
  /** Requires one radio in the shared native name group. */
  required?: boolean;
  /** Marks the radiogroup invalid and applies error visuals to descendants without adding ARIA invalid tokens to each radio. */
  status?: RadioStatus;
  /** Controlled selection. Use `null` to render a controlled empty group. */
  value?: TValue | null;
};
