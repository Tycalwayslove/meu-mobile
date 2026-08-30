"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import type { ChangeEvent, MouseEvent } from "react";

import { useFieldContext } from "../Field/FieldContext";
import { assignRef } from "../internal/assignRef";
import { mergeIdReferences } from "../internal/mergeIdReferences";
import { indicator, input, root } from "./Radio.css";
import { useRadioGroupContext } from "./RadioGroupContext";
import type { RadioProps } from "./types";

const RADIO_SYNC_EVENT = "meu:radio-sync";
const RADIO_RESTORE_EVENT = "meu:radio-restore";

function getNativeRadioPeers(element: HTMLInputElement): HTMLInputElement[] {
  const view = element.ownerDocument.defaultView;
  if (!view || !element.name) return [element];
  const candidates = element.form
    ? Array.from(element.form.elements)
    : Array.from(element.ownerDocument.querySelectorAll("input[type='radio']"));
  return candidates.filter(
    (candidate): candidate is HTMLInputElement =>
      candidate instanceof view.HTMLInputElement &&
      candidate.type === "radio" &&
      candidate.name === element.name &&
      candidate.form === element.form
  );
}

function dispatchNativeRadioEvent(element: HTMLInputElement, eventName: string) {
  const view = element.ownerDocument.defaultView;
  if (!view) return;
  for (const peer of getNativeRadioPeers(element)) {
    peer.dispatchEvent(new view.Event(eventName));
  }
}

/**
 * Renders a native radio input with Meu styling and Field integration.
 *
 * @public
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  {
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    checked,
    children,
    className,
    defaultChecked = false,
    disabled = false,
    form,
    id,
    name,
    onChange,
    onClick,
    readOnly = false,
    required = false,
    size = "medium",
    status = "default",
    style,
    value,
    ...props
  },
  ref
) {
  const fieldContext = useFieldContext();
  const groupContext = useRadioGroupContext();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked);
  const inGroup = Boolean(groupContext && value !== undefined);
  const controlled = checked !== undefined;
  const currentChecked = inGroup
    ? Boolean(groupContext && value !== undefined && groupContext.isSelected(value))
    : controlled
      ? checked
      : uncontrolledChecked;
  const resolvedDisabled = disabled || Boolean(groupContext && groupContext.disabled);
  const resolvedReadOnly = readOnly || Boolean(groupContext && groupContext.readOnly);
  const resolvedStatus =
    status === "error" || (groupContext && groupContext.status === "error") ? "error" : "default";
  const callerInvalid =
    ariaInvalid === true ||
    ariaInvalid === "true" ||
    ariaInvalid === "grammar" ||
    ariaInvalid === "spelling";
  const fieldInvalid = Boolean(fieldContext && fieldContext.invalid);
  const contextualInvalid = status === "error" || (!groupContext && fieldInvalid);
  const invalid = callerInvalid || contextualInvalid;
  const visualInvalid = invalid || resolvedStatus === "error" || fieldInvalid;
  const resolvedAriaInvalid = contextualInvalid
    ? true
    : ariaInvalid === "grammar" || ariaInvalid === "spelling"
      ? ariaInvalid
      : callerInvalid
        ? true
        : ariaInvalid === false || ariaInvalid === "false"
          ? ariaInvalid
          : undefined;
  const resolvedId = id || (fieldContext && !inGroup ? fieldContext.controlId : undefined);
  const describedBy = mergeIdReferences(
    ariaDescribedBy,
    fieldContext ? fieldContext.describedBy : undefined
  );
  const labelledBy = ariaLabel
    ? undefined
    : mergeIdReferences(
        ariaLabelledBy,
        fieldContext && !inGroup ? fieldContext.labelId : undefined
      );
  const resolvedName = name || (groupContext ? groupContext.name : undefined);
  const resolvedRequired =
    required ||
    Boolean(groupContext && groupContext.required) ||
    Boolean(fieldContext && fieldContext.required);
  const resetChecked =
    inGroup && groupContext && value !== undefined
      ? groupContext.isResetSelected(value)
      : controlled
        ? currentChecked
        : defaultChecked;

  useEffect(() => {
    const element = inputRef.current;
    if (!element || inGroup || !resolvedName) return;

    const handleNativeGroupSync = () => {
      if (controlled) element.checked = Boolean(checked);
      else setUncontrolledChecked(element.checked);
    };
    element.addEventListener(RADIO_SYNC_EVENT, handleNativeGroupSync);
    return () => element.removeEventListener(RADIO_SYNC_EVENT, handleNativeGroupSync);
  }, [checked, controlled, inGroup, resolvedName]);

  useEffect(() => {
    const element = inputRef.current;
    if (!element) return;
    const restoreControlledSelection = () => {
      element.checked = currentChecked;
    };
    element.addEventListener(RADIO_RESTORE_EVENT, restoreControlledSelection);
    return () => element.removeEventListener(RADIO_RESTORE_EVENT, restoreControlledSelection);
  }, [currentChecked]);

  useEffect(() => {
    const element = inputRef.current;
    if (element) element.defaultChecked = resetChecked;
  }, [resetChecked]);

  useEffect(() => {
    const element = inputRef.current;
    const form = element ? element.form : null;
    if (!element || !form || controlled || inGroup) return;

    const view = form.ownerDocument.defaultView;
    if (!view) return;
    let resetTimer: number | null = null;
    const handleReset = (event: Event) => {
      if (resetTimer !== null) view.clearTimeout(resetTimer);
      resetTimer = view.setTimeout(() => {
        resetTimer = null;
        if (!event.defaultPrevented) setUncontrolledChecked(defaultChecked);
      }, 0);
    };
    form.addEventListener("reset", handleReset);
    return () => {
      form.removeEventListener("reset", handleReset);
      if (resetTimer !== null) view.clearTimeout(resetTimer);
    };
  }, [controlled, defaultChecked, form, inGroup]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (resolvedDisabled || resolvedReadOnly) {
      event.preventDefault();
      const element = event.currentTarget;
      dispatchNativeRadioEvent(element, RADIO_RESTORE_EVENT);
      void Promise.resolve().then(() => {
        if (inputRef.current === element) {
          dispatchNativeRadioEvent(element, RADIO_RESTORE_EVENT);
        }
      });
      return;
    }
    const nextChecked = event.target.checked;
    if (nextChecked && inGroup && groupContext && value !== undefined) {
      groupContext.select(value, event);
    } else if (!controlled) {
      setUncontrolledChecked(nextChecked);
    }
    if (!inGroup && resolvedName) {
      const element = event.currentTarget;
      dispatchNativeRadioEvent(element, RADIO_SYNC_EVENT);
    }
    if (onChange) onChange(nextChecked, event);
  }

  function handleClick(event: MouseEvent<HTMLInputElement>) {
    if (resolvedReadOnly) {
      event.preventDefault();
      const element = event.currentTarget;
      dispatchNativeRadioEvent(element, RADIO_RESTORE_EVENT);
      void Promise.resolve().then(() => {
        if (inputRef.current === element) {
          dispatchNativeRadioEvent(element, RADIO_RESTORE_EVENT);
        }
      });
    }
    if (onClick) onClick(event);
  }

  return (
    <label
      className={
        className
          ? `${root({ disabled: resolvedDisabled, readOnly: resolvedReadOnly, size })} ${className}`
          : root({ disabled: resolvedDisabled, readOnly: resolvedReadOnly, size })
      }
      style={style}
      data-meu-component="radio"
      data-size={size}
      data-readonly={resolvedReadOnly ? "true" : "false"}
      data-state={
        resolvedDisabled
          ? "disabled"
          : resolvedReadOnly
            ? "readonly"
            : currentChecked
              ? "checked"
              : "unchecked"
      }
    >
      {/* aria-invalid is a global WAI-ARIA state that is valid on native radio inputs. */}
      {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props */}
      <input
        {...props}
        ref={(element) => {
          inputRef.current = element;
          assignRef(ref, element);
        }}
        id={resolvedId}
        className={input}
        type="radio"
        checked={currentChecked}
        disabled={resolvedDisabled}
        form={form}
        name={resolvedName}
        required={resolvedRequired}
        value={value}
        onClick={handleClick}
        onChange={handleChange}
        aria-describedby={describedBy}
        aria-disabled={!inGroup && resolvedReadOnly ? true : undefined}
        aria-invalid={resolvedAriaInvalid}
        aria-label={ariaLabel}
        aria-labelledby={labelledBy}
      />
      <span
        className={indicator({
          checked: currentChecked,
          disabled: resolvedDisabled,
          size,
          status: visualInvalid ? "error" : resolvedStatus
        })}
        aria-hidden="true"
      />
      {children ? <span>{children}</span> : null}
    </label>
  );
});
