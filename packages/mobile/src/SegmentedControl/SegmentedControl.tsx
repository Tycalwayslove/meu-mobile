"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type {
  ChangeEvent as ReactChangeEvent,
  FocusEvent,
  ForwardedRef,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent
} from "react";

import { useMeuConfig } from "../ConfigProvider";
import { useFieldContext } from "../Field/FieldContext";
import { icon, indicator, input, item, label, option, root } from "./SegmentedControl.css";
import type { SegmentedControlOption, SegmentedControlProps, SegmentedControlValue } from "./types";

type SegmentedIndicatorVariables = {
  "--meu-segmented-indicator-opacity": string;
  "--meu-segmented-indicator-width": string;
  "--meu-segmented-indicator-x": string;
};

function assignRef<T>(ref: ForwardedRef<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

function setIndicatorVariable(
  element: HTMLElement,
  property: keyof SegmentedIndicatorVariables,
  value: string
) {
  element.style.setProperty(property, value);
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
 * Compact mutually exclusive switch with native radio or APG tablist semantics.
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
  mode = "radiogroup",
  name,
  onBlur,
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
  const { dir: configuredDir, locale, motion } = useMeuConfig();
  const generatedId = useId();
  const generatedName = `meu-segmented-${generatedId}`;
  const fieldContext = useFieldContext();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLSpanElement | null>(null);
  const controlRefsRef = useRef(new Map<string, HTMLInputElement | HTMLButtonElement>());
  const focusedControlRef = useRef<HTMLInputElement | HTMLButtonElement | null>(null);
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
  const currentIdentity = currentValue === null ? null : valueIdentity(currentValue);
  const firstEnabled = normalizedOptions.find((candidate) => !candidate.disabled);
  const firstEnabledIdentity = firstEnabled ? valueIdentity(firstEnabled.value) : null;
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
  const resolvedAriaLabel = ariaLabel
    ? ariaLabel
    : labelledBy
      ? undefined
      : locale === "en-US"
        ? "Segmented control"
        : "分段选择";
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
  const resolvedRequired =
    mode === "radiogroup" && (required || Boolean(fieldContext && fieldContext.required));
  const resolvedName = name || generatedName;
  const classes = root({ block, status: invalid ? "error" : status });
  const firstEnabledIndex = normalizedOptions.findIndex((candidate) => !candidate.disabled);
  const resetValue = initialSelection(normalizedOptions, initialDefaultValue);
  const resetConfigRef = useRef({
    optionsSignature: normalizedOptionsSignature,
    value: resetValue
  });
  const focusStateRef = useRef({ identity: currentIdentity, within: false });
  const [tabFocusState, setTabFocusState] = useState({
    identity: currentIdentity,
    within: false
  });
  const focusedOption = normalizedOptions.find(
    (candidate) => valueIdentity(candidate.value) === tabFocusState.identity
  );
  const focusIsValid = Boolean(focusedOption && !focusedOption.disabled && !disabled);
  const rovingIdentity =
    tabFocusState.within && focusIsValid
      ? tabFocusState.identity
      : currentIdentity || firstEnabledIdentity;

  const setRootRef = useCallback(
    (element: HTMLDivElement | null) => {
      rootRef.current = element;
      assignRef(ref, element);
    },
    [ref]
  );

  useLayoutEffect(() => {
    resetConfigRef.current = {
      optionsSignature: normalizedOptionsSignature,
      value: resetValue
    };
    if (mode !== "radiogroup") return;
    normalizedOptions.forEach((candidate) => {
      const element = controlRefsRef.current.get(valueIdentity(candidate.value));
      if (!(element instanceof HTMLInputElement)) return;
      element.defaultChecked =
        resetValue !== null && valueIdentity(resetValue) === valueIdentity(candidate.value);
    });
  });

  useEffect(() => {
    if (controlled || mode !== "radiogroup") return undefined;
    const handleReset = (event: Event) => {
      const firstControl = controlRefsRef.current.values().next().value;
      const firstInput = firstControl instanceof HTMLInputElement ? firstControl : null;
      const element = rootRef.current;
      const ownerForm = firstInput ? firstInput.form : element ? element.closest("form") : null;
      if (!(ownerForm instanceof HTMLFormElement) || event.target !== ownerForm) return;
      if (event.defaultPrevented) return;
      const resetConfig = resetConfigRef.current;
      controlRefsRef.current.forEach((controlElement, identity) => {
        if (controlElement instanceof HTMLInputElement) {
          controlElement.defaultChecked =
            resetConfig.value !== null && valueIdentity(resetConfig.value) === identity;
        }
      });
      setUncontrolledState({
        optionsSignature: resetConfig.optionsSignature,
        value: resetConfig.value
      });
    };
    document.addEventListener("reset", handleReset);
    return () => document.removeEventListener("reset", handleReset);
  }, [controlled, mode]);

  useLayoutEffect(() => {
    const focusState = focusStateRef.current;
    if (!focusState.within) return;
    const focusedCandidate = normalizedOptions.find(
      (candidate) => valueIdentity(candidate.value) === focusState.identity
    );
    const focusedControl = focusedControlRef.current;
    const replacementControl = focusState.identity
      ? controlRefsRef.current.get(focusState.identity)
      : undefined;
    const focusedCandidateIsAvailable = Boolean(
      focusedCandidate && !focusedCandidate.disabled && !disabled
    );
    const focusedControlWasReplaced = Boolean(
      focusedControl && (replacementControl !== focusedControl || !focusedControl.isConnected)
    );
    if (focusedCandidateIsAvailable && !focusedControlWasReplaced) return;
    const activeElement = document.activeElement;
    const focusCanBeRecovered =
      activeElement === document.body || activeElement === focusedControl || !activeElement;
    if (!focusCanBeRecovered) return;
    const fallbackIdentity = focusedCandidateIsAvailable
      ? focusState.identity
      : currentIdentity || firstEnabledIdentity;
    const fallback = fallbackIdentity ? controlRefsRef.current.get(fallbackIdentity) : undefined;
    if (fallback && !fallback.disabled) {
      focusedControlRef.current = fallback;
      fallback.focus();
    }
  }, [
    currentIdentity,
    disabled,
    firstEnabledIdentity,
    mode,
    normalizedOptions,
    normalizedOptionsSignature
  ]);

  useLayoutEffect(() => {
    const rootNode = rootRef.current;
    const indicatorNode = indicatorRef.current;
    if (!rootNode || !indicatorNode) return undefined;

    const updateIndicator = () => {
      const selectedControl = currentIdentity
        ? controlRefsRef.current.get(currentIdentity)
        : undefined;
      const selectedItem = selectedControl ? selectedControl.parentElement : null;
      if (!selectedItem) {
        setIndicatorVariable(indicatorNode, "--meu-segmented-indicator-opacity", "0");
        return;
      }
      const rootRect = rootNode.getBoundingClientRect();
      const itemRect = selectedItem.getBoundingClientRect();
      setIndicatorVariable(
        indicatorNode,
        "--meu-segmented-indicator-x",
        `${itemRect.left - rootRect.left}px`
      );
      setIndicatorVariable(indicatorNode, "--meu-segmented-indicator-width", `${itemRect.width}px`);
      setIndicatorVariable(indicatorNode, "--meu-segmented-indicator-opacity", "1");
    };

    updateIndicator();
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(updateIndicator);
      observer.observe(rootNode);
      rootNode.querySelectorAll<HTMLElement>("[data-segmented-item]").forEach((element) => {
        if (observer) observer.observe(element);
      });
    } else {
      window.addEventListener("resize", updateIndicator);
    }
    return () => {
      if (observer) observer.disconnect();
      else window.removeEventListener("resize", updateIndicator);
    };
  }, [block, currentIdentity, mode, normalizedOptionsSignature, size]);

  function focusPreferredControl() {
    let firstEnabledControl: HTMLInputElement | HTMLButtonElement | null = null;
    for (const candidate of normalizedOptions) {
      const element = controlRefsRef.current.get(valueIdentity(candidate.value));
      if (!element || element.disabled) continue;
      if (!firstEnabledControl) firstEnabledControl = element;
      if (valueIdentity(candidate.value) === currentIdentity) {
        element.focus();
        return true;
      }
    }
    if (firstEnabledControl) {
      firstEnabledControl.focus();
      return true;
    }
    return false;
  }

  function handleRootFocus(event: FocusEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget && focusPreferredControl()) return;
    if (onFocus) onFocus(event);
  }

  function handleRootBlur(event: FocusEvent<HTMLDivElement>) {
    if (onBlur) onBlur(event);
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) return;
    if (nextTarget instanceof Node) {
      focusStateRef.current = { ...focusStateRef.current, within: false };
      focusedControlRef.current = null;
      if (mode === "tabs") {
        setTabFocusState((previous) => ({ ...previous, within: false }));
      }
      return;
    }
    void Promise.resolve().then(() => {
      const rootNode = rootRef.current;
      if (!rootNode || !rootNode.contains(document.activeElement)) {
        focusStateRef.current = { ...focusStateRef.current, within: false };
        focusedControlRef.current = null;
        if (mode === "tabs") {
          setTabFocusState((previous) => ({ ...previous, within: false }));
        }
      }
    });
  }

  function recordFocus(identity: string, control?: HTMLInputElement | HTMLButtonElement | null) {
    focusStateRef.current = { identity, within: true };
    if (control) focusedControlRef.current = control;
    if (mode === "tabs") setTabFocusState({ identity, within: true });
  }

  function commitSelection(candidate: SegmentedControlOption<TValue>) {
    if (disabled || candidate.disabled || valueIdentity(candidate.value) === currentIdentity)
      return false;
    if (!controlled) {
      setUncontrolledState({
        optionsSignature: normalizedOptionsSignature,
        value: candidate.value
      });
    }
    return true;
  }

  function selectRadio(
    candidate: SegmentedControlOption<TValue>,
    event: ReactChangeEvent<HTMLInputElement>
  ) {
    if (!commitSelection(candidate)) return;
    const radioOnChange = onChange as
      ((nextValue: TValue, changeEvent: ReactChangeEvent<HTMLInputElement>) => void) | undefined;
    if (radioOnChange) radioOnChange(candidate.value, event);
  }

  function selectTab(
    candidate: SegmentedControlOption<TValue>,
    event: ReactMouseEvent<HTMLButtonElement> | ReactKeyboardEvent<HTMLButtonElement>
  ) {
    if (!commitSelection(candidate)) return;
    const tabOnChange = onChange as
      | ((
          nextValue: TValue,
          changeEvent: ReactMouseEvent<HTMLButtonElement> | ReactKeyboardEvent<HTMLButtonElement>
        ) => void)
      | undefined;
    if (tabOnChange) tabOnChange(candidate.value, event);
  }

  function handleTabKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
    candidate: SegmentedControlOption<TValue>
  ) {
    const enabledOptions = normalizedOptions.filter((itemOption) => !itemOption.disabled);
    if (disabled || enabledOptions.length === 0) return;
    const currentIndex = enabledOptions.findIndex(
      (itemOption) => valueIdentity(itemOption.value) === valueIdentity(candidate.value)
    );
    const directionOwner = event.currentTarget.closest<HTMLElement>("[dir]");
    const inheritedDirection = directionOwner ? directionOwner.dir : undefined;
    const direction =
      inheritedDirection === "rtl" || inheritedDirection === "ltr"
        ? inheritedDirection
        : configuredDir;
    let target: SegmentedControlOption<TValue> | undefined;

    if (event.key === "ArrowRight") {
      const offset = direction === "rtl" ? -1 : 1;
      target =
        enabledOptions[(currentIndex + offset + enabledOptions.length) % enabledOptions.length];
    } else if (event.key === "ArrowLeft") {
      const offset = direction === "rtl" ? 1 : -1;
      target =
        enabledOptions[(currentIndex + offset + enabledOptions.length) % enabledOptions.length];
    } else if (event.key === "Home") {
      target = enabledOptions[0];
    } else if (event.key === "End") {
      target = enabledOptions[enabledOptions.length - 1];
    }
    if (!target) return;
    event.preventDefault();
    const targetIdentity = valueIdentity(target.value);
    const targetControl = controlRefsRef.current.get(targetIdentity);
    recordFocus(targetIdentity, targetControl);
    if (targetControl) targetControl.focus();
    selectTab(target, event);
  }

  return (
    <div
      {...props}
      ref={setRootRef}
      id={resolvedId}
      role={mode === "tabs" ? "tablist" : "radiogroup"}
      tabIndex={tabIndex}
      className={className ? `${classes} ${className}` : classes}
      onBlur={handleRootBlur}
      onFocus={handleRootFocus}
      aria-describedby={describedBy}
      aria-disabled={disabled || undefined}
      aria-invalid={resolvedAriaInvalid}
      aria-label={resolvedAriaLabel}
      aria-labelledby={ariaLabel ? undefined : labelledBy}
      aria-orientation="horizontal"
      aria-required={resolvedRequired || undefined}
      data-meu-component="segmented-control"
      data-mode={mode}
      data-motion={motion}
      data-size={size}
      data-state={disabled ? "disabled" : invalid ? "error" : "default"}
    >
      <span ref={indicatorRef} className={indicator({ motion })} aria-hidden="true" />
      {normalizedOptions.map((candidate, index) => {
        const identity = valueIdentity(candidate.value);
        const active = currentIdentity === identity;
        const optionDisabled = disabled || Boolean(candidate.disabled);
        const optionId = `${optionIdPrefix}-option-${index}`;
        const optionLabelId = `${optionId}-label`;
        const optionClasses = option({ active, disabled: optionDisabled, size });
        const sharedContent = (
          <>
            {candidate.icon !== undefined && candidate.icon !== null ? (
              <span className={icon} aria-hidden="true">
                {candidate.icon}
              </span>
            ) : null}
            <span id={optionLabelId} className={label}>
              {candidate.label}
            </span>
          </>
        );
        return (
          <div
            className={item({ block })}
            key={identity}
            data-segmented-item=""
            data-disabled={optionDisabled ? "true" : "false"}
            data-selected={active ? "true" : "false"}
          >
            {mode === "tabs" ? (
              <button
                ref={(element) => {
                  if (element) controlRefsRef.current.set(identity, element);
                  else controlRefsRef.current.delete(identity);
                }}
                className={optionClasses}
                id={candidate.tabId || optionId}
                type="button"
                role="tab"
                disabled={optionDisabled}
                tabIndex={optionDisabled ? -1 : identity === rovingIdentity ? 0 : -1}
                aria-controls={candidate.panelId}
                aria-describedby={describedBy}
                aria-label={candidate.ariaLabel}
                aria-selected={active}
                onClick={(event: ReactMouseEvent<HTMLButtonElement>) => selectTab(candidate, event)}
                onFocus={(event) => recordFocus(identity, event.currentTarget)}
                onKeyDown={(event) => handleTabKeyDown(event, candidate)}
              >
                {sharedContent}
              </button>
            ) : (
              <>
                <input
                  ref={(element) => {
                    if (element) controlRefsRef.current.set(identity, element);
                    else controlRefsRef.current.delete(identity);
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
                    if (event.target.checked) selectRadio(candidate, event);
                  }}
                  onFocus={(event) => recordFocus(identity, event.currentTarget)}
                />
                <label htmlFor={optionId} className={optionClasses}>
                  {sharedContent}
                </label>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
