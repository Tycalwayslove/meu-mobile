import type { InputHTMLAttributes } from "react";

/**
 * Visual and touch-target size for Switch.
 *
 * @public
 */
export type SwitchSize = "small" | "medium" | "large";
/**
 * Visual validation state for Switch.
 *
 * @public
 */
export type SwitchStatus = "default" | "error";

/**
 * Props accepted by {@link Switch}.
 *
 * @public
 */
export type SwitchProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "checked" | "children" | "defaultChecked" | "onChange" | "size" | "type"
> & {
  /** Controls the on/off state. Do not combine with `defaultChecked`. */
  checked?: boolean;
  /** Initial state for an uncontrolled switch. Native form reset restores this value. */
  defaultChecked?: boolean;
  /** Blocks changes and consumer `onClick`, exposes busy state, and preserves the current FormData value. */
  loading?: boolean;
  /** Called after an accepted native change with the next state and original event. */
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Prevents changes while preserving keyboard focus and FormData submission. */
  readOnly?: boolean;
  /** Visual scale; every size keeps a minimum 44×44 CSS px target. */
  size?: SwitchSize;
  /** Visual validation state; an error emits `aria-invalid="true"` and overrides caller tokens, otherwise native invalid tokens remain intact. */
  status?: SwitchStatus;
};
