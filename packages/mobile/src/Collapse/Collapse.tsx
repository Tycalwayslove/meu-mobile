"use client";

import { MeuIconChevronLeft } from "@meu/icons-react";
import { useCallback, useId, useLayoutEffect, useRef, useState } from "react";
import type { FocusEvent as ReactFocusEvent, KeyboardEvent as ReactKeyboardEvent } from "react";

import { useMeuConfig } from "../ConfigProvider";
import {
  arrow as arrowStyle,
  content,
  extra as extraStyle,
  heading,
  item as itemStyle,
  panel,
  panelInner,
  root,
  title as titleStyle,
  trigger
} from "./Collapse.css";
import type { CollapseItem, CollapseProps } from "./types";

function uniqueItems(items: readonly CollapseItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.value)) return false;
    seen.add(item.value);
    return true;
  });
}

function normalizeValue(
  source: readonly string[] | undefined,
  items: readonly CollapseItem[],
  accordion: boolean
) {
  const allowed = new Set(items.map((item) => item.value));
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of source || []) {
    if (!allowed.has(value) || seen.has(value)) continue;
    seen.add(value);
    result.push(value);
    if (accordion) break;
  }

  return result;
}

function sameValue(left: readonly string[], right: readonly string[]) {
  return left.length === right.length && left.every((entry, index) => entry === right[index]);
}

function valueIdFragment(value: string) {
  const codePoints = Array.from(value, (character) => character.codePointAt(0)!.toString(16));
  return codePoints.length > 0 ? codePoints.join("-") : "empty";
}

function assignRef(ref: CollapseProps["ref"], value: HTMLDivElement | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

/**
 * Renders a disclosure group with optional single-item accordion behavior.
 *
 * @public
 */
export function Collapse({
  "aria-disabled": ariaDisabled,
  accordion = false,
  arrow,
  className,
  defaultValue,
  dir: dirProp,
  disabled = false,
  headingLevel = 3,
  items,
  keyboardNavigation = true,
  onBlurCapture,
  onChange,
  onFocusCapture,
  ref,
  region = true,
  role = "group",
  value,
  variant = "plain",
  ...props
}: CollapseProps) {
  const baseId = useId();
  const { dir: configuredDirection } = useMeuConfig();
  const controlled = value !== undefined;
  const normalizedItems = uniqueItems(items);
  const itemSignature = JSON.stringify(normalizedItems.map((item) => item.value));
  const buttonRefs = useRef(new Map<string, HTMLButtonElement>());
  const rootRef = useRef<HTMLDivElement | null>(null);
  const focusWithinRef = useRef(false);
  const focusedIndexRef = useRef(0);
  const focusedPanelValueRef = useRef<string | null>(null);
  const focusedValueRef = useRef<string | null>(null);
  const [internalValue, setInternalValue] = useState(() =>
    normalizeValue(defaultValue, uniqueItems(items), accordion)
  );
  const normalizedInternalValue = normalizeValue(internalValue, normalizedItems, accordion);
  const activeValue = controlled
    ? normalizeValue(value, normalizedItems, accordion)
    : normalizedInternalValue;
  const classes = root({ variant });
  const resolvedDirection = dirProp === "rtl" || dirProp === "ltr" ? dirProp : configuredDirection;
  const enabledItems = disabled
    ? []
    : normalizedItems
        .map((item, index) => ({ index, item }))
        .filter((entry) => !entry.item.disabled);

  useLayoutEffect(() => {
    if (controlled) return;
    setInternalValue((currentValue) => {
      const nextValue = normalizeValue(currentValue, normalizedItems, accordion);
      return sameValue(currentValue, nextValue) ? currentValue : nextValue;
    });
    // itemSignature represents the stable value identities that affect normalization.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accordion, controlled, itemSignature]);

  useLayoutEffect(() => {
    if (!focusWithinRef.current || focusedValueRef.current === null) return;
    const rootNode = rootRef.current;
    if (!rootNode) return;
    const activeElement = document.activeElement;
    const activeBelongsToRoot = activeElement instanceof Node && rootNode.contains(activeElement);
    const focusedPanelValue = focusedPanelValueRef.current;
    const focusedPanelItem =
      focusedPanelValue !== null
        ? normalizedItems.find((item) => item.value === focusedPanelValue)
        : undefined;
    const focusedPanelCollapsed =
      focusedPanelValue !== null && !activeValue.includes(focusedPanelValue);
    if (focusedPanelCollapsed) {
      const panelTrigger =
        focusedPanelValue !== null ? buttonRefs.current.get(focusedPanelValue) : undefined;
      if (panelTrigger && !disabled && focusedPanelItem && !focusedPanelItem.disabled) {
        focusedPanelValueRef.current = null;
        panelTrigger.focus();
        return;
      }
    }
    const focusedButton = buttonRefs.current.get(focusedValueRef.current);
    const focusedItem = normalizedItems.find((item) => item.value === focusedValueRef.current);
    const focusedTriggerUnavailable =
      !focusedButton || disabled || Boolean(focusedItem && focusedItem.disabled);
    const activeTriggerUnavailable = activeElement === focusedButton && focusedTriggerUnavailable;

    if (!focusedTriggerUnavailable) return;
    if (activeBelongsToRoot && !activeTriggerUnavailable) return;

    const fallback =
      enabledItems.find((entry) => entry.index >= focusedIndexRef.current) ||
      enabledItems[enabledItems.length - 1];
    const fallbackButton = fallback ? buttonRefs.current.get(fallback.item.value) : undefined;
    if (fallbackButton) {
      focusedPanelValueRef.current = null;
      fallbackButton.focus();
      return;
    }
    if (activeTriggerUnavailable && activeElement instanceof HTMLElement) activeElement.blur();
    focusWithinRef.current = false;
    focusedPanelValueRef.current = null;
    focusedValueRef.current = null;
  });

  const setRootRef = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      assignRef(ref, node);
    },
    [ref]
  );

  function handleRootFocusCapture(event: ReactFocusEvent<HTMLDivElement>) {
    const target = event.target instanceof Element ? event.target : null;
    const collapseOwner = target
      ? target.closest<HTMLElement>('[data-meu-component="collapse"]')
      : null;
    const collapseTrigger = target
      ? target.closest<HTMLButtonElement>("[data-meu-collapse-trigger]")
      : null;
    if (collapseOwner === event.currentTarget && collapseTrigger) {
      const focusedValue = collapseTrigger.dataset.meuCollapseTrigger;
      const focusedIndex = normalizedItems.findIndex((item) => item.value === focusedValue);
      focusWithinRef.current = true;
      focusedPanelValueRef.current = null;
      focusedValueRef.current = focusedValue === undefined ? null : focusedValue;
      focusedIndexRef.current = focusedIndex < 0 ? 0 : focusedIndex;
    } else if (target) {
      let ancestor: Element | null = target;
      while (ancestor && ancestor !== event.currentTarget) {
        if (ancestor instanceof HTMLElement && ancestor.hasAttribute("data-meu-collapse-panel")) {
          const panelOwner = ancestor.closest<HTMLElement>('[data-meu-component="collapse"]');
          if (panelOwner === event.currentTarget) {
            const panelValue = ancestor.dataset.meuCollapsePanel;
            const panelIndex = normalizedItems.findIndex((item) => item.value === panelValue);
            focusWithinRef.current = true;
            focusedPanelValueRef.current = panelValue === undefined ? null : panelValue;
            focusedValueRef.current = panelValue === undefined ? null : panelValue;
            focusedIndexRef.current = panelIndex < 0 ? 0 : panelIndex;
            break;
          }
        }
        ancestor = ancestor.parentElement;
      }
    }
    if (onFocusCapture) onFocusCapture(event);
  }

  function handleRootBlurCapture(event: ReactFocusEvent<HTMLDivElement>) {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      if (onBlurCapture) onBlurCapture(event);
      return;
    }
    let releaseFocusOwnership = nextTarget instanceof Node;
    if (!nextTarget) {
      const target = event.target instanceof HTMLElement ? event.target : null;
      const targetOwner = target
        ? target.closest<HTMLElement>('[data-meu-component="collapse"]')
        : null;
      const trigger = target
        ? target.closest<HTMLButtonElement>("[data-meu-collapse-trigger]")
        : null;
      const panel = target ? target.closest<HTMLElement>("[data-meu-collapse-panel]") : null;
      const triggerRemainsAvailable = Boolean(
        trigger && targetOwner === event.currentTarget && trigger.isConnected && !trigger.disabled
      );
      const panelRemainsAvailable = Boolean(
        panel &&
        targetOwner === event.currentTarget &&
        panel.isConnected &&
        !panel.hasAttribute("inert") &&
        panel.getAttribute("aria-hidden") !== "true"
      );
      releaseFocusOwnership = triggerRemainsAvailable || panelRemainsAvailable;
    }
    if (releaseFocusOwnership) {
      focusWithinRef.current = false;
      focusedPanelValueRef.current = null;
      focusedValueRef.current = null;
    }
    if (onBlurCapture) onBlurCapture(event);
  }

  function handleTriggerKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, itemValue: string) {
    if (!keyboardNavigation || enabledItems.length === 0) return;
    const currentIndex = enabledItems.findIndex((entry) => entry.item.value === itemValue);
    if (currentIndex < 0) return;
    let target: (typeof enabledItems)[number] | undefined;

    if (event.key === "ArrowDown") {
      target = enabledItems[(currentIndex + 1) % enabledItems.length];
    } else if (event.key === "ArrowUp") {
      target = enabledItems[(currentIndex - 1 + enabledItems.length) % enabledItems.length];
    } else if (event.key === "Home") {
      target = enabledItems[0];
    } else if (event.key === "End") {
      target = enabledItems[enabledItems.length - 1];
    }

    if (!target) return;
    event.preventDefault();
    const targetButton = buttonRefs.current.get(target.item.value);
    if (targetButton) targetButton.focus();
  }

  return (
    <div
      {...props}
      ref={setRootRef}
      role={role}
      dir={dirProp}
      aria-disabled={ariaDisabled}
      className={className ? `${classes} ${className}` : classes}
      data-meu-component="collapse"
      data-disabled={disabled ? "true" : "false"}
      data-variant={variant}
      onBlurCapture={handleRootBlurCapture}
      onFocusCapture={handleRootFocusCapture}
    >
      {normalizedItems.map((item, itemIndex) => {
        const expanded = activeValue.includes(item.value);
        const idFragment = valueIdFragment(item.value);
        const triggerId = `${baseId}-trigger-${idFragment}`;
        const panelId = `${baseId}-panel-${idFragment}`;
        const itemDisabled = disabled || Boolean(item.disabled);
        const arrowNode = typeof arrow === "function" ? arrow(expanded) : arrow;

        return (
          <div
            className={itemStyle}
            key={item.value}
            data-meu-collapse-item={item.value}
            data-state={itemDisabled ? "disabled" : expanded ? "expanded" : "collapsed"}
          >
            <div className={heading} role="heading" aria-level={headingLevel}>
              <button
                id={triggerId}
                ref={(node) => {
                  if (node) buttonRefs.current.set(item.value, node);
                  else buttonRefs.current.delete(item.value);
                }}
                className={trigger({ expanded })}
                type="button"
                disabled={itemDisabled}
                aria-label={item.ariaLabel}
                aria-controls={panelId}
                aria-expanded={expanded}
                data-meu-collapse-trigger={item.value}
                data-meu-collapse-index={itemIndex}
                onKeyDown={(event) => handleTriggerKeyDown(event, item.value)}
                onClick={(event) => {
                  const nextValue = accordion
                    ? expanded
                      ? []
                      : [item.value]
                    : expanded
                      ? activeValue.filter((entry) => entry !== item.value)
                      : [...activeValue, item.value];

                  if (!controlled) setInternalValue(nextValue);
                  if (onChange) onChange(nextValue, event);
                }}
              >
                <span className={titleStyle}>{item.title}</span>
                {item.extra !== undefined && item.extra !== null ? (
                  <span className={extraStyle}>{item.extra}</span>
                ) : null}
                <span
                  className={arrowStyle({ direction: resolvedDirection, expanded })}
                  aria-hidden="true"
                >
                  {arrowNode !== undefined && arrowNode !== null ? (
                    arrowNode
                  ) : (
                    <MeuIconChevronLeft size={18} strokeWidth={2} />
                  )}
                </span>
              </button>
            </div>
            <div
              id={panelId}
              className={panel({ expanded })}
              role={region ? "region" : undefined}
              aria-hidden={!expanded}
              aria-labelledby={triggerId}
              inert={!expanded}
              data-meu-collapse-panel={item.value}
            >
              <div className={panelInner}>
                <div className={content}>{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
