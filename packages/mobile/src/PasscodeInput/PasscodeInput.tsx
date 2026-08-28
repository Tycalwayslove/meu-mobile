"use client";

import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from "react";
import type { ChangeEvent, FocusEvent, KeyboardEvent } from "react";

import { useMeuConfig } from "../ConfigProvider";
import { useFieldContext } from "../Field/FieldContext";
import { NumberKeyboard } from "../NumberKeyboard";
import {
  caret as caretClass,
  cell,
  cells,
  character,
  dot,
  nativeInput,
  root,
  separatedCells
} from "./PasscodeInput.css";
import type { PasscodeInputChangeDetails, PasscodeInputProps, PasscodeInputRef } from "./types";

const DEFAULT_LENGTH = 6;

function normalizeLength(length: number) {
  if (!Number.isFinite(length) || length <= 0) return DEFAULT_LENGTH;
  return Math.max(1, Math.floor(length));
}

function normalizeValue(value: string, length: number, inputMode: "numeric" | "text") {
  const characters = Array.from(value);
  const filtered =
    inputMode === "numeric"
      ? characters.filter((characterValue) => /^\d$/.test(characterValue))
      : characters;
  return filtered.slice(0, length).join("");
}

function cellPosition(index: number, length: number, separated: boolean) {
  if (separated) return "separated" as const;
  if (length === 1) return "single" as const;
  if (index === 0) return "first" as const;
  if (index === length - 1) return "last" as const;
  return "middle" as const;
}

export const PasscodeInput = forwardRef<PasscodeInputRef, PasscodeInputProps>(
  function PasscodeInput(
    {
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledby,
      autoComplete = "one-time-code",
      caret = true,
      className,
      defaultValue = "",
      direction = "ltr",
      disabled = false,
      id,
      inputMode = "numeric",
      keyboard,
      length = DEFAULT_LENGTH,
      mask = true,
      onBlur,
      onChange,
      onComplete,
      onFocus,
      onKeyDown,
      pattern,
      readOnly = false,
      separated = false,
      status = "default",
      style,
      value,
      ...props
    },
    ref
  ) {
    const config = useMeuConfig();
    const fieldContext = useFieldContext();
    const inputRef = useRef<HTMLInputElement>(null);
    const completedValueRef = useRef("");
    const keyboardId = `meu-passcode-keyboard-${useId()}`;
    const controlled = value !== undefined;
    const resolvedLength = normalizeLength(length);
    const resolvedInputMode = inputMode === "text" ? "text" : "numeric";
    const [uncontrolledValue, setUncontrolledValue] = useState(() =>
      normalizeValue(defaultValue, resolvedLength, resolvedInputMode)
    );
    const currentValue = normalizeValue(
      controlled ? value : uncontrolledValue,
      resolvedLength,
      resolvedInputMode
    );
    const {
      closeOnComplete: keyboardCloseOnComplete,
      keyboardAriaLabel,
      onConfirm: keyboardOnConfirm,
      title: keyboardTitle,
      ...keyboardProps
    } = keyboard || {};
    const [active, setActive] = useState(false);
    const resolvedId = id || (fieldContext ? fieldContext.controlId : undefined);
    const describedBy = ariaDescribedBy || (fieldContext ? fieldContext.describedBy : undefined);
    const labelledBy = ariaLabelledby || (fieldContext ? fieldContext.labelId : undefined);
    const invalid =
      ariaInvalid === true ||
      ariaInvalid === "true" ||
      status === "error" ||
      Boolean(fieldContext && fieldContext.invalid);
    const localizedLabel = config.locale === "zh-CN" ? "密码输入" : "Passcode input";
    const keyboardLabel = keyboardAriaLabel
      ? keyboardAriaLabel
      : config.locale === "zh-CN"
        ? "密码数字键盘"
        : "Passcode number keyboard";
    const characters = Array.from(currentValue);
    const activeIndex = Math.min(characters.length, resolvedLength - 1);
    const keyboardOpen = Boolean(keyboard && active && !disabled && !readOnly);

    function publish(nextValue: string, details: PasscodeInputChangeDetails) {
      const normalized = normalizeValue(nextValue, resolvedLength, resolvedInputMode);
      if (normalized === currentValue) return;
      if (!controlled) setUncontrolledValue(normalized);
      if (onChange) onChange(normalized, details);
    }

    function closeKeyboard() {
      setActive(false);
      if (inputRef.current) inputRef.current.blur();
    }

    function handleNativeChange(event: ChangeEvent<HTMLInputElement>) {
      publish(event.currentTarget.value, { source: "native" });
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
      if (keyboard && !disabled && !readOnly) {
        if (event.key === "Backspace") {
          event.preventDefault();
          publish(currentValue.slice(0, -1), { source: "delete" });
        } else if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
          const nextCharacter = normalizeValue(event.key, 1, resolvedInputMode);
          if (nextCharacter) {
            event.preventDefault();
            publish(`${currentValue}${nextCharacter}`, { source: "keyboard" });
          }
        }
      }
      if (onKeyDown) onKeyDown(event);
    }

    function handleBlur(event: FocusEvent<HTMLInputElement>) {
      const nextTarget = event.relatedTarget;
      const movedToKeyboard =
        keyboard &&
        nextTarget instanceof HTMLElement &&
        Boolean(nextTarget.closest('[data-meu-component="number-keyboard"]'));
      if (!movedToKeyboard) setActive(false);
      if (onBlur) onBlur(event);
    }

    useImperativeHandle(
      ref,
      () => ({
        blur: () => closeKeyboard(),
        focus: () => {
          if (inputRef.current) inputRef.current.focus();
        },
        get input() {
          return inputRef.current;
        }
      }),
      []
    );

    useEffect(() => {
      if (controlled) return;
      const normalized = normalizeValue(uncontrolledValue, resolvedLength, resolvedInputMode);
      if (normalized !== uncontrolledValue) setUncontrolledValue(normalized);
    }, [controlled, resolvedInputMode, resolvedLength, uncontrolledValue]);

    useEffect(() => {
      if (currentValue.length !== resolvedLength) {
        completedValueRef.current = "";
        return;
      }
      if (completedValueRef.current === currentValue) return;
      completedValueRef.current = currentValue;
      if (onComplete) onComplete(currentValue);
      if (keyboard && keyboardCloseOnComplete) {
        setActive(false);
        if (inputRef.current) inputRef.current.blur();
      }
    }, [currentValue, keyboard, keyboardCloseOnComplete, onComplete, resolvedLength]);

    return (
      <div
        className={className ? `${root} ${className}` : root}
        dir={direction}
        style={style}
        data-complete={currentValue.length === resolvedLength || undefined}
        data-direction={direction}
        data-meu-component="passcode-input"
        data-state={
          disabled
            ? "disabled"
            : readOnly
              ? "readonly"
              : invalid
                ? "error"
                : active
                  ? "focused"
                  : currentValue
                    ? "filled"
                    : "empty"
        }
      >
        <div className={separated ? `${cells} ${separatedCells}` : cells} aria-hidden="true">
          {Array.from({ length: resolvedLength }, (_, index) => {
            const characterValue = characters[index];
            const showCaret = caret && active && !characterValue && index === activeIndex;
            return (
              <span
                key={index}
                className={cell({
                  active: active && index === activeIndex,
                  disabled: disabled || readOnly,
                  direction,
                  position: cellPosition(index, resolvedLength, separated),
                  status: invalid ? "error" : "default"
                })}
                data-active={active && index === activeIndex ? "true" : undefined}
                data-filled={characterValue ? "true" : undefined}
                data-meu-passcode-cell={index}
              >
                {characterValue ? (
                  mask ? (
                    <span className={dot} />
                  ) : (
                    <span className={character}>{characterValue}</span>
                  )
                ) : showCaret ? (
                  <span className={caretClass} />
                ) : null}
              </span>
            );
          })}
        </div>
        <input
          {...props}
          ref={inputRef}
          id={resolvedId}
          className={nativeInput}
          type={mask ? "password" : "text"}
          inputMode={resolvedInputMode}
          pattern={pattern === undefined && resolvedInputMode === "numeric" ? "[0-9]*" : pattern}
          autoComplete={autoComplete}
          maxLength={resolvedLength}
          value={currentValue}
          disabled={disabled}
          readOnly={readOnly || Boolean(keyboard)}
          aria-label={ariaLabel || (labelledBy ? undefined : localizedLabel)}
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          aria-controls={keyboard ? keyboardId : undefined}
          onChange={handleNativeChange}
          onFocus={(event) => {
            setActive(true);
            if (onFocus) onFocus(event);
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
        {keyboard ? (
          <NumberKeyboard
            {...keyboardProps}
            {...(keyboardTitle ? { title: keyboardTitle } : { "aria-label": keyboardLabel })}
            id={keyboardId}
            open={keyboardOpen}
            onInput={(input) => publish(`${currentValue}${input}`, { source: "keyboard" })}
            onDelete={() => publish(currentValue.slice(0, -1), { source: "delete" })}
            onConfirm={() => {
              if (keyboardOnConfirm) keyboardOnConfirm(currentValue);
            }}
            onOpenChange={(nextOpen) => {
              if (!nextOpen) closeKeyboard();
            }}
          />
        ) : null}
      </div>
    );
  }
);
