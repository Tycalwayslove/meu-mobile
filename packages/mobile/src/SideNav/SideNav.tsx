"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type {
  CSSProperties,
  FocusEvent as ReactFocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  Ref
} from "react";

import { useMeuConfig } from "../ConfigProvider";
import {
  badge,
  item,
  label,
  list,
  navigationItem,
  navigationItems,
  panel,
  root
} from "./SideNav.css";
import type { SideNavItem, SideNavProps } from "./types";

type SideNavItemElement = HTMLAnchorElement | HTMLButtonElement;
type SideNavRootStyle = CSSProperties & { "--meu-side-nav-sticky-offset"?: string };
type SideNavChangeEvent = Parameters<NonNullable<SideNavProps["onChange"]>>[1];

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

function uniqueItems(items: readonly SideNavItem[]): SideNavItem[] {
  const keys = new Set<string>();
  return items.filter((candidate) => {
    if (keys.has(candidate.key)) return false;
    keys.add(candidate.key);
    return true;
  });
}

function keyIdSuffix(key: string): string {
  if (key.length === 0) return "empty";
  return Array.from(key)
    .map((character) => {
      const codePoint = character.codePointAt(0);
      return codePoint === undefined ? "0" : codePoint.toString(16);
    })
    .join("-");
}

function findItemElement(container: HTMLElement, key: string): SideNavItemElement | null {
  for (const candidate of container.querySelectorAll<SideNavItemElement>("[data-side-nav-key]")) {
    if (candidate.getAttribute("data-side-nav-key") === key) return candidate;
  }
  return null;
}

function scrollItemIntoRail(rail: HTMLElement, target: SideNavItemElement) {
  const railRect = rail.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const canMeasure = railRect.height > 0 && targetRect.height > 0;

  if (canMeasure) {
    if (targetRect.top < railRect.top) {
      rail.scrollTop += targetRect.top - railRect.top;
    } else if (targetRect.bottom > railRect.bottom) {
      rail.scrollTop += targetRect.bottom - railRect.bottom;
    }
    return;
  }

  if (typeof target.scrollIntoView === "function") {
    target.scrollIntoView({ block: "nearest", inline: "nearest" });
  }
}

/**
 * Renders native side navigation destinations or accessible vertical tabs.
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
  sticky = false,
  stickyOffset = 0,
  style,
  value,
  ...props
}: SideNavProps) {
  const { locale } = useMeuConfig();
  const generatedId = useId();
  const normalizedItems = uniqueItems(items);
  const controlled = value !== undefined;
  const firstEnabled = normalizedItems.find((candidate) => !candidate.disabled);
  const validDefault = normalizedItems.some(
    (candidate) => !candidate.disabled && candidate.key === defaultValue
  );
  const [uncontrolledValue, setUncontrolledValue] = useState<string | null>(() => {
    if (validDefault && defaultValue !== undefined) return defaultValue;
    return firstEnabled ? firstEnabled.key : null;
  });
  const requestedValue = controlled ? value : uncontrolledValue;
  const requestedItem = normalizedItems.find((candidate) => candidate.key === requestedValue);
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

  const hasPanels = normalizedItems.some((candidate) => candidate.content !== undefined);
  const enabledItems = normalizedItems.filter((candidate) => !candidate.disabled);
  const [focusedKey, setFocusedKey] = useState<string | null>(currentValue);
  const [focusWithin, setFocusWithin] = useState(false);
  const railRef = useRef<HTMLElement>(null);
  const focusedNodeRef = useRef<SideNavItemElement | null>(null);
  const fallbackFocusKey = currentValue || (firstEnabled ? firstEnabled.key : null);
  const focusIsValid = enabledItems.some((candidate) => candidate.key === focusedKey);
  const rovingFocusKey = focusWithin && focusIsValid ? focusedKey : fallbackFocusKey;
  const itemKeySignature = JSON.stringify(normalizedItems.map((candidate) => candidate.key));
  const itemElementSignature = JSON.stringify(
    normalizedItems.map((candidate) =>
      candidate.href === undefined ? `${candidate.key}:button` : `${candidate.key}:link`
    )
  );
  const resolvedLabel =
    ariaLabel ||
    (!ariaLabelledBy ? (locale === "en-US" ? "Side navigation" : "侧边导航") : undefined);
  const rootClasses = root({ hasPanels });
  const classes = className ? `${rootClasses} ${className}` : rootClasses;
  const railClasses = list({ sticky });
  const resolvedStickyOffset =
    typeof stickyOffset === "number" ? `${stickyOffset}px` : stickyOffset;
  const rootStyle: SideNavRootStyle | undefined = sticky
    ? { ...style, "--meu-side-nav-sticky-offset": resolvedStickyOffset }
    : style;
  const setRootRef = useCallback(
    (node: HTMLDivElement | null) => {
      assignRef(ref, node);
    },
    [ref]
  );

  useEffect(() => {
    if (!currentValue) return;
    const rail = railRef.current;
    if (!rail) return;
    const target = findItemElement(rail, currentValue);
    if (!target) return;

    const update = () => scrollItemIntoRail(rail, target);
    update();

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(update);
      observer.observe(rail);
      observer.observe(target);
    } else {
      window.addEventListener("resize", update);
    }

    return () => {
      if (observer) observer.disconnect();
      else window.removeEventListener("resize", update);
    };
  }, [currentValue, hasPanels, itemElementSignature, itemKeySignature]);

  useLayoutEffect(() => {
    if (!focusWithin || !focusedKey) return;
    const rail = railRef.current;
    const focusedNode = focusedNodeRef.current;
    if (!rail || !focusedNode) return;

    const focusedItem = normalizedItems.find((candidate) => candidate.key === focusedKey);
    const replacementNode = focusedItem ? findItemElement(rail, focusedKey) : null;
    const focusedItemBecameUnavailable = !focusedItem || focusedItem.disabled;
    const focusedNodeWasReplaced = replacementNode !== focusedNode || !focusedNode.isConnected;
    const activeElement = document.activeElement;
    const focusCanBeRecovered =
      activeElement === document.body || activeElement === focusedNode || !activeElement;

    if ((!focusedItemBecameUnavailable && !focusedNodeWasReplaced) || !focusCanBeRecovered) return;

    const fallback = fallbackFocusKey ? findItemElement(rail, fallbackFocusKey) : null;
    if (fallback && !fallback.matches(":disabled, [aria-disabled='true']")) {
      fallback.focus();
      focusedNodeRef.current = fallback;
    }
  });

  function activate(key: string, event: SideNavChangeEvent) {
    if (key === currentValue) return;
    if (!controlled) setUncontrolledValue(key);
    if (onChange) onChange(key, event);
  }

  function focusAndMaybeActivate(key: string, event: ReactKeyboardEvent<HTMLButtonElement>) {
    const rail = railRef.current;
    if (!rail) return;
    const target = findItemElement(rail, key);
    if (target instanceof HTMLButtonElement) {
      target.focus();
      scrollItemIntoRail(rail, target);
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

  function handleRailBlur(event: ReactFocusEvent<HTMLElement>) {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) return;

    if (!nextTarget) {
      const blurredTarget = event.target;
      const targetRemainsAvailable = Boolean(
        (blurredTarget instanceof HTMLAnchorElement ||
          blurredTarget instanceof HTMLButtonElement) &&
        blurredTarget.isConnected &&
        !(blurredTarget instanceof HTMLButtonElement && blurredTarget.disabled) &&
        blurredTarget.getAttribute("aria-disabled") !== "true"
      );
      if (!targetRemainsAvailable) return;
    }

    setFocusWithin(false);
    focusedNodeRef.current = null;
  }

  function handleItemFocus(event: ReactFocusEvent<SideNavItemElement>, key: string) {
    setFocusWithin(true);
    setFocusedKey(key);
    focusedNodeRef.current = event.currentTarget;
  }

  function renderItemContent(candidate: SideNavItem) {
    return (
      <>
        <span className={label}>{candidate.label}</span>
        {candidate.badge !== undefined && candidate.badge !== null ? (
          <span className={badge} aria-label={candidate.badgeLabel}>
            {candidate.badge}
          </span>
        ) : null}
      </>
    );
  }

  return (
    <div
      {...props}
      ref={setRootRef}
      className={classes}
      style={rootStyle}
      data-meu-component="side-nav"
      data-mode={hasPanels ? "tabs" : "navigation"}
      data-sticky={sticky ? "true" : "false"}
    >
      {hasPanels ? (
        <div
          className={railClasses}
          ref={railRef as Ref<HTMLDivElement>}
          role="tablist"
          aria-label={resolvedLabel}
          aria-labelledby={ariaLabel ? undefined : ariaLabelledBy}
          aria-orientation="vertical"
          onBlur={handleRailBlur}
        >
          {normalizedItems.map((candidate) => {
            const active = candidate.key === currentValue;
            const idSuffix = keyIdSuffix(candidate.key);
            const tabId = `${generatedId}-tab-${idSuffix}`;
            const panelId = `${generatedId}-panel-${idSuffix}`;
            return (
              <button
                type="button"
                id={tabId}
                role="tab"
                className={item({ active, disabled: Boolean(candidate.disabled) })}
                disabled={candidate.disabled}
                aria-controls={panelId}
                aria-label={candidate.ariaLabel}
                aria-selected={active}
                data-side-nav-key={candidate.key}
                tabIndex={candidate.disabled ? -1 : candidate.key === rovingFocusKey ? 0 : -1}
                onFocus={(event) => handleItemFocus(event, candidate.key)}
                onKeyDown={(event) => handleKeyDown(event, candidate.key)}
                onClick={(event) => {
                  setFocusedKey(candidate.key);
                  focusedNodeRef.current = event.currentTarget;
                  event.currentTarget.focus();
                  activate(candidate.key, event);
                }}
                key={candidate.key}
              >
                {renderItemContent(candidate)}
              </button>
            );
          })}
        </div>
      ) : (
        <nav
          className={railClasses}
          ref={railRef}
          aria-label={resolvedLabel}
          aria-labelledby={ariaLabel ? undefined : ariaLabelledBy}
          onBlur={handleRailBlur}
        >
          <ul className={navigationItems}>
            {normalizedItems.map((candidate) => {
              const active = candidate.key === currentValue;
              const classesForItem = item({
                active,
                disabled: Boolean(candidate.disabled)
              });
              const isLink = candidate.href !== undefined;
              const content = renderItemContent(candidate);

              return (
                <li className={navigationItem} key={candidate.key}>
                  {isLink ? (
                    // eslint-disable-next-line jsx-a11y/anchor-is-valid -- Disabled destinations preserve anchor identity while omitting a live URL during SSR and hydration.
                    <a
                      className={classesForItem}
                      href={candidate.disabled ? undefined : candidate.href}
                      target={candidate.target}
                      rel={
                        candidate.rel !== undefined
                          ? candidate.rel
                          : candidate.target === "_blank"
                            ? "noopener noreferrer"
                            : undefined
                      }
                      role={candidate.disabled ? "link" : undefined}
                      aria-current={active ? "page" : undefined}
                      aria-disabled={candidate.disabled || undefined}
                      aria-label={candidate.ariaLabel}
                      data-side-nav-key={candidate.key}
                      tabIndex={candidate.disabled ? -1 : undefined}
                      onFocus={(event) => handleItemFocus(event, candidate.key)}
                      onClick={(event: ReactMouseEvent<HTMLAnchorElement>) => {
                        if (candidate.disabled) {
                          event.preventDefault();
                          event.stopPropagation();
                          return;
                        }
                        activate(candidate.key, event);
                      }}
                    >
                      {content}
                    </a>
                  ) : (
                    <button
                      className={classesForItem}
                      type="button"
                      disabled={candidate.disabled}
                      aria-current={active ? "page" : undefined}
                      aria-label={candidate.ariaLabel}
                      data-side-nav-key={candidate.key}
                      onFocus={(event) => handleItemFocus(event, candidate.key)}
                      onClick={(event: ReactMouseEvent<HTMLButtonElement>) => {
                        activate(candidate.key, event);
                      }}
                    >
                      {content}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {hasPanels
        ? normalizedItems.map((candidate) => {
            const active = candidate.key === currentValue;
            const idSuffix = keyIdSuffix(candidate.key);
            if (destroyInactive && !active) return null;
            return (
              <div
                id={`${generatedId}-panel-${idSuffix}`}
                className={panel}
                role="tabpanel"
                aria-labelledby={`${generatedId}-tab-${idSuffix}`}
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
