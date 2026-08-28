"use client";

import { defaultRangeExtractor, useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { CSSProperties, FocusEvent as ReactFocusEvent, Key } from "react";

import { empty, item, root, sizer } from "./VirtualList.css";
import type {
  VirtualListProps,
  VirtualListRange,
  VirtualListRef,
  VirtualListScrollOptions,
  VirtualListScrollToIndexOptions
} from "./types";

const DEFAULT_HEIGHT = 320;
const DEFAULT_OVERSCAN = 3;
const ITEM_INDEX_ATTRIBUTE = "data-meu-virtual-index";

function finiteAtLeast(value: number, fallback: number, minimum: number) {
  return Number.isFinite(value) ? Math.max(minimum, value) : fallback;
}

function normalizedInteger(value: number, fallback: number, minimum: number, maximum: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(maximum, Math.max(minimum, Math.floor(value)));
}

function sameRange(left: VirtualListRange | null, right: VirtualListRange) {
  return (
    left !== null &&
    left.visibleStartIndex === right.visibleStartIndex &&
    left.visibleEndIndex === right.visibleEndIndex &&
    left.overscanStartIndex === right.overscanStartIndex &&
    left.overscanEndIndex === right.overscanEndIndex
  );
}

function findItemIndex(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;
  const row = target.closest(`[${ITEM_INDEX_ATTRIBUTE}]`);
  if (!row) return null;
  const value = Number(row.getAttribute(ITEM_INDEX_ATTRIBUTE));
  return Number.isInteger(value) ? value : null;
}

/** Renders a vertical, dynamically measured window over a caller-owned item collection. */
export function VirtualList<T>({
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  className,
  emptyContent,
  estimateSize,
  gap = 0,
  getItemKey,
  height,
  initialOffset = 0,
  items,
  onBlurCapture,
  onFocusCapture,
  onRangeChange,
  overscan = DEFAULT_OVERSCAN,
  ref,
  renderItem,
  style,
  tabIndex = 0,
  ...props
}: VirtualListProps<T>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const onRangeChangeRef = useRef(onRangeChange);
  const lastRangeRef = useRef<VirtualListRange | null>(null);
  const [focusedKey, setFocusedKey] = useState<Key | null>(null);
  onRangeChangeRef.current = onRangeChange;

  const resolvedHeight = finiteAtLeast(height, DEFAULT_HEIGHT, 1);
  const resolvedGap = finiteAtLeast(gap, 0, 0);
  const resolvedInitialOffset = finiteAtLeast(initialOffset, 0, 0);
  const resolvedOverscan = normalizedInteger(overscan, DEFAULT_OVERSCAN, 0, 100);

  const estimateItemSize = useCallback(
    (index: number) => {
      const candidate =
        typeof estimateSize === "function" ? estimateSize(items[index] as T, index) : estimateSize;
      return finiteAtLeast(candidate, 44, 1);
    },
    [estimateSize, items]
  );

  const extractItemKey = useCallback(
    (index: number): Key => getItemKey(items[index] as T, index),
    [getItemKey, items]
  );

  let focusedIndex: number | null = null;
  if (focusedKey !== null) {
    const matchingIndex = items.findIndex((candidate, index) =>
      Object.is(getItemKey(candidate, index), focusedKey)
    );
    if (matchingIndex >= 0) focusedIndex = matchingIndex;
  }

  const extractRange = useCallback(
    (range: { count: number; endIndex: number; overscan: number; startIndex: number }) => {
      const indexes = defaultRangeExtractor(range);
      if (
        focusedIndex !== null &&
        focusedIndex >= 0 &&
        focusedIndex < range.count &&
        indexes.indexOf(focusedIndex) === -1
      ) {
        indexes.push(focusedIndex);
        indexes.sort((left, right) => left - right);
      }
      return indexes;
    },
    [focusedIndex]
  );

  const publishRange = useCallback(
    (instance: { range: { endIndex: number; startIndex: number } | null }) => {
      if (items.length === 0 || instance.range === null) return;
      const regularIndexes = defaultRangeExtractor({
        count: items.length,
        endIndex: instance.range.endIndex,
        overscan: resolvedOverscan,
        startIndex: instance.range.startIndex
      });
      const overscanStartIndex = regularIndexes[0];
      const overscanEndIndex = regularIndexes[regularIndexes.length - 1];
      if (overscanStartIndex === undefined || overscanEndIndex === undefined) return;
      const nextRange: VirtualListRange = {
        overscanEndIndex,
        overscanStartIndex,
        visibleEndIndex: instance.range.endIndex,
        visibleStartIndex: instance.range.startIndex
      };
      if (sameRange(lastRangeRef.current, nextRange)) return;
      lastRangeRef.current = nextRange;
      const callback = onRangeChangeRef.current;
      if (callback) callback(nextRange);
    },
    [items.length, resolvedOverscan]
  );

  const virtualizer = useVirtualizer<HTMLDivElement, HTMLDivElement>({
    count: items.length,
    estimateSize: estimateItemSize,
    gap: resolvedGap,
    getItemKey: extractItemKey,
    getScrollElement: () => rootRef.current,
    indexAttribute: ITEM_INDEX_ATTRIBUTE,
    initialOffset: resolvedInitialOffset,
    initialRect: { height: resolvedHeight, width: 0 },
    onChange: publishRange,
    overscan: resolvedOverscan,
    rangeExtractor: extractRange,
    useFlushSync: false
  });

  useEffect(() => {
    publishRange(virtualizer);
  }, [publishRange, virtualizer]);

  useEffect(() => {
    if (items.length === 0) lastRangeRef.current = null;
    if (focusedKey !== null && focusedIndex === null) setFocusedKey(null);
  }, [focusedIndex, focusedKey, items.length]);

  useImperativeHandle(
    ref,
    (): VirtualListRef => ({
      measure: () => virtualizer.measure(),
      get nativeElement() {
        return rootRef.current;
      },
      scrollToIndex: (index: number, options?: VirtualListScrollToIndexOptions) => {
        if (items.length === 0 || !Number.isFinite(index)) return;
        const resolvedIndex = Math.min(items.length - 1, Math.max(0, Math.trunc(index)));
        virtualizer.scrollToIndex(resolvedIndex, {
          align: options && options.align ? options.align : "auto",
          behavior: options && options.behavior ? options.behavior : "auto"
        });
      },
      scrollToOffset: (offset: number, options?: VirtualListScrollOptions) => {
        if (!Number.isFinite(offset)) return;
        virtualizer.scrollToOffset(Math.max(0, offset), {
          behavior: options && options.behavior ? options.behavior : "auto"
        });
      }
    }),
    [items.length, virtualizer]
  );

  const virtualItems = virtualizer.getVirtualItems();
  const rootStyle: CSSProperties = { ...style, height: resolvedHeight };

  const handleFocusCapture = (event: ReactFocusEvent<HTMLDivElement>) => {
    const index = findItemIndex(event.target);
    if (index !== null && index < items.length) setFocusedKey(getItemKey(items[index] as T, index));
    if (onFocusCapture) onFocusCapture(event);
  };

  const handleBlurCapture = (event: ReactFocusEvent<HTMLDivElement>) => {
    const nextTarget = event.relatedTarget;
    if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
      setFocusedKey(null);
    }
    if (onBlurCapture) onBlurCapture(event);
  };

  return (
    <div
      {...props}
      ref={rootRef}
      role={items.length === 0 ? "status" : "list"}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      className={className ? `${root} ${className}` : root}
      data-meu-component="virtual-list"
      data-rendered-count={virtualItems.length}
      onBlurCapture={handleBlurCapture}
      onFocusCapture={handleFocusCapture}
      style={rootStyle}
      tabIndex={tabIndex}
    >
      {items.length === 0 ? (
        <div className={empty}>{emptyContent}</div>
      ) : (
        <div className={sizer} role="presentation" style={{ height: virtualizer.getTotalSize() }}>
          {virtualItems.map((virtualItem) => (
            <div
              key={virtualItem.key}
              ref={virtualizer.measureElement}
              role="listitem"
              aria-posinset={virtualItem.index + 1}
              aria-setsize={items.length}
              className={item}
              data-meu-virtual-index={virtualItem.index}
              style={{ transform: `translateY(${virtualItem.start}px)` }}
            >
              {renderItem(items[virtualItem.index] as T, virtualItem.index)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
