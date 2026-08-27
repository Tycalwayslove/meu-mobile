"use client";

import { MeuIconSearch, MeuIconX } from "@meu/icons-react";
import { forwardRef, useRef, useState } from "react";
import type { ChangeEvent, ForwardedRef, KeyboardEvent } from "react";

import { useMeuConfig } from "../ConfigProvider";
import { useFieldContext } from "../Field/FieldContext";
import { clearButton, input, root, searchIcon, spinner } from "./SearchField.css";
import type { SearchFieldProps } from "./types";

function assignRef<T>(ref: ForwardedRef<T>, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  {
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    className,
    clearable = true,
    defaultValue = "",
    disabled = false,
    enterKeyHint = "search",
    id,
    loading = false,
    onChange,
    onClear,
    onKeyDown,
    onSearch,
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
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const controlled = value !== undefined;
  const currentValue = controlled ? value : uncontrolledValue;
  const resolvedId = id || (fieldContext ? fieldContext.controlId : undefined);
  const describedBy = ariaDescribedBy || (fieldContext ? fieldContext.describedBy : undefined);
  const invalid =
    ariaInvalid === true ||
    ariaInvalid === "true" ||
    status === "error" ||
    Boolean(fieldContext && fieldContext.invalid);
  const rootClasses = root({ disabled, size, status: invalid ? "error" : status });
  const clearLabel = config.locale === "en-US" ? "Clear search" : "清除搜索";

  function updateValue(nextValue: string) {
    if (!controlled) setUncontrolledValue(nextValue);
    if (onChange) onChange(nextValue);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    updateValue(event.target.value);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (onKeyDown) onKeyDown(event);
    if (event.key === "Enter" && !event.nativeEvent.isComposing && !loading && onSearch) {
      onSearch(currentValue);
    }
  }

  function clear() {
    updateValue("");
    const element = inputRef.current;
    if (element) element.focus();
    if (onClear) onClear();
  }

  return (
    <span
      className={className ? `${rootClasses} ${className}` : rootClasses}
      aria-busy={loading}
      style={style}
      data-meu-component="search-field"
      data-size={size}
      data-state={loading ? "loading" : disabled ? "disabled" : invalid ? "error" : "default"}
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
        enterKeyHint={enterKeyHint}
        value={currentValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
      />
      {loading ? (
        <span className={spinner} aria-hidden="true" />
      ) : clearable && currentValue.length > 0 && !disabled ? (
        <button type="button" className={clearButton} aria-label={clearLabel} onClick={clear}>
          <MeuIconX size={18} />
        </button>
      ) : null}
    </span>
  );
});
