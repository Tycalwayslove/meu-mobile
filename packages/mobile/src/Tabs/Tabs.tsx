"use client";

import { useId, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from "react";

import { Badge } from "../Badge";
import { useMeuConfig } from "../ConfigProvider";
import { label, panel, root, tab, tabList } from "./Tabs.css";
import type { TabsProps } from "./types";

export function Tabs({
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  activationMode = "automatic",
  className,
  defaultValue,
  destroyInactive = false,
  items,
  onChange,
  ref,
  stretch = true,
  value,
  ...props
}: TabsProps) {
  const { locale } = useMeuConfig();
  const generatedId = useId();
  const controlled = value !== undefined;
  const firstEnabled = items.find((item) => !item.disabled);
  const validDefault = items.some((item) => !item.disabled && item.key === defaultValue);
  const [uncontrolledValue, setUncontrolledValue] = useState<string | null>(() => {
    if (validDefault && defaultValue !== undefined) return defaultValue;
    return firstEnabled ? firstEnabled.key : null;
  });
  const requestedValue = controlled ? value : uncontrolledValue;
  const activeItem = items.find((item) => item.key === requestedValue);
  const currentValue = controlled
    ? requestedValue
    : activeItem && !activeItem.disabled
      ? requestedValue
      : firstEnabled
        ? firstEnabled.key
        : null;
  const [focusedKey, setFocusedKey] = useState<string | null>(currentValue);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const hasPanels = items.some((item) => item.content !== undefined);
  const enabledItems = items.filter((item) => !item.disabled);
  const fallbackFocusKey = currentValue || (firstEnabled ? firstEnabled.key : null);
  const rovingFocusKey =
    focusedKey && enabledItems.some((item) => item.key === focusedKey)
      ? focusedKey
      : fallbackFocusKey;
  const resolvedLabel =
    ariaLabel || (!ariaLabelledBy ? (locale === "en-US" ? "Content tabs" : "内容标签") : undefined);

  function activate(
    key: string,
    event: ReactMouseEvent<HTMLButtonElement> | ReactKeyboardEvent<HTMLButtonElement>
  ) {
    if (key === currentValue) return;
    if (!controlled) setUncontrolledValue(key);
    if (onChange) onChange(key, event);
  }

  function focusAndMaybeActivate(targetKey: string, event: ReactKeyboardEvent<HTMLButtonElement>) {
    setFocusedKey(targetKey);
    const target = tabRefs.current[targetKey];
    if (target) target.focus();
    if (activationMode === "automatic") activate(targetKey, event);
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, key: string) {
    if (enabledItems.length === 0) return;
    const currentIndex = enabledItems.findIndex((item) => item.key === key);
    let targetKey: string | undefined;

    if (event.key === "ArrowRight") {
      const target = enabledItems[(currentIndex + 1 + enabledItems.length) % enabledItems.length];
      targetKey = target ? target.key : undefined;
    } else if (event.key === "ArrowLeft") {
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

  const classes = className ? `${root} ${className}` : root;

  return (
    <div {...props} ref={ref} className={classes} data-meu-component="tabs">
      <div
        className={tabList}
        role="tablist"
        aria-label={resolvedLabel}
        aria-labelledby={ariaLabel ? undefined : ariaLabelledBy}
        aria-orientation="horizontal"
      >
        {items.map((item, index) => {
          const active = item.key === currentValue;
          const tabId = `${generatedId}-tab-${index}`;
          const panelId = `${generatedId}-panel-${index}`;
          return (
            <button
              className={tab({ active, disabled: Boolean(item.disabled), stretch })}
              type="button"
              role="tab"
              id={tabId}
              ref={(node) => {
                tabRefs.current[item.key] = node;
              }}
              aria-controls={hasPanels ? panelId : undefined}
              aria-selected={active}
              disabled={item.disabled}
              tabIndex={item.disabled ? -1 : item.key === rovingFocusKey ? 0 : -1}
              onFocus={() => setFocusedKey(item.key)}
              onKeyDown={(event) => handleKeyDown(event, item.key)}
              onClick={(event) => activate(item.key, event)}
              key={item.key}
            >
              {item.badge !== undefined && item.badge !== null ? (
                <Badge content={item.badge}>
                  <span className={label}>{item.label}</span>
                </Badge>
              ) : (
                <span className={label}>{item.label}</span>
              )}
            </button>
          );
        })}
      </div>
      {hasPanels
        ? items.map((item, index) => {
            const active = item.key === currentValue;
            if (destroyInactive && !active) return null;
            const tabId = `${generatedId}-tab-${index}`;
            const panelId = `${generatedId}-panel-${index}`;
            return (
              <div
                className={panel}
                role="tabpanel"
                id={panelId}
                aria-labelledby={tabId}
                hidden={!active}
                tabIndex={active ? 0 : -1}
                key={item.key}
              >
                {item.content}
              </div>
            );
          })
        : null}
    </div>
  );
}
