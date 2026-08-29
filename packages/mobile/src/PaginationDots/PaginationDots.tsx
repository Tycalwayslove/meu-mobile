"use client";

import { useCallback, useLayoutEffect, useRef } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, Ref } from "react";

import { useMeuConfig } from "../ConfigProvider";
import { button, dot, ellipsis, root } from "./PaginationDots.css";
import type { PaginationDotsProps } from "./types";

const MAX_SAFE_COUNT = Number.MAX_SAFE_INTEGER;
const MAX_VISIBLE_MARKERS = 99;

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

function resolveElementDirection(element: HTMLElement, fallback: "ltr" | "rtl") {
  let current: HTMLElement | null = element;
  while (current) {
    const direction = current.getAttribute("dir");
    if (direction === "ltr" || direction === "rtl") return direction;
    current = current.parentElement;
  }
  const computedDirection = window.getComputedStyle(element).direction;
  return computedDirection === "ltr" || computedDirection === "rtl" ? computedDirection : fallback;
}

/**
 * Renders compact page-position markers with optional page buttons.
 *
 * @public
 */
export function PaginationDots({
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-disabled": ariaDisabled,
  activeIndex,
  className,
  count,
  dir: explicitDir,
  direction = "horizontal",
  disabled = false,
  getPageLabel,
  interactive = false,
  maxVisible = 7,
  onBlurCapture,
  onChange,
  onFocusCapture,
  ref,
  variant = "dot",
  ...props
}: PaginationDotsProps) {
  const { dir: configuredDir, locale } = useMeuConfig();
  const safeCount = Number.isFinite(count)
    ? Math.min(Math.max(0, Math.trunc(count)), MAX_SAFE_COUNT)
    : 0;
  const normalizedIndex = Number.isFinite(activeIndex) ? Math.trunc(activeIndex) : 0;
  const safeIndex = safeCount > 0 ? Math.min(Math.max(normalizedIndex, 0), safeCount - 1) : 0;
  const defaultLabel =
    locale === "en-US"
      ? `Page ${safeCount > 0 ? safeIndex + 1 : 0} of ${safeCount}`
      : `第 ${safeCount > 0 ? safeIndex + 1 : 0} 页，共 ${safeCount} 页`;
  const resolvedLabel =
    ariaLabel !== undefined ? ariaLabel : ariaLabelledBy ? undefined : defaultLabel;
  const classes = root({ direction });
  const resolvedTextDirection =
    explicitDir === "ltr" || explicitDir === "rtl" ? explicitDir : configuredDir;
  const safeMaxVisible = Number.isFinite(maxVisible)
    ? Math.min(Math.max(5, Math.trunc(maxVisible)), MAX_VISIBLE_MARKERS)
    : 7;

  function getVisibleItems(): Array<number | string> {
    if (safeCount <= safeMaxVisible) return Array.from({ length: safeCount }, (_, index) => index);
    const edgeValueCount = safeMaxVisible - 2;
    if (safeIndex <= safeMaxVisible - 3) {
      return [...Array.from({ length: edgeValueCount }, (_, index) => index), "end", safeCount - 1];
    }
    if (safeIndex >= safeCount - edgeValueCount) {
      return [
        0,
        "start",
        ...Array.from({ length: edgeValueCount }, (_, index) => safeCount - edgeValueCount + index)
      ];
    }
    const neighborSlots = safeMaxVisible - 5;
    const leftNeighborCount = Math.floor(neighborSlots / 2);
    return [
      0,
      "start",
      ...Array.from(
        { length: neighborSlots + 1 },
        (_, index) => safeIndex - leftNeighborCount + index
      ),
      "end",
      safeCount - 1
    ];
  }

  const renderedItems = getVisibleItems();
  const visibleIndexes = renderedItems.filter((item): item is number => typeof item === "number");
  const rootRef = useRef<HTMLDivElement>(null);
  const focusedIndexRef = useRef<number | null>(null);
  const focusedNodeRef = useRef<HTMLButtonElement | null>(null);
  const setRootRef = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      assignRef(ref, node);
    },
    [ref]
  );

  function findButton(index: number): HTMLButtonElement | null {
    const rootNode = rootRef.current;
    if (!rootNode) return null;
    for (const candidate of rootNode.querySelectorAll<HTMLButtonElement>("[data-page-index]")) {
      if (candidate.getAttribute("data-page-index") === String(index)) return candidate;
    }
    return null;
  }

  useLayoutEffect(() => {
    const focusedIndex = focusedIndexRef.current;
    const focusedNode = focusedNodeRef.current;
    if (focusedIndex === null || !focusedNode) return;
    const activeElement = document.activeElement;
    const trackedPageIsVisible = visibleIndexes.includes(focusedIndex);
    const rootNode = rootRef.current;
    const trackedNodeWasRemoved =
      !focusedNode.isConnected || !rootNode || !rootNode.contains(focusedNode);
    if (
      interactive &&
      !disabled &&
      activeElement === document.body &&
      (!trackedPageIsVisible || trackedNodeWasRemoved)
    ) {
      const fallback = findButton(safeIndex);
      if (fallback) fallback.focus();
      else {
        focusedIndexRef.current = null;
        focusedNodeRef.current = null;
      }
      return;
    }
    if (activeElement !== focusedNode && (!rootNode || !rootNode.contains(activeElement))) {
      focusedIndexRef.current = null;
      focusedNodeRef.current = null;
    }
  });

  function moveFocus(index: number, event: ReactKeyboardEvent<HTMLButtonElement>) {
    const currentPosition = visibleIndexes.indexOf(index);
    if (currentPosition < 0) return;
    const keyboardDirection = resolveElementDirection(event.currentTarget, resolvedTextDirection);
    let nextPosition = currentPosition;
    if (event.key === "Home") nextPosition = 0;
    else if (event.key === "End") nextPosition = visibleIndexes.length - 1;
    else if (direction === "vertical" && event.key === "ArrowUp") nextPosition -= 1;
    else if (direction === "vertical" && event.key === "ArrowDown") nextPosition += 1;
    else if (direction === "horizontal" && event.key === "ArrowLeft") {
      nextPosition += keyboardDirection === "rtl" ? 1 : -1;
    } else if (direction === "horizontal" && event.key === "ArrowRight") {
      nextPosition += keyboardDirection === "rtl" ? -1 : 1;
    } else return;
    event.preventDefault();
    const nextIndex =
      visibleIndexes[Math.min(Math.max(nextPosition, 0), visibleIndexes.length - 1)];
    if (nextIndex === undefined) return;
    const nextButton = findButton(nextIndex);
    if (nextButton) nextButton.focus();
  }

  function pageLabel(index: number) {
    if (getPageLabel) return getPageLabel(index, safeCount);
    return locale === "en-US"
      ? `Go to page ${index + 1} of ${safeCount}`
      : `前往第 ${index + 1} 页，共 ${safeCount} 页`;
  }

  return (
    <div
      {...props}
      ref={setRootRef}
      dir={explicitDir}
      role={interactive ? "group" : "img"}
      className={className ? `${classes} ${className}` : classes}
      aria-label={resolvedLabel}
      aria-labelledby={ariaLabel !== undefined ? undefined : ariaLabelledBy}
      aria-disabled={interactive && disabled ? true : ariaDisabled}
      data-meu-component="pagination-dots"
      data-count={safeCount}
      data-index={safeIndex}
      data-variant={variant}
      data-disabled={disabled ? "true" : "false"}
      onBlurCapture={(event) => {
        if (onBlurCapture) onBlurCapture(event);
        const nextTarget = event.relatedTarget;
        if (nextTarget instanceof Node && !event.currentTarget.contains(nextTarget)) {
          focusedIndexRef.current = null;
          focusedNodeRef.current = null;
        } else if (!nextTarget) {
          const target = event.target;
          if (target instanceof HTMLButtonElement && target.isConnected && !target.disabled) {
            focusedIndexRef.current = null;
            focusedNodeRef.current = null;
          }
        }
      }}
      onFocusCapture={(event) => {
        if (onFocusCapture) onFocusCapture(event);
        const target = event.target;
        if (!(target instanceof HTMLButtonElement)) return;
        const pageIndex = target.getAttribute("data-page-index");
        if (pageIndex === null) return;
        focusedIndexRef.current = Number(pageIndex);
        focusedNodeRef.current = target;
      }}
    >
      {renderedItems.map((item) => {
        if (typeof item !== "number") {
          return (
            <span className={ellipsis} aria-hidden="true" key={item}>
              …
            </span>
          );
        }
        const marker = (
          <span
            className={dot({ active: item === safeIndex, direction, variant })}
            aria-hidden="true"
            data-active={item === safeIndex ? "true" : "false"}
          />
        );
        return interactive ? (
          <button
            className={button}
            type="button"
            disabled={disabled}
            aria-current={item === safeIndex ? "page" : undefined}
            aria-label={pageLabel(item)}
            data-page-index={item}
            tabIndex={disabled ? -1 : item === safeIndex ? 0 : -1}
            onKeyDown={(event) => moveFocus(item, event)}
            onClick={(event) => {
              if (item !== safeIndex && onChange) onChange(item, event);
            }}
            key={item}
          >
            {marker}
          </button>
        ) : (
          <span key={item}>{marker}</span>
        );
      })}
    </div>
  );
}
