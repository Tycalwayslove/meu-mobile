"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from "react";

import { Badge } from "../Badge";
import { useMeuConfig } from "../ConfigProvider";
import { label, panel, root, tab, tabList } from "./Tabs.css";
import type { TabsProps } from "./types";

const overflowTolerance = 1;

function updateOverflowIndicators(tabListNode: HTMLDivElement) {
  const firstTab = tabListNode.querySelector<HTMLElement>('[role="tab"]');
  const lastTab = tabListNode.querySelector<HTMLElement>('[role="tab"]:last-of-type');
  let overflowLeft = false;
  let overflowRight = false;

  if (firstTab && lastTab) {
    const listRect = tabListNode.getBoundingClientRect();
    const firstRect = firstTab.getBoundingClientRect();
    const lastRect = lastTab.getBoundingClientRect();
    const leftEdge = Math.min(firstRect.left, lastRect.left);
    const rightEdge = Math.max(firstRect.right, lastRect.right);
    overflowLeft = leftEdge < listRect.left - overflowTolerance;
    overflowRight = rightEdge > listRect.right + overflowTolerance;
  }

  tabListNode.setAttribute("data-overflow-left", String(overflowLeft));
  tabListNode.setAttribute("data-overflow-right", String(overflowRight));
}

/**
 * Renders an accessible tab list with optional associated panels.
 *
 * @public
 */
export function Tabs({
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  activationMode = "automatic",
  className,
  defaultValue,
  destroyInactive = false,
  items,
  lazy = false,
  onChange,
  ref,
  stretch = true,
  value,
  ...props
}: TabsProps) {
  const { dir, locale } = useMeuConfig();
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
  const normalizedValue =
    activeItem && !activeItem.disabled ? requestedValue : firstEnabled ? firstEnabled.key : null;
  const currentValue = controlled
    ? activeItem && !activeItem.disabled
      ? requestedValue
      : null
    : normalizedValue;
  if (!controlled && uncontrolledValue !== normalizedValue) {
    setUncontrolledValue(normalizedValue);
  }
  const enabledItems = items.filter((item) => !item.disabled);
  const [focusedKey, setFocusedKey] = useState<string | null>(currentValue);
  const [focusWithin, setFocusWithin] = useState(false);
  const fallbackFocusKey = currentValue || (firstEnabled ? firstEnabled.key : null);
  const focusIsValid = enabledItems.some((item) => item.key === focusedKey);
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const tabListRef = useRef<HTMLDivElement>(null);
  const itemKeySignature = JSON.stringify(items.map((item) => item.key));
  const [visitedState, setVisitedState] = useState<{
    activeKey: string | null | undefined;
    itemKeySignature: string;
    keys: readonly string[];
  }>(() => ({
    activeKey: currentValue,
    itemKeySignature,
    keys: currentValue ? [currentValue] : []
  }));
  let visitedKeys = visitedState.keys;
  if (
    visitedState.activeKey !== currentValue ||
    visitedState.itemKeySignature !== itemKeySignature
  ) {
    const availableKeys = new Set(items.map((item) => item.key));
    visitedKeys = visitedState.keys.filter((key) => availableKeys.has(key));
    if (currentValue && !visitedKeys.includes(currentValue)) {
      visitedKeys = [...visitedKeys, currentValue];
    }
    setVisitedState({ activeKey: currentValue, itemKeySignature, keys: visitedKeys });
  }
  const hasPanels = items.some((item) => item.content !== undefined);
  const visitedKeySet = new Set(visitedKeys);
  const rovingFocusKey = focusWithin && focusIsValid ? focusedKey : fallbackFocusKey;
  const resolvedLabel =
    ariaLabel || (!ariaLabelledBy ? (locale === "en-US" ? "Content tabs" : "内容标签") : undefined);

  useEffect(() => {
    const tabListNode = tabListRef.current;
    if (!tabListNode) return;

    const update = () => updateOverflowIndicators(tabListNode);
    update();

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(update);
      observer.observe(tabListNode);
      for (const tabNode of tabListNode.querySelectorAll<HTMLElement>('[role="tab"]')) {
        observer.observe(tabNode);
      }
    } else {
      window.addEventListener("resize", update);
    }

    return () => {
      if (observer) observer.disconnect();
      else window.removeEventListener("resize", update);
    };
  }, [itemKeySignature, stretch]);

  useLayoutEffect(() => {
    if (!focusWithin || focusIsValid) return;
    const fallback = fallbackFocusKey ? tabRefs.current.get(fallbackFocusKey) : undefined;
    if (fallback && fallbackFocusKey) {
      fallback.focus();
    }
  }, [fallbackFocusKey, focusIsValid, focusWithin]);

  function activate(
    key: string,
    event: ReactMouseEvent<HTMLButtonElement> | ReactKeyboardEvent<HTMLButtonElement>
  ) {
    if (key === currentValue) return;
    const target = tabRefs.current.get(key);
    if (target && typeof target.scrollIntoView === "function") {
      target.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
    if (!controlled) setUncontrolledValue(key);
    if (onChange) onChange(key, event);
  }

  function focusAndMaybeActivate(targetKey: string, event: ReactKeyboardEvent<HTMLButtonElement>) {
    setFocusedKey(targetKey);
    const target = tabRefs.current.get(targetKey);
    if (target) {
      target.focus();
      if (typeof target.scrollIntoView === "function") {
        target.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
    }
    if (activationMode === "automatic") activate(targetKey, event);
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, key: string) {
    if (enabledItems.length === 0) return;
    const currentIndex = enabledItems.findIndex((item) => item.key === key);
    let targetKey: string | undefined;

    const directionOwner = event.currentTarget.closest<HTMLElement>("[dir]");
    const inheritedDirection = directionOwner ? directionOwner.dir : undefined;
    const resolvedDirection =
      inheritedDirection === "rtl" || inheritedDirection === "ltr" ? inheritedDirection : dir;

    if (event.key === "ArrowRight") {
      const offset = resolvedDirection === "rtl" ? -1 : 1;
      const target =
        enabledItems[(currentIndex + offset + enabledItems.length) % enabledItems.length];
      targetKey = target ? target.key : undefined;
    } else if (event.key === "ArrowLeft") {
      const offset = resolvedDirection === "rtl" ? 1 : -1;
      const target =
        enabledItems[(currentIndex + offset + enabledItems.length) % enabledItems.length];
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
    <div
      {...props}
      ref={ref}
      className={classes}
      data-activation-mode={activationMode}
      data-meu-component="tabs"
    >
      <div
        className={tabList}
        ref={tabListRef}
        role="tablist"
        aria-label={resolvedLabel}
        aria-labelledby={ariaLabel ? undefined : ariaLabelledBy}
        aria-orientation="horizontal"
        data-overflow-left="false"
        data-overflow-right="false"
        onBlur={(event) => {
          const nextTarget = event.relatedTarget;
          if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
            setFocusWithin(false);
          }
        }}
        onScroll={(event) => updateOverflowIndicators(event.currentTarget)}
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
                if (node) tabRefs.current.set(item.key, node);
                else tabRefs.current.delete(item.key);
              }}
              aria-controls={hasPanels ? panelId : undefined}
              aria-selected={active}
              disabled={item.disabled}
              tabIndex={item.disabled ? -1 : item.key === rovingFocusKey ? 0 : -1}
              onFocus={() => {
                setFocusWithin(true);
                setFocusedKey(item.key);
              }}
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
            if (lazy && !active && !visitedKeySet.has(item.key)) return null;
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
