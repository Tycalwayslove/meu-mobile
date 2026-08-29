import type { ChangeEvent, InputHTMLAttributes, KeyboardEvent, MouseEvent } from "react";

/**
 * The rendered control-height preset. Every preset keeps a 44 CSS px minimum target.
 *
 * @public
 */
export type SearchFieldSize = "small" | "medium" | "large";

/**
 * Visual and semantic validation state. `error` emits `aria-invalid="true"`; caller grammar/spelling
 * tokens are otherwise preserved.
 *
 * @public
 */
export type SearchFieldStatus = "default" | "error";

/**
 * Why the search value changed.
 *
 * @public
 */
export type SearchFieldChangeSource = "clear" | "input";

/**
 * Details emitted for a native input edit.
 *
 * @public
 */
export type SearchFieldInputChangeDetails = Readonly<{
  /** The React change event from the real search input. */
  event: ChangeEvent<HTMLInputElement>;
  /** Identifies a native input edit. */
  source: "input";
}>;

/**
 * Details emitted when the built-in clear button is activated.
 *
 * @public
 */
export type SearchFieldClearDetails = Readonly<{
  /** The React click event from the clear button. */
  event: MouseEvent<HTMLButtonElement>;
  /** Identifies the built-in clear action. */
  source: "clear";
}>;

/**
 * Details accompanying `onChange`.
 *
 * @public
 */
export type SearchFieldChangeDetails = SearchFieldClearDetails | SearchFieldInputChangeDetails;

/**
 * Details emitted when Enter requests a search.
 *
 * @public
 */
export type SearchFieldSearchDetails = Readonly<{
  /**
   * The React key event from the real input. Its default is prevented because
   * `onSearch` owns this Enter action instead of the surrounding native form.
   */
  event: KeyboardEvent<HTMLInputElement>;
  /** Identifies a non-composing Enter action. */
  source: "enter";
}>;

/**
 * Props for the mobile search input. Native input attributes are forwarded.
 *
 * @public
 */
export type SearchFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "defaultValue" | "onChange" | "size" | "type" | "value"
> & {
  /** Accessible name for the built-in clear button. */
  clearLabel?: string;
  /**
   * Whether to show the built-in clear button for a non-empty editable value.
   *
   * @defaultValue `true`
   */
  clearable?: boolean;
  /**
   * Initial value when the component is uncontrolled.
   *
   * @defaultValue `""`
   */
  defaultValue?: string;
  /** Marks an in-flight search, suppresses repeated Enter searches and replaces clear with status. */
  loading?: boolean;
  /** Accessible status name announced while `loading` is true. */
  loadingLabel?: string;
  /** Called after an input edit or clear request. The first argument remains backward compatible. */
  onChange?: (value: string, details: SearchFieldChangeDetails) => void;
  /** Called after the clear value update is requested and focus is restored to the input. */
  onClear?: (details: SearchFieldClearDetails) => void;
  /**
   * Called for a non-composing, non-repeated Enter key. When supplied, SearchField
   * prevents the native form submission so one Enter action has one request owner.
   */
  onSearch?: (value: string, details: SearchFieldSearchDetails) => void;
  /**
   * Visual control-height preset.
   *
   * @defaultValue `"medium"`
   */
  size?: SearchFieldSize;
  /**
   * Visual validation state. Field or status errors override a caller ARIA invalid token with `true`.
   *
   * @defaultValue `"default"`
   */
  status?: SearchFieldStatus;
  /** Controlled search value. */
  value?: string;
};
