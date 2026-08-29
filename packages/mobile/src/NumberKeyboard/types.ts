import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode, Ref } from "react";

import type { OverlayContainer } from "../overlayTypes";

/**
 * Numeric keyboard layout mode.
 *
 * @public
 */
export type NumberKeyboardMode = "number" | "decimal";
/**
 * Kind of key that emitted an input value.
 *
 * @public
 */
export type NumberKeyboardInputSource = "digit" | "decimal" | "extra";
/**
 * Control that requested the keyboard to close.
 *
 * @public
 */
export type NumberKeyboardOpenChangeReason = "close-button" | "confirm" | "escape";

/**
 * Metadata emitted with a NumberKeyboard input value.
 *
 * @public
 */
export type NumberKeyboardInputDetails = {
  /** Kind of key that produced the emitted value. */
  source: NumberKeyboardInputSource;
};

/**
 * Metadata emitted by the NumberKeyboard delete key.
 *
 * @public
 */
export type NumberKeyboardDeleteDetails = {
  /** Whether this deletion came from the long-press repeat sequence. */
  repeated: boolean;
};

/**
 * Metadata emitted with a keyboard visibility request.
 *
 * @public
 */
export type NumberKeyboardOpenChangeDetails = {
  /** Keyboard control that requested closure. */
  reason: NumberKeyboardOpenChangeReason;
};

/**
 * Configuration for the optional lower-left keyboard key.
 *
 * @public
 */
export type NumberKeyboardExtraKey = {
  /** Accessible name when the rendered label does not describe the inserted value. */
  ariaLabel?: string;
  /** Prevents this key from emitting input. @defaultValue false */
  disabled?: boolean;
  /** Visible key content. */
  label: ReactNode;
  /** String passed to `onInput`; an empty value suppresses the key. */
  value: string;
};

/**
 * Visual validation state for NumberKeyboardTrigger.
 *
 * @public
 */
export type NumberKeyboardTriggerStatus = "default" | "error";

/**
 * Props for the Field-aware NumberKeyboard trigger button.
 *
 * @public
 */
export type NumberKeyboardTriggerProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-required" | "children" | "value"
> & {
  /** Mirrors the associated keyboard visibility through `aria-expanded`. @defaultValue false */
  open?: boolean;
  /** Content shown when `value` is absent. @defaultValue "请输入" */
  placeholder?: ReactNode;
  /** Ref to the native trigger button. */
  ref?: Ref<HTMLButtonElement>;
  /**
   * Visual validation state. `error` and Field errors expose `aria-invalid="true"` on the native
   * button; otherwise caller grammar, spelling, true, and false tokens are preserved.
   *
   * @defaultValue "default"
   */
  status?: NumberKeyboardTriggerStatus;
  /** Current value summary shown inside the trigger. */
  value?: ReactNode;
};

/**
 * Props for the non-modal numeric keyboard.
 *
 * @public
 */
export type NumberKeyboardProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "onInput" | "onMouseDown" | "role" | "title"
> & {
  /** Accessible name for the delete key; defaults to the configured locale. */
  backspaceLabel?: string;
  /** Visible label for the header close button; defaults to the configured locale. */
  closeLabel?: string;
  /** Requests closure after the confirm callback runs. @defaultValue true */
  closeOnConfirm?: boolean;
  /** Lets Escape request closure while open. @defaultValue true */
  closeOnEscape?: boolean;
  /** Disables only the optional confirm key. @defaultValue false */
  confirmDisabled?: boolean;
  /** Confirm-key label; `null`, an empty string, or whitespace omits the key. @defaultValue null */
  confirmLabel?: string | null;
  /** Portal target; `null` renders next to the caller. Defaults to ConfigProvider's target. */
  container?: OverlayContainer;
  /** Initial visibility for uncontrolled usage. @defaultValue false */
  defaultOpen?: boolean;
  /** Enables repeated deletion after a 600 ms long press. @defaultValue true */
  deleteRepeat?: boolean;
  /** Disables digit, extra, delete, and confirm input. @defaultValue false */
  disabled?: boolean;
  /** Replaces the lower-left key; decimal mode supplies a decimal key when omitted. */
  extraKey?: NumberKeyboardExtraKey | null;
  /** Keeps the closed keyboard mounted and hidden after hydration. @defaultValue false */
  forceMount?: boolean;
  /** Selects the standard numeric or decimal-key layout. @defaultValue "number" */
  mode?: NumberKeyboardMode;
  /** Called before confirm optionally requests closure. */
  onConfirm?: () => void;
  /** Called for a delete press or each long-press repeat tick. */
  onDelete?: (details: NumberKeyboardDeleteDetails) => void;
  /** Called with the string emitted by a digit, decimal, or custom extra key. */
  onInput?: (value: string, details: NumberKeyboardInputDetails) => void;
  /** Reports controlled or uncontrolled closure requests and their cause. */
  onOpenChange?: (open: boolean, details: NumberKeyboardOpenChangeDetails) => void;
  /** Controlled visibility. */
  open?: boolean;
  /** Shuffles digit positions once per open cycle. @defaultValue false */
  randomOrder?: boolean;
  /** Ref to the keyboard group element. */
  ref?: Ref<HTMLDivElement>;
  /** Adds the bottom device safe-area inset. @defaultValue true */
  safeArea?: boolean;
  /** Renders the header close button. @defaultValue true */
  showCloseButton?: boolean;
  /** Visible heading that also labels the keyboard when no ARIA name is supplied. */
  title?: string;
};
