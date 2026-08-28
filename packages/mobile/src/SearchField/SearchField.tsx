"use client";

import { MeuIconSearch, MeuIconX } from "@meu/icons-react";
import { VisuallyHidden } from "@meu/primitives-react";
import { forwardRef, useRef, useState } from "react";
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
    className,
    clearLabel: clearLabelProp,
    clearable = true,
    defaultValue = "",
    disabled = false,
    enterKeyHint = "search",
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
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const controlled = value !== undefined;
  const currentValue = controlled ? value : uncontrolledValue;
  const resolvedId = id || (fieldContext ? fieldContext.controlId : undefined);
  const describedBy =
    ariaDescribedBy !== undefined
      ? ariaDescribedBy
      : fieldContext
        ? fieldContext.describedBy
        : undefined;
  const explicitlyInvalid =
    ariaInvalid === true ||
    ariaInvalid === "true" ||
    ariaInvalid === "grammar" ||
    ariaInvalid === "spelling";
  const invalid =
    explicitlyInvalid || status === "error" || Boolean(fieldContext && fieldContext.invalid);
  const resolvedAriaInvalid =
    ariaInvalid === "grammar" || ariaInvalid === "spelling" ? ariaInvalid : invalid || undefined;
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
        disabled={disabled}
        readOnly={readOnly}
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
          onMouseDown={(event) => event.preventDefault()}
        >
          <MeuIconX size={18} />
        </button>
      ) : null}
    </span>
  );
});
