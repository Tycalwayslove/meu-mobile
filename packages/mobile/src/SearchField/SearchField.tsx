"use client";

import { MeuIconSearch, MeuIconX } from "@meu/icons-react";
import { VisuallyHidden } from "@meu/primitives-react";
import { forwardRef, useEffect, useRef, useState } from "react";
import type {
  ChangeEvent,
  CompositionEvent,
  FocusEvent,
  ForwardedRef,
  KeyboardEvent,
  MouseEvent
} from "react";

import { useMeuConfig } from "../ConfigProvider";
import { useFieldContext } from "../Field/FieldContext";
import { clearButton, input, loadingIndicator, root, searchIcon, spinner } from "./SearchField.css";
import type { SearchFieldChangeDetails, SearchFieldClearDetails, SearchFieldProps } from "./types";

function assignRef<T>(ref: ForwardedRef<T>, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

function mergeDescriptionIds(...values: Array<string | undefined>): string | undefined {
  const ids: string[] = [];
  values.forEach((value) => {
    if (!value) return;
    value.split(/\s+/).forEach((descriptionId) => {
      if (descriptionId && ids.indexOf(descriptionId) === -1) ids.push(descriptionId);
    });
  });
  return ids.length > 0 ? ids.join(" ") : undefined;
}

/**
 * A native mobile search input with clear, loading, IME, and single-owner Enter semantics.
 *
 * @public
 */
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  {
    "aria-busy": ariaBusy,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    className,
    clearLabel: clearLabelProp,
    clearable = true,
    defaultValue = "",
    dir,
    disabled = false,
    enterKeyHint = "search",
    form,
    id,
    loading = false,
    loadingLabel: loadingLabelProp,
    onBlur,
    onChange,
    onClear,
    onCompositionEnd,
    onCompositionStart,
    onKeyDown,
    onSearch,
    readOnly = false,
    required = false,
    size = "medium",
    status = "default",
    style,
    value,
    ...props
  },
  forwardedRef
) {
  const config = useMeuConfig();
  const fieldContext = useFieldContext();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const composingRef = useRef(false);
  const clearFocusedRef = useRef(false);
  const resetTimerRef = useRef<number | null>(null);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const controlled = value !== undefined;
  const currentValue = controlled ? value : uncontrolledValue;
  const resolvedId = id || (fieldContext ? fieldContext.controlId : undefined);
  const describedBy = mergeDescriptionIds(
    ariaDescribedBy,
    fieldContext ? fieldContext.describedBy : undefined
  );
  const labelledBy = ariaLabel
    ? undefined
    : mergeDescriptionIds(ariaLabelledBy, fieldContext ? fieldContext.labelId : undefined);
  const resolvedRequired = required || Boolean(fieldContext && fieldContext.required);
  const callerInvalid =
    ariaInvalid === true ||
    ariaInvalid === "true" ||
    ariaInvalid === "grammar" ||
    ariaInvalid === "spelling";
  const contextualInvalid = status === "error" || Boolean(fieldContext && fieldContext.invalid);
  const invalid = callerInvalid || contextualInvalid;
  const resolvedAriaInvalid = contextualInvalid
    ? true
    : ariaInvalid === "grammar" || ariaInvalid === "spelling"
      ? ariaInvalid
      : callerInvalid
        ? true
        : ariaInvalid === false || ariaInvalid === "false"
          ? ariaInvalid
          : undefined;
  const rootClasses = root({ disabled, readOnly, size, status: invalid ? "error" : status });
  const clearLabel =
    clearLabelProp !== undefined
      ? clearLabelProp
      : config.locale === "en-US"
        ? "Clear search"
        : "清除搜索";
  const loadingLabel =
    loadingLabelProp !== undefined
      ? loadingLabelProp
      : config.locale === "en-US"
        ? "Searching"
        : "正在搜索";

  useEffect(() => {
    const element = inputRef.current;
    const ownerDocument = element ? element.ownerDocument : null;
    if (!element || !ownerDocument) return undefined;
    const timerWindow = ownerDocument.defaultView || window;

    const handleReset = (event: Event) => {
      const currentElement = inputRef.current;
      if (!currentElement || event.target !== currentElement.form) return;
      currentElement.defaultValue = controlled ? (value === undefined ? "" : value) : defaultValue;
      if (resetTimerRef.current !== null) timerWindow.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = timerWindow.setTimeout(() => {
        resetTimerRef.current = null;
        const resetElement = inputRef.current;
        if (!resetElement || event.defaultPrevented) return;
        if (controlled) resetElement.value = value === undefined ? "" : value;
        else setUncontrolledValue(defaultValue);
        composingRef.current = false;
      }, 0);
    };

    ownerDocument.addEventListener("reset", handleReset);
    return () => {
      ownerDocument.removeEventListener("reset", handleReset);
      if (resetTimerRef.current !== null) timerWindow.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    };
  }, [controlled, defaultValue, form, value]);

  useEffect(() => {
    if (!loading || !clearFocusedRef.current) return;
    clearFocusedRef.current = false;
    const element = inputRef.current;
    if (element && !element.disabled) element.focus();
  }, [loading]);

  function updateValue(nextValue: string, details: SearchFieldChangeDetails) {
    if (!controlled) setUncontrolledValue(nextValue);
    if (onChange) onChange(nextValue, details);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (disabled || readOnly) return;
    updateValue(event.target.value, { event, source: "input" });
  }

  function handleCompositionStart(event: CompositionEvent<HTMLInputElement>) {
    composingRef.current = true;
    if (onCompositionStart) onCompositionStart(event);
  }

  function handleCompositionEnd(event: CompositionEvent<HTMLInputElement>) {
    composingRef.current = false;
    if (onCompositionEnd) onCompositionEnd(event);
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    composingRef.current = false;
    if (onBlur) onBlur(event);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (onKeyDown) onKeyDown(event);
    if (event.key !== "Enter" || event.defaultPrevented || disabled) return;

    const composing =
      composingRef.current || event.nativeEvent.isComposing || event.keyCode === 229;
    if (composing) return;

    if (loading || event.repeat) {
      event.preventDefault();
      return;
    }

    // Supplying onSearch makes it the sole owner of Enter. Without it, the
    // browser keeps its native form-submit behavior.
    if (!onSearch) return;
    event.preventDefault();
    onSearch(event.currentTarget.value, { event, source: "enter" });
  }

  function clear(event: MouseEvent<HTMLButtonElement>) {
    if (disabled || readOnly || loading) return;
    const details: SearchFieldClearDetails = { event, source: "clear" };
    updateValue("", details);
    const element = inputRef.current;
    if (element) element.focus();
    if (onClear) onClear(details);
  }

  return (
    <span
      className={className ? `${rootClasses} ${className}` : rootClasses}
      dir={dir}
      style={style}
      data-meu-component="search-field"
      data-readonly={readOnly || undefined}
      data-size={size}
      data-state={
        disabled
          ? "disabled"
          : loading
            ? "loading"
            : readOnly
              ? "read-only"
              : invalid
                ? "error"
                : "default"
      }
    >
      <span className={searchIcon} aria-hidden="true">
        <MeuIconSearch size={18} />
      </span>
      <input
        {...props}
        ref={(element) => {
          inputRef.current = element;
          assignRef(forwardedRef, element);
        }}
        id={resolvedId}
        className={input}
        type="search"
        dir={dir}
        form={form}
        disabled={disabled}
        readOnly={readOnly}
        required={resolvedRequired}
        enterKeyHint={enterKeyHint}
        value={currentValue}
        onBlur={handleBlur}
        onChange={handleChange}
        onCompositionEnd={handleCompositionEnd}
        onCompositionStart={handleCompositionStart}
        onKeyDown={handleKeyDown}
        aria-busy={loading ? true : ariaBusy}
        aria-describedby={describedBy}
        aria-invalid={resolvedAriaInvalid}
        aria-label={ariaLabel}
        aria-labelledby={labelledBy}
      />
      {loading ? (
        <span
          className={loadingIndicator}
          role="status"
          aria-atomic="true"
          aria-live="polite"
          aria-label={loadingLabel}
        >
          <span className={spinner} aria-hidden="true" />
          <VisuallyHidden>{loadingLabel}</VisuallyHidden>
        </span>
      ) : clearable && currentValue.length > 0 && !disabled && !readOnly ? (
        <button
          type="button"
          className={clearButton}
          aria-label={clearLabel}
          onClick={clear}
          onBlur={() => {
            clearFocusedRef.current = false;
          }}
          onFocus={() => {
            clearFocusedRef.current = true;
          }}
          onMouseDown={(event) => event.preventDefault()}
        >
          <MeuIconX size={18} />
        </button>
      ) : null}
    </span>
  );
});
