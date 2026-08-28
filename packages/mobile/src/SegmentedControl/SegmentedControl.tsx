"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { FocusEvent, ForwardedRef } from "react";

import { useFieldContext } from "../Field/FieldContext";
import { icon, input, item, label, option, root } from "./SegmentedControl.css";
import type { SegmentedControlOption, SegmentedControlProps, SegmentedControlValue } from "./types";

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

function valueIdentity(value: SegmentedControlValue): string {
  return `${typeof value}:${String(value)}`;
}

function uniqueOptions<TValue extends SegmentedControlValue>(
  options: readonly SegmentedControlOption<TValue>[]
): SegmentedControlOption<TValue>[] {
  const identities = new Set<string>();
  return options.filter((candidate) => {
    const identity = valueIdentity(candidate.value);
    if (identities.has(identity)) return false;
    identities.add(identity);
    return true;
  });
}

function initialSelection<TValue extends SegmentedControlValue>(
  options: readonly SegmentedControlOption<TValue>[],
  defaultValue: TValue | undefined
): TValue | null {
  if (defaultValue !== undefined) {
    const matched = options.find(
      (candidate) =>
        !candidate.disabled && valueIdentity(candidate.value) === valueIdentity(defaultValue)
    );
    if (matched) return matched.value;
  }
  const firstEnabled = options.find((candidate) => !candidate.disabled);
  return firstEnabled ? firstEnabled.value : null;
}

function containsValue<TValue extends SegmentedControlValue>(
  options: readonly SegmentedControlOption<TValue>[],
  value: TValue | null
): value is TValue {
  return (
    value !== null &&
    options.some(
      (candidate) => !candidate.disabled && valueIdentity(candidate.value) === valueIdentity(value)
    )
  );
}

function optionsSignature<TValue extends SegmentedControlValue>(
  options: readonly SegmentedControlOption<TValue>[]
): string {
  return JSON.stringify(
    options.map(
      (candidate) => `${valueIdentity(candidate.value)}:${candidate.disabled ? "1" : "0"}`
    )
  );
}

/**
 * Compact mutually exclusive switch backed by a native radio group for keyboard and form
 * behavior.
 *
 * @public
 */
export function SegmentedControl<TValue extends SegmentedControlValue = SegmentedControlValue>({
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  block = false,
  className,
  defaultValue,
  disabled = false,
  form,
  id,
  name,
  onChange,
  onFocus,
  options,
  ref,
  required = false,
  size = "medium",
  status = "default",
  tabIndex = -1,
  value,
  ...props
}: SegmentedControlProps<TValue>) {
  const generatedId = useId();
  const generatedName = `meu-segmented-${generatedId}`;
  const fieldContext = useFieldContext();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRefsRef = useRef(new Map<string, HTMLInputElement>());
  const [initialDefaultValue] = useState(defaultValue);
  const normalizedOptions = useMemo(() => uniqueOptions(options), [options]);
  const normalizedOptionsSignature = optionsSignature(normalizedOptions);
  const controlled = value !== undefined;
  const [uncontrolledState, setUncontrolledState] = useState(() => ({
    optionsSignature: optionsSignature(uniqueOptions(options)),
    value: initialSelection(uniqueOptions(options), defaultValue)
  }));
  let uncontrolledValue = uncontrolledState.value;
  if (!controlled && uncontrolledState.optionsSignature !== normalizedOptionsSignature) {
    uncontrolledValue = containsValue(normalizedOptions, uncontrolledValue)
      ? uncontrolledValue
      : initialSelection(normalizedOptions, undefined);
    setUncontrolledState({
      optionsSignature: normalizedOptionsSignature,
      value: uncontrolledValue
    });
  }
  const currentCandidate = controlled ? value : uncontrolledValue;
  const currentValue = containsValue(normalizedOptions, currentCandidate) ? currentCandidate : null;
  const resolvedId = id || (fieldContext ? fieldContext.controlId : undefined);
  const optionIdPrefix = resolvedId || `meu-segmented-${generatedId}`;
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
  const classes = root({ block, status: invalid ? "error" : status });
  const firstEnabledIndex = normalizedOptions.findIndex((candidate) => !candidate.disabled);
  const resetValue = initialSelection(normalizedOptions, initialDefaultValue);
  const resetConfigRef = useRef({
    optionsSignature: normalizedOptionsSignature,
    value: resetValue
  });

  useLayoutEffect(() => {
    resetConfigRef.current = {
      optionsSignature: normalizedOptionsSignature,
      value: resetValue
    };
    normalizedOptions.forEach((candidate) => {
      const element = inputRefsRef.current.get(valueIdentity(candidate.value));
      if (!element) return;
      element.defaultChecked =
        resetValue !== null && valueIdentity(resetValue) === valueIdentity(candidate.value);
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
        inputElement.defaultChecked =
          resetConfig.value !== null && valueIdentity(resetConfig.value) === identity;
      });
      setUncontrolledState({
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

  return (
    <div
      {...props}
      ref={(element) => {
        rootRef.current = element;
        assignRef(ref, element);
      }}
      id={resolvedId}
      role="radiogroup"
      tabIndex={tabIndex}
      className={className ? `${classes} ${className}` : classes}
      onFocus={handleRootFocus}
      aria-describedby={describedBy}
      aria-disabled={disabled || undefined}
      aria-invalid={invalid || undefined}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel ? undefined : labelledBy}
      aria-required={resolvedRequired || undefined}
      data-meu-component="segmented-control"
      data-size={size}
      data-state={disabled ? "disabled" : invalid ? "error" : "default"}
    >
      {normalizedOptions.map((candidate, index) => {
        const active =
          currentValue !== null && valueIdentity(currentValue) === valueIdentity(candidate.value);
        const optionDisabled = disabled || Boolean(candidate.disabled);
        const optionId = `${optionIdPrefix}-option-${index}`;
        const optionLabelId = `${optionId}-label`;
        return (
          <div
            className={item({ block })}
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
              type="radio"
              form={form}
              name={resolvedName}
              value={candidate.value}
              checked={active}
              disabled={optionDisabled}
              required={resolvedRequired && index === firstEnabledIndex}
              aria-describedby={describedBy}
              aria-label={candidate.ariaLabel}
              aria-labelledby={candidate.ariaLabel ? undefined : optionLabelId}
              onChange={(event) => {
                if (optionDisabled || !event.target.checked) return;
                if (!controlled) {
                  setUncontrolledState({
                    optionsSignature: normalizedOptionsSignature,
                    value: candidate.value
                  });
                }
                if (onChange) onChange(candidate.value, event);
              }}
            />
            <label
              htmlFor={optionId}
              className={option({ active, disabled: optionDisabled, size })}
            >
              {candidate.icon !== undefined && candidate.icon !== null ? (
                <span className={icon} aria-hidden="true">
                  {candidate.icon}
                </span>
              ) : null}
              <span id={optionLabelId} className={label}>
                {candidate.label}
              </span>
            </label>
          </div>
        );
      })}
    </div>
  );
}
