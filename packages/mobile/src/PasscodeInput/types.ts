import type { ChangeEvent, InputHTMLAttributes, KeyboardEvent } from "react";

import type { NumberKeyboardProps } from "../NumberKeyboard";

/**
 * Visual flow direction for passcode cells.
 *
 * @public
 */
export type PasscodeInputDirection = "ltr" | "rtl";
/**
 * Validation presentation state.
 *
 * @public
 */
export type PasscodeInputStatus = "default" | "error";
/**
 * Origin of a value proposal emitted by {@link PasscodeInput}.
 *
 * @public
 */
export type PasscodeInputChangeSource = "delete" | "hardware" | "keyboard" | "native";

/**
 * Metadata accompanying a passcode value proposal.
 *
 * @public
 */
export type PasscodeInputChangeDetails = {
  /** Native React event when the proposal originated from the hidden input. */
  event?: ChangeEvent<HTMLInputElement> | KeyboardEvent<HTMLInputElement>;
  /** Whether a delete proposal came from a repeated key or long-press sequence. */
  repeated?: boolean;
  /** Stable input origin. `keyboard` means Meu NumberKeyboard; `hardware` means a physical key. */
  source: PasscodeInputChangeSource;
};

/**
 * Options for composing the non-modal Meu NumberKeyboard.
 *
 * @public
 */
export type PasscodeInputKeyboardOptions = Omit<
  NumberKeyboardProps,
  | "aria-label"
  | "aria-labelledby"
  | "defaultOpen"
  | "id"
  | "onConfirm"
  | "onDelete"
  | "onInput"
  | "onOpenChange"
  | "open"
  | "ref"
  | "title"
> & {
  /** Blurs the real input and hides the NumberKeyboard after a complete value is observed. */
  closeOnComplete?: boolean;
  /** Accessible name used when neither a keyboard title nor an explicit label is supplied. */
  keyboardAriaLabel?: string;
  /** Receives the current caller-owned value before NumberKeyboard applies its close behavior. */
  onConfirm?: (value: string) => void;
  /**
   * Keeps the real input's normal keyboard hint alongside NumberKeyboard. Defaults to `true`,
   * which uses `inputMode="none"` plus a best-effort pointer-focus guard without making the input
   * permanently read-only or removing it from native constraint validation.
   */
  suppressNativeKeyboard?: boolean;
  /** Visible NumberKeyboard heading; it also supplies the keyboard's accessible name. */
  title?: string;
};

/**
 * Imperative handle exposing the real native input without leaking visual-cell internals.
 *
 * @public
 */
export type PasscodeInputRef = {
  /** Removes focus from the real input and, when configured, hides NumberKeyboard. */
  blur: () => void;
  /** Moves focus to the real input. */
  focus: () => void;
  /** Current native input element, or `null` before mount and after unmount. */
  input: HTMLInputElement | null;
};

/**
 * Props for the real-input-backed passcode/OTP control.
 *
 * @public
 */
export type PasscodeInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  | "defaultValue"
  | "dir"
  | "inputMode"
  | "maxLength"
  | "minLength"
  | "onChange"
  | "size"
  | "type"
  | "value"
> & {
  /** Shows a visual caret in the next empty cell while focused. @defaultValue true */
  caret?: boolean;
  /** Initial value for uncontrolled usage. Later changes update the native reset baseline only. */
  defaultValue?: string;
  /** Cell order and connected-corner direction. @defaultValue "ltr" */
  direction?: PasscodeInputDirection;
  /** Enables a caller-configured non-modal Meu NumberKeyboard. */
  keyboard?: PasscodeInputKeyboardOptions;
  /**
   * `numeric` accepts ASCII digits only. `text` accepts Unicode code points and enforces the cell
   * limit in JavaScript because native maxlength counts UTF-16 code units.
   * @defaultValue "numeric"
   */
  inputMode?: "numeric" | "text";
  /** Number of visual cells and maximum accepted characters. Invalid values fall back to 6. */
  length?: number;
  /** Uses password semantics and dot mirrors. This is presentation, not encryption. */
  mask?: boolean;
  /** Called for each accepted value proposal. Controlled callers remain authoritative. */
  onChange?: (value: string, details: PasscodeInputChangeDetails) => void;
  /** Called once for each distinct complete value after mount; native form reset does not emit it. */
  onComplete?: (value: string) => void;
  /** Renders individual rounded cells instead of a connected group. */
  separated?: boolean;
  /** Validation presentation state. Prefer Field error content for accessible feedback. */
  status?: PasscodeInputStatus;
  /** Controlled value. Invalid characters and overflow are normalized for rendering. */
  value?: string;
};
