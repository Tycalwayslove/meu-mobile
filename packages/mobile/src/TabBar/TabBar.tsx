"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent, Ref } from "react";

import { Badge } from "../Badge";
import { useMeuConfig } from "../ConfigProvider";
import { SafeArea } from "../SafeArea";
import {
  icon as iconStyle,
  item as itemStyle,
  items as itemsStyle,
  label,
  root
} from "./TabBar.css";
import type { TabBarItem, TabBarProps } from "./types";

type TabBarItemElement = HTMLAnchorElement | HTMLButtonElement;

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

function uniqueItems(items: readonly TabBarItem[]): TabBarItem[] {
  const keys = new Set<string>();
  return items.filter((candidate) => {
    if (keys.has(candidate.key)) return false;
    keys.add(candidate.key);
    return true;
  });
}

/**
 * Renders primary mobile destinations as accessible links or buttons.
 *
 * @public
 */
export function TabBar({
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  className,
  defaultValue,
  items,
  onBlurCapture,
  onChange,
  onFocusCapture,
  ref,
  safeArea = false,
  value,
  ...props
}: TabBarProps) {
  const { locale } = useMeuConfig();
  const normalizedItems = uniqueItems(items);
  const controlled = value !== undefined;
  const firstEnabled = normalizedItems.find((item) => !item.disabled);
  const validDefault = normalizedItems.some((item) => !item.disabled && item.key === defaultValue);
  const [uncontrolledValue, setUncontrolledValue] = useState<string | null>(() => {
    if (validDefault && defaultValue !== undefined) return defaultValue;
    return firstEnabled ? firstEnabled.key : null;
  });
  const requestedValue = controlled ? value : uncontrolledValue;
  const activeItem = normalizedItems.find((item) => item.key === requestedValue);
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
  const navRef = useRef<HTMLElement>(null);
  const focusedKeyRef = useRef<string | null>(null);
  const focusedNodeRef = useRef<TabBarItemElement | null>(null);
  const focusWithinRef = useRef(false);
  const resolvedLabel =
    ariaLabel ||
    (!ariaLabelledBy ? (locale === "en-US" ? "Primary navigation" : "主导航") : undefined);
  const classes = className ? `${root} ${className}` : root;
  const setNavRef = useCallback(
    (node: HTMLElement | null) => {
      navRef.current = node;
      assignRef(ref, node);
    },
    [ref]
  );

  useLayoutEffect(() => {
    const activeElement = document.activeElement;
    const navNode = navRef.current;
    const focusBelongsToThisBar = Boolean(
      activeElement instanceof HTMLElement && navNode && navNode.contains(activeElement)
    );
    const focusedKey = focusedKeyRef.current;
    const focusedNode = focusedNodeRef.current;
    const focusedItem = focusedKey
      ? normalizedItems.find((candidate) => candidate.key === focusedKey)
      : undefined;
    const focusedItemBecameUnavailable = Boolean(
      focusedKey &&
      focusedNode &&
      (!focusedItem || focusedItem.disabled) &&
      (activeElement === document.body || activeElement === focusedNode)
    );
    const focusedNodeWasReplaced = Boolean(
      focusedNode &&
      (!focusedNode.isConnected || !navNode || !navNode.contains(focusedNode)) &&
      activeElement === document.body
    );
    if (!focusedItemBecameUnavailable && !focusedNodeWasReplaced) {
      if (!focusBelongsToThisBar) focusWithinRef.current = false;
      if (!focusBelongsToThisBar) {
        focusedKeyRef.current = null;
        focusedNodeRef.current = null;
      }
      return;
    }

    const fallbackKey = currentValue || (firstEnabled ? firstEnabled.key : null);
    let fallback: TabBarItemElement | null = null;
    if (fallbackKey && navNode) {
      for (const candidate of navNode.querySelectorAll<TabBarItemElement>("[data-tab-bar-key]")) {
        if (candidate.getAttribute("data-tab-bar-key") === fallbackKey) {
          fallback = candidate;
          break;
        }
      }
    }
    if (fallback) {
      fallback.focus();
      focusedKeyRef.current = fallbackKey;
      focusedNodeRef.current = fallback;
      focusWithinRef.current = true;
    } else {
      focusedKeyRef.current = null;
      focusedNodeRef.current = null;
      focusWithinRef.current = false;
    }
  });

  function publish(
    candidate: TabBarItem,
    event: ReactMouseEvent<HTMLAnchorElement | HTMLButtonElement>
  ) {
    if (candidate.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (candidate.onClick) {
      candidate.onClick(event);
      if (event.defaultPrevented) return;
    }
    if (candidate.key !== currentValue) {
      if (!controlled) setUncontrolledValue(candidate.key);
      if (onChange) onChange(candidate.key, event);
    }
  }

  return (
    <nav
      {...props}
      ref={setNavRef}
      className={classes}
      aria-label={resolvedLabel}
      aria-labelledby={ariaLabel ? undefined : ariaLabelledBy}
      data-meu-component="tab-bar"
      data-safe-area={safeArea ? "true" : "false"}
      onBlurCapture={(event) => {
        if (onBlurCapture) onBlurCapture(event);
        const nextTarget = event.relatedTarget;
        if (nextTarget instanceof Node && !event.currentTarget.contains(nextTarget)) {
          focusedKeyRef.current = null;
          focusedNodeRef.current = null;
          focusWithinRef.current = false;
        } else if (!nextTarget) {
          focusWithinRef.current = false;
          const blurredTarget = event.target;
          const targetRemainsAvailable = Boolean(
            (blurredTarget instanceof HTMLAnchorElement ||
              blurredTarget instanceof HTMLButtonElement) &&
            blurredTarget.isConnected &&
            !(blurredTarget instanceof HTMLButtonElement && blurredTarget.disabled) &&
            blurredTarget.getAttribute("aria-disabled") !== "true"
          );
          if (targetRemainsAvailable) {
            focusedKeyRef.current = null;
            focusedNodeRef.current = null;
          }
        }
      }}
      onFocusCapture={(event) => {
        if (onFocusCapture) onFocusCapture(event);
        const target = event.target;
        if (!(target instanceof HTMLAnchorElement || target instanceof HTMLButtonElement)) return;
        const focusedKey = target.getAttribute("data-tab-bar-key");
        if (!focusedKey) return;
        focusedKeyRef.current = focusedKey;
        focusedNodeRef.current = target;
        focusWithinRef.current = true;
      }}
    >
      <div className={itemsStyle}>
        {normalizedItems.map((candidate) => {
          const active = candidate.key === currentValue;
          const isLink = Boolean(candidate.href);
          const classesForItem = itemStyle({
            active,
            disabled: Boolean(candidate.disabled),
            kind: isLink ? "link" : "button"
          });
          const resolvedIcon =
            typeof candidate.icon === "function" ? candidate.icon(active) : candidate.icon;
          const content = (
            <>
              {candidate.badge !== undefined && candidate.badge !== null ? (
                <Badge
                  content={candidate.badge}
                  {...(candidate.badgeLabel ? { label: candidate.badgeLabel } : {})}
                  bordered
                >
                  <span className={iconStyle} aria-hidden="true">
                    {resolvedIcon}
                  </span>
                </Badge>
              ) : (
                <span className={iconStyle} aria-hidden="true">
                  {resolvedIcon}
                </span>
              )}
              <span className={label}>{candidate.label}</span>
            </>
          );

          return isLink ? (
            // eslint-disable-next-line jsx-a11y/anchor-is-valid -- A disabled destination must keep anchor/link identity without a live pre-hydration URL.
            <a
              className={classesForItem}
              href={candidate.disabled ? undefined : candidate.href}
              role={candidate.disabled ? "link" : undefined}
              aria-label={candidate.ariaLabel}
              aria-current={active ? "page" : undefined}
              aria-disabled={candidate.disabled || undefined}
              data-tab-bar-key={candidate.key}
              tabIndex={candidate.disabled ? -1 : undefined}
              onClick={(event) => publish(candidate, event)}
              key={candidate.key}
            >
              {content}
            </a>
          ) : (
            <button
              className={classesForItem}
              type="button"
              disabled={candidate.disabled}
              aria-label={candidate.ariaLabel}
              aria-current={active ? "page" : undefined}
              data-tab-bar-key={candidate.key}
              onClick={(event) => publish(candidate, event)}
              key={candidate.key}
            >
              {content}
            </button>
          );
        })}
      </div>
      {safeArea ? <SafeArea position="bottom" /> : null}
    </nav>
  );
}
