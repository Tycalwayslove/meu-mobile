"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  Ref
} from "react";

import { useMeuConfig } from "../ConfigProvider";
import { badge, item, label, list, panel, root } from "./SideNav.css";
import type { SideNavProps } from "./types";

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

/**
 * Renders route-agnostic side navigation or vertical tabs.
 *
 * @public
 */
export function SideNav({
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  activationMode = "automatic",
  className,
  defaultValue,
  destroyInactive = false,
  items,
  onChange,
  ref,
  value,
  ...props
}: SideNavProps) {
  const { locale } = useMeuConfig();
  const generatedId = useId();
  const controlled = value !== undefined;
  const firstEnabled = items.find((candidate) => !candidate.disabled);
  const validDefault = items.some(
    (candidate) => !candidate.disabled && candidate.key === defaultValue
  );
  const [uncontrolledValue, setUncontrolledValue] = useState<string | null>(() => {
    if (validDefault && defaultValue !== undefined) return defaultValue;
    return firstEnabled ? firstEnabled.key : null;
  });
  const requestedValue = controlled ? value : uncontrolledValue;
  const requestedItem = items.find((candidate) => candidate.key === requestedValue);
  const normalizedValue =
    requestedItem && !requestedItem.disabled
      ? requestedValue
      : firstEnabled
        ? firstEnabled.key
        : null;
  const currentValue = controlled
    ? requestedItem && !requestedItem.disabled
      ? requestedValue
      : null
    : normalizedValue;
  if (!controlled && uncontrolledValue !== normalizedValue) {
    setUncontrolledValue(normalizedValue);
  }
  const [focusedKey, setFocusedKey] = useState<string | null>(currentValue);
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const recoverFocusRef = useRef(false);
  const enabledItems = items.filter((candidate) => !candidate.disabled);
  const fallbackFocusKey = currentValue || (firstEnabled ? firstEnabled.key : null);
  const focusIsValid = enabledItems.some((candidate) => candidate.key === focusedKey);
  if (!focusIsValid && focusedKey !== fallbackFocusKey) {
    setFocusedKey(fallbackFocusKey);
  }
  const rovingFocusKey = focusIsValid && focusedKey ? focusedKey : fallbackFocusKey;
  const hasPanels = items.some((candidate) => candidate.content !== undefined);
  const itemKeySignature = JSON.stringify(items.map((candidate) => candidate.key));
  const resolvedLabel =
    ariaLabel ||
    (!ariaLabelledBy ? (locale === "en-US" ? "Side navigation" : "侧边导航") : undefined);

  useEffect(() => {
    if (!currentValue) return;
    const target = itemRefs.current[currentValue];
    if (target && typeof target.scrollIntoView === "function") {
      target.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }, [currentValue, itemKeySignature]);

  useLayoutEffect(() => {
    const activeElement = document.activeElement;
    const activeKey =
      activeElement instanceof HTMLElement ? activeElement.getAttribute("data-side-nav-key") : null;
    const activeIsInvalid = Boolean(
      activeKey && !enabledItems.some((candidate) => candidate.key === activeKey)
    );
    if ((recoverFocusRef.current || activeIsInvalid) && rovingFocusKey) {
      const focusTarget = itemRefs.current[rovingFocusKey];
      if (focusTarget) focusTarget.focus();
    }
    recoverFocusRef.current = false;
  });

  function activate(
    key: string,
    event: ReactMouseEvent<HTMLButtonElement> | ReactKeyboardEvent<HTMLButtonElement>
  ) {
    if (key === currentValue) return;
    if (!controlled) setUncontrolledValue(key);
    if (onChange) onChange(key, event);
  }

  function focusAndMaybeActivate(key: string, event: ReactKeyboardEvent<HTMLButtonElement>) {
    setFocusedKey(key);
    const target = itemRefs.current[key];
    if (target) {
      target.focus();
      if (typeof target.scrollIntoView === "function") {
        target.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
    }
    if (activationMode === "automatic") activate(key, event);
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, key: string) {
    if (enabledItems.length === 0) return;
    const currentIndex = enabledItems.findIndex((candidate) => candidate.key === key);
    let targetKey: string | undefined;
    if (event.key === "ArrowDown") {
      const target = enabledItems[(currentIndex + 1 + enabledItems.length) % enabledItems.length];
      targetKey = target ? target.key : undefined;
    } else if (event.key === "ArrowUp") {
      const target = enabledItems[(currentIndex - 1 + enabledItems.length) % enabledItems.length];
      targetKey = target ? target.key : undefined;
    } else if (event.key === "Home") {
      const target = enabledItems[0];
      targetKey = target ? target.key : undefined;
    } else if (event.key === "End") {
      const target = enabledItems[enabledItems.length - 1];
      targetKey = target ? target.key : undefined;
    } else if (activationMode === "manual" && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      activate(key, event);
      return;
    }
    if (!targetKey) return;
    event.preventDefault();
    focusAndMaybeActivate(targetKey, event);
  }

  const classes = root({ hasPanels });

  return (
    <div
      {...props}
      ref={(node) => {
        rootRef.current = node;
        assignRef(ref, node);
      }}
      className={className ? `${classes} ${className}` : classes}
      data-meu-component="side-nav"
    >
      <div
        className={list}
        role={hasPanels ? "tablist" : "navigation"}
        aria-label={resolvedLabel}
        aria-labelledby={ariaLabel ? undefined : ariaLabelledBy}
        aria-orientation={hasPanels ? "vertical" : undefined}
      >
        {items.map((candidate, index) => {
          const active = candidate.key === currentValue;
          const tabId = `${generatedId}-tab-${index}`;
          const panelId = `${generatedId}-panel-${index}`;
          return (
            <button
              ref={(node) => {
                const previousNode = itemRefs.current[candidate.key];
                if (!node && previousNode && previousNode === document.activeElement) {
                  recoverFocusRef.current = true;
                }
                itemRefs.current[candidate.key] = node;
              }}
              type="button"
              id={tabId}
              role={hasPanels ? "tab" : undefined}
              className={item({ active, disabled: Boolean(candidate.disabled) })}
              disabled={candidate.disabled}
              aria-controls={hasPanels ? panelId : undefined}
              aria-current={!hasPanels && active ? "page" : undefined}
              aria-selected={hasPanels ? active : undefined}
              data-side-nav-key={candidate.key}
              tabIndex={candidate.disabled ? -1 : candidate.key === rovingFocusKey ? 0 : -1}
              onFocus={() => setFocusedKey(candidate.key)}
              onKeyDown={(event) => handleKeyDown(event, candidate.key)}
              onClick={(event) => {
                setFocusedKey(candidate.key);
                event.currentTarget.focus();
                activate(candidate.key, event);
              }}
              key={candidate.key}
            >
              <span className={label}>{candidate.label}</span>
              {candidate.badge !== undefined && candidate.badge !== null ? (
                <span className={badge} aria-label={candidate.badgeLabel}>
                  {candidate.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      {hasPanels
        ? items.map((candidate, index) => {
            const active = candidate.key === currentValue;
            if (destroyInactive && !active) return null;
            return (
              <div
                id={`${generatedId}-panel-${index}`}
                className={panel}
                role="tabpanel"
                aria-labelledby={`${generatedId}-tab-${index}`}
                hidden={!active}
                tabIndex={active ? 0 : -1}
                key={candidate.key}
              >
                {candidate.content}
              </div>
            );
          })
        : null}
    </div>
  );
}
