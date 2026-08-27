"use client";

import { Portal } from "@meu/primitives-react";
import { useEffect, useId, useMemo, useRef } from "react";
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";

import { useMeuConfig } from "../ConfigProvider";
import { useControllableOpen } from "../internal/useControllableOpen";
import { useOverlayPresence } from "../internal/useOverlayPresence";
import {
  backspaceGlyph,
  closeButton,
  header,
  key,
  keyboard,
  layer,
  main,
  panel,
  placeholder,
  title as titleClass
} from "./NumberKeyboard.css";
import type {
  NumberKeyboardExtraKey,
  NumberKeyboardInputSource,
  NumberKeyboardProps
} from "./types";

const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"] as const;
const DELETE_REPEAT_DELAY = 600;
const DELETE_REPEAT_INTERVAL = 120;

function shuffleDigits() {
  const next = DIGITS.slice();
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = next[index]!;
    next[index] = next[swapIndex]!;
    next[swapIndex] = current;
  }
  return next;
}

function inputSource(value: string, mode: "number" | "decimal"):
  NumberKeyboardInputSource {
  if (/^\d$/.test(value)) return "digit";
  if (mode === "decimal" && value === ".") return "decimal";
  return "extra";
}

function resolveExtraKey(
  extraKey: NumberKeyboardExtraKey | null | undefined,
  mode: "number" | "decimal",
  decimalLabel: string
) {
  if (extraKey === null) return null;
  if (extraKey !== undefined) return extraKey.value ? extraKey : null;
  if (mode === "decimal") {
    return { ariaLabel: decimalLabel, label: ".", value: "." } satisfies NumberKeyboardExtraKey;
  }
  return null;
}

export function NumberKeyboard({
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  backspaceLabel,
  className,
  closeLabel,
  closeOnConfirm = true,
  closeOnEscape = true,
  confirmDisabled = false,
  confirmLabel = null,
  container,
  defaultOpen = false,
  deleteRepeat = true,
  disabled = false,
  extraKey,
  forceMount = false,
  mode = "number",
  onConfirm,
  onDelete,
  onInput,
  onOpenChange,
  open,
  randomOrder = false,
  ref,
  safeArea = true,
  showCloseButton = true,
  style,
  title,
  ...props
}: NumberKeyboardProps) {
  const config = useMeuConfig();
  const titleId = `meu-number-keyboard-title-${useId()}`;
  const repeatDelayRef = useRef(0);
  const repeatIntervalRef = useRef(0);
  const repeatStartedRef = useRef(false);
  const suppressDeleteClickRef = useRef(false);
  const [resolvedOpen, requestOpenChange] = useControllableOpen({
    defaultOpen,
    onOpenChange,
    open
  });
  const { hidden, shouldRender, visualState } = useOverlayPresence(resolvedOpen, forceMount);
  const digits = useMemo(
    () => (randomOrder && resolvedOpen ? shuffleDigits() : DIGITS),
    [randomOrder, resolvedOpen]
  );
  const localized =
    config.locale === "en-US"
      ? {
          backspace: "Delete last digit",
          close: "Hide",
          decimal: "Decimal point",
          label: "Number keyboard"
        }
      : {
          backspace: "删除上一位",
          close: "收起",
          decimal: "小数点",
          label: "数字键盘"
        };
  const resolvedBackspaceLabel = backspaceLabel || localized.backspace;
  const resolvedCloseLabel = closeLabel || localized.close;
  const resolvedExtraKey = useMemo(
    () => resolveExtraKey(extraKey, mode, localized.decimal),
    [extraKey, localized.decimal, mode]
  );
  const resolvedLabelledby = ariaLabelledby || (!ariaLabel && title ? titleId : undefined);
  const resolvedAriaLabel = ariaLabel || (resolvedLabelledby ? undefined : localized.label);
  const portalContainer = container === undefined ? config.portalContainer : container;

  const stopDeleteRepeat = () => {
    window.clearTimeout(repeatDelayRef.current);
    window.clearInterval(repeatIntervalRef.current);
    repeatDelayRef.current = 0;
    repeatIntervalRef.current = 0;
  };

  const emitDelete = (repeated: boolean) => {
    if (!disabled && onDelete) onDelete({ repeated });
  };

  const startDeleteRepeat = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (disabled || !deleteRepeat || event.button !== 0) return;
    stopDeleteRepeat();
    repeatStartedRef.current = false;
    suppressDeleteClickRef.current = false;
    repeatDelayRef.current = window.setTimeout(() => {
      repeatStartedRef.current = true;
      emitDelete(true);
      repeatIntervalRef.current = window.setInterval(
        () => emitDelete(true),
        DELETE_REPEAT_INTERVAL
      );
    }, DELETE_REPEAT_DELAY);
  };

  const finishDeleteRepeat = () => {
    if (repeatStartedRef.current) suppressDeleteClickRef.current = true;
    repeatStartedRef.current = false;
    stopDeleteRepeat();
  };

  useEffect(() => {
    if (!resolvedOpen) stopDeleteRepeat();
  }, [resolvedOpen]);

  useEffect(() => {
    if (!resolvedOpen || !closeOnEscape) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      event.preventDefault();
      requestOpenChange(false, { reason: "escape" });
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeOnEscape, requestOpenChange, resolvedOpen]);

  useEffect(() => () => stopDeleteRepeat(), []);

  if (!shouldRender) return null;

  const emitInput = (value: string) => {
    if (disabled || !onInput) return;
    onInput(value, { source: inputSource(value, mode) });
  };

  const preserveCurrentFocus = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const renderDigit = (value: string) => (
    <button
      key={value}
      type="button"
      aria-label={value}
      className={key({ kind: "digit" })}
      data-key={value}
      disabled={disabled}
      onMouseDown={preserveCurrentFocus}
      onClick={() => emitInput(value)}
    >
      {value}
    </button>
  );

  const renderExtra = () =>
    resolvedExtraKey ? (
      <button
        type="button"
        aria-label={resolvedExtraKey.ariaLabel}
        className={key({ kind: "extra" })}
        data-key={resolvedExtraKey.value}
        disabled={disabled || resolvedExtraKey.disabled}
        onMouseDown={preserveCurrentFocus}
        onClick={() => emitInput(resolvedExtraKey.value)}
      >
        {resolvedExtraKey.label}
      </button>
    ) : (
      <div className={placeholder} aria-hidden="true" />
    );

  const renderDelete = () => (
    <button
      type="button"
      aria-label={resolvedBackspaceLabel}
      className={key({ kind: "delete" })}
      data-key="backspace"
      disabled={disabled}
      onMouseDown={preserveCurrentFocus}
      onClick={() => {
        if (suppressDeleteClickRef.current) {
          suppressDeleteClickRef.current = false;
          return;
        }
        emitDelete(false);
      }}
      onContextMenu={(event) => event.preventDefault()}
      onPointerCancel={finishDeleteRepeat}
      onPointerDown={startDeleteRepeat}
      onPointerLeave={finishDeleteRepeat}
      onPointerUp={finishDeleteRepeat}
    >
      <span className={backspaceGlyph} aria-hidden="true">⌫</span>
    </button>
  );

  return (
    <Portal container={portalContainer}>
      <div
        className={layer({ state: visualState })}
        hidden={hidden}
        aria-hidden={resolvedOpen ? undefined : "true"}
        lang={config.locale}
        data-meu-overlay-layer="number-keyboard"
        data-meu-theme={config.theme}
        data-state={visualState}
      >
        <div
          {...props}
          ref={ref}
          role="group"
          aria-disabled={disabled || undefined}
          aria-label={resolvedAriaLabel}
          aria-labelledby={resolvedLabelledby}
          className={
            className
              ? `${panel({ safeArea, state: visualState })} ${className}`
              : panel({ safeArea, state: visualState })
          }
          data-layout={confirmLabel ? "confirm" : "standard"}
          data-meu-component="number-keyboard"
          data-state={visualState}
          style={style}
        >
          {title || showCloseButton ? (
            <div className={header}>
              {title ? (
                <div id={titleId} className={titleClass}>
                  {title}
                </div>
              ) : null}
              {showCloseButton ? (
                <button
                  type="button"
                  className={closeButton}
                  onMouseDown={preserveCurrentFocus}
                  onClick={() => requestOpenChange(false, { reason: "close-button" })}
                >
                  {resolvedCloseLabel}
                </button>
              ) : null}
            </div>
          ) : null}
          <div className={keyboard}>
            <div className={main}>
              {digits.slice(0, 9).map(renderDigit)}
              {renderExtra()}
              {renderDigit(digits[9])}
              {renderDelete()}
            </div>
            {confirmLabel ? (
              <button
                type="button"
                className={key({ kind: "confirm" })}
                disabled={disabled || confirmDisabled}
                onMouseDown={preserveCurrentFocus}
                onClick={() => {
                  if (onConfirm) onConfirm();
                  if (closeOnConfirm) requestOpenChange(false, { reason: "confirm" });
                }}
              >
                {confirmLabel}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </Portal>
  );
}
