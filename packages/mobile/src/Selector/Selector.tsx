"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, FocusEvent, ForwardedRef, MouseEvent } from "react";

import { useFieldContext } from "../Field/FieldContext";
import {
  checkMark,
  description,
  input,
  item,
  label,
  option,
  root,
  withCheckMark
} from "./Selector.css";
import type { SelectorChangeDetails, SelectorOption, SelectorProps, SelectorValue } from "./types";

type SelectorStyle = CSSProperties & { "--meu-selector-columns": string };

function assignRef<T>(ref: ForwardedRef<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

function mergeIdReferences(...values: Array<string | undefined>): string | undefined {
  const ids: string[] = [];
  values.forEach((value) => {
    if (!value) return;
    value.split(/\s+/).forEach((id) => {
      if (id && ids.indexOf(id) === -1) ids.push(id);
    });
  });
  return ids.length > 0 ? ids.join(" ") : undefined;
}

function valueIdentity(value: SelectorValue): string {
  return `${typeof value}:${String(value)}`;
}

function uniqueOptions<TValue extends SelectorValue>(
  options: readonly SelectorOption<TValue>[]
): SelectorOption<TValue>[] {
  const identities = new Set<string>();
  return options.filter((candidate) => {
    const identity = valueIdentity(candidate.value);
    if (identities.has(identity)) return false;
    identities.add(identity);
    return true;
  });
}

function normalizeSelection<TValue extends SelectorValue>(
  options: readonly SelectorOption<TValue>[],
  candidates: readonly TValue[],
  multiple: boolean
): TValue[] {
  const values = options
    .filter(
      (optionCandidate) =>
        !optionCandidate.disabled &&
        candidates.some(
          (candidate) => valueIdentity(candidate) === valueIdentity(optionCandidate.value)
        )
    )
    .map((candidate) => candidate.value);
  return multiple ? values : values.slice(0, 1);
}

function optionsSignature<TValue extends SelectorValue>(
  options: readonly SelectorOption<TValue>[]
): string {
  return JSON.stringify(
    options.map(
      (candidate) => `${valueIdentity(candidate.value)}:${candidate.disabled ? "1" : "0"}`
    )
  );
}

/**
 * Card-style native radio or checkbox collection with deterministic value ordering and native
 * form submission.
 *
 * @public
 */
export function Selector<TValue extends SelectorValue = SelectorValue>({
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  allowClear = true,
  className,
  columns = 2,
  defaultValue = [],
  disabled = false,
  form,
  id,
  multiple = false,
  name,
  onChange,
  onFocus,
  options,
  ref,
  required = false,
  showCheckMark = true,
  size = "medium",
  status = "default",
  style,
  tabIndex = -1,
  value,
  ...props
}: SelectorProps<TValue>) {
  const generatedId = useId();
  const generatedName = `meu-selector-${generatedId}`;
  const fieldContext = useFieldContext();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRefsRef = useRef(new Map<string, HTMLInputElement>());
  const [initialDefaultValue] = useState(defaultValue);
  const normalizedOptions = useMemo(() => uniqueOptions(options), [options]);
  const normalizedOptionsSignature = optionsSignature(normalizedOptions);
  const controlled = value !== undefined;
  const [uncontrolledState, setUncontrolledState] = useState(() => ({
    multiple,
    optionsSignature: optionsSignature(uniqueOptions(options)),
    value: normalizeSelection(uniqueOptions(options), defaultValue, multiple)
  }));
  let uncontrolledValue = uncontrolledState.value;
  if (
    !controlled &&
    (uncontrolledState.multiple !== multiple ||
      uncontrolledState.optionsSignature !== normalizedOptionsSignature)
  ) {
    uncontrolledValue = normalizeSelection(normalizedOptions, uncontrolledValue, multiple);
    setUncontrolledState({
      multiple,
      optionsSignature: normalizedOptionsSignature,
      value: uncontrolledValue
    });
  }
  const currentValue = normalizeSelection(
    normalizedOptions,
    controlled ? value : uncontrolledValue,
    multiple
  );
  const resolvedId = id || (fieldContext ? fieldContext.controlId : undefined);
  const optionIdPrefix = resolvedId || `meu-selector-${generatedId}`;
  const describedBy = mergeIdReferences(
    ariaDescribedBy,
    fieldContext ? fieldContext.describedBy : undefined
  );
  const labelledBy = mergeIdReferences(
    ariaLabel ? undefined : ariaLabelledBy,
    ariaLabel ? undefined : fieldContext ? fieldContext.labelId : undefined
  );
  const invalid =
    ariaInvalid === true ||
    ariaInvalid === "true" ||
    status === "error" ||
    Boolean(fieldContext && fieldContext.invalid);
  const resolvedRequired = required || Boolean(fieldContext && fieldContext.required);
  const resolvedName = name || generatedName;
  const safeColumns = Number.isFinite(columns) ? Math.min(Math.max(Math.trunc(columns), 1), 6) : 2;
  const rootStyle: SelectorStyle = { ...style, "--meu-selector-columns": String(safeColumns) };
  const firstEnabledIndex = normalizedOptions.findIndex((candidate) => !candidate.disabled);
  const resetValue = normalizeSelection(normalizedOptions, initialDefaultValue, multiple);
  const resetConfigRef = useRef({
    multiple,
    optionsSignature: normalizedOptionsSignature,
    value: resetValue
  });

  useLayoutEffect(() => {
    resetConfigRef.current = {
      multiple,
      optionsSignature: normalizedOptionsSignature,
      value: resetValue
    };
    normalizedOptions.forEach((candidate) => {
      const element = inputRefsRef.current.get(valueIdentity(candidate.value));
      if (!element) return;
      element.defaultChecked = resetValue.some(
        (itemValue) => valueIdentity(itemValue) === valueIdentity(candidate.value)
      );
    });
  });

  useEffect(() => {
    if (controlled) return undefined;
    const handleReset = (event: Event) => {
      const firstInput = inputRefsRef.current.values().next().value;
      const element = rootRef.current;
      const ownerForm = firstInput ? firstInput.form : element ? element.closest("form") : null;
      if (!(ownerForm instanceof HTMLFormElement) || event.target !== ownerForm) return;
      if (event.defaultPrevented) return;
      const resetConfig = resetConfigRef.current;
      inputRefsRef.current.forEach((inputElement, identity) => {
        inputElement.defaultChecked = resetConfig.value.some(
          (itemValue) => valueIdentity(itemValue) === identity
        );
      });
      setUncontrolledState({
        multiple: resetConfig.multiple,
        optionsSignature: resetConfig.optionsSignature,
        value: resetConfig.value
      });
    };
    document.addEventListener("reset", handleReset);
    return () => {
      document.removeEventListener("reset", handleReset);
    };
  }, [controlled]);

  function focusPreferredInput() {
    let firstEnabled: HTMLInputElement | null = null;
    for (const candidate of normalizedOptions) {
      const element = inputRefsRef.current.get(valueIdentity(candidate.value));
      if (!element || element.disabled) continue;
      if (!firstEnabled) firstEnabled = element;
      if (element.checked) {
        element.focus();
        return true;
      }
    }
    if (firstEnabled) {
      firstEnabled.focus();
      return true;
    }
    return false;
  }

  function handleRootFocus(event: FocusEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget && focusPreferredInput()) return;
    if (onFocus) onFocus(event);
  }

  function publish(nextCandidates: TValue[], details: SelectorChangeDetails<TValue>) {
    const nextValue = normalizeSelection(normalizedOptions, nextCandidates, multiple);
    const selectedOptions = normalizedOptions.filter((candidate) =>
      nextValue.some((itemValue) => valueIdentity(itemValue) === valueIdentity(candidate.value))
    );
    if (!controlled) {
      setUncontrolledState({
        multiple,
        optionsSignature: normalizedOptionsSignature,
        value: nextValue
      });
    }
    if (onChange) onChange(nextValue, selectedOptions, details);
  }

  function handleSingleClick(
    event: MouseEvent<HTMLInputElement>,
    candidate: SelectorOption<TValue>,
    active: boolean,
    optionDisabled: boolean
  ) {
    if (!multiple && active && allowClear && !resolvedRequired && !optionDisabled) {
      event.preventDefault();
      publish([], { event, option: candidate, source: "clear" });
    }
  }

  return (
    <div
      {...props}
      ref={(element) => {
        rootRef.current = element;
        assignRef(ref, element);
      }}
      id={resolvedId}
      role={multiple ? "group" : "radiogroup"}
      tabIndex={tabIndex}
      className={
        className
          ? `${root({ size, status: invalid ? "error" : status })} ${className}`
          : root({ size, status: invalid ? "error" : status })
      }
      style={rootStyle}
      onFocus={handleRootFocus}
      aria-describedby={describedBy}
      aria-disabled={disabled || undefined}
      aria-invalid={invalid || undefined}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel ? undefined : labelledBy}
      aria-required={!multiple && resolvedRequired ? true : undefined}
      data-meu-component="selector"
      data-mode={multiple ? "multiple" : "single"}
      data-size={size}
      data-state={disabled ? "disabled" : invalid ? "error" : "default"}
    >
      {normalizedOptions.map((candidate, index) => {
        const active = currentValue.some(
          (itemValue) => valueIdentity(itemValue) === valueIdentity(candidate.value)
        );
        const optionDisabled = disabled || Boolean(candidate.disabled);
        const optionId = `${optionIdPrefix}-option-${index}`;
        const optionLabelId = `${optionId}-label`;
        const hasDescription =
          candidate.description !== undefined &&
          candidate.description !== null &&
          candidate.description !== false;
        const optionDescriptionId = hasDescription ? `${optionId}-description` : undefined;
        const checkboxRequired =
          multiple && resolvedRequired && currentValue.length === 0 && index === firstEnabledIndex;
        return (
          <div
            className={item}
            key={valueIdentity(candidate.value)}
            data-disabled={optionDisabled ? "true" : "false"}
            data-selected={active ? "true" : "false"}
          >
            <input
              ref={(element) => {
                const identity = valueIdentity(candidate.value);
                if (element) inputRefsRef.current.set(identity, element);
                else inputRefsRef.current.delete(identity);
              }}
              className={input}
              id={optionId}
              type={multiple ? "checkbox" : "radio"}
              form={form}
              name={resolvedName}
              value={candidate.value}
              checked={active}
              disabled={optionDisabled}
              required={multiple ? checkboxRequired : resolvedRequired}
              aria-describedby={mergeIdReferences(describedBy, optionDescriptionId)}
              aria-label={candidate.ariaLabel}
              aria-labelledby={candidate.ariaLabel ? undefined : optionLabelId}
              onClick={(event) => handleSingleClick(event, candidate, active, optionDisabled)}
              onChange={(event) => {
                if (optionDisabled) return;
                if (multiple) {
                  publish(
                    event.target.checked
                      ? [...currentValue, candidate.value]
                      : currentValue.filter(
                          (itemValue) => valueIdentity(itemValue) !== valueIdentity(candidate.value)
                        ),
                    { event, option: candidate, source: "option" }
                  );
                } else if (event.target.checked) {
                  publish([candidate.value], {
                    event,
                    option: candidate,
                    source: "option"
                  });
                }
              }}
            />
            <label
              htmlFor={optionId}
              className={`${option({ active, disabled: optionDisabled, size })}${
                active && showCheckMark ? ` ${withCheckMark}` : ""
              }`}
            >
              <span id={optionLabelId} className={label}>
                {candidate.label}
              </span>
              {hasDescription ? (
                <span id={optionDescriptionId} className={description}>
                  {candidate.description}
                </span>
              ) : null}
              {active && showCheckMark ? <span className={checkMark} aria-hidden="true" /> : null}
            </label>
          </div>
        );
      })}
    </div>
  );
}
