import type { FocusEvent as ReactFocusEvent, HTMLAttributes, Key, ReactNode, Ref } from "react";

/** Alignment used by {@link VirtualListRef.scrollToIndex}. */
export type VirtualListAlign = "start" | "center" | "end" | "auto";
/** Native scroll behavior supported by VirtualList imperative methods. */
export type VirtualListScrollBehavior = "auto" | "smooth";

/** Options shared by VirtualList imperative scrolling methods. */
export type VirtualListScrollOptions = {
  /** Native scroll behavior; dynamic measurements can correct a smooth destination. */
  behavior?: VirtualListScrollBehavior;
};

/** Options for {@link VirtualListRef.scrollToIndex}. */
export type VirtualListScrollToIndexOptions = VirtualListScrollOptions & {
  /** Position of the target row in the owned viewport. */
  align?: VirtualListAlign;
};

/** Visible and mounted window reported by {@link VirtualList}. */
export type VirtualListRange = {
  /** Last mounted overscan index, inclusive. */
  overscanEndIndex: number;
  /** First mounted overscan index, inclusive. */
  overscanStartIndex: number;
  /** Last visible index, inclusive. */
  visibleEndIndex: number;
  /** First visible index, inclusive. */
  visibleStartIndex: number;
};

/** Imperative handle exposed by {@link VirtualList}. */
export type VirtualListRef = {
  /** Re-measures every currently mounted row. */
  measure: () => void;
  /** Owned vertical scroll viewport. */
  nativeElement: HTMLDivElement | null;
  /** Scrolls to a finite, clamped item index. */
  scrollToIndex: (index: number, options?: VirtualListScrollToIndexOptions) => void;
  /** Scrolls to a finite, non-negative pixel offset. */
  scrollToOffset: (offset: number, options?: VirtualListScrollOptions) => void;
};

type VirtualListAccessibleName =
  | { "aria-label": string; "aria-labelledby"?: never }
  | { "aria-label"?: never; "aria-labelledby": string };

type VirtualListBaseProps<T> = Omit<
  HTMLAttributes<HTMLDivElement>,
  "aria-label" | "aria-labelledby" | "children" | "onBlurCapture" | "onFocusCapture" | "role"
> & {
  /** Caller-owned content rendered when `items` is empty. */
  emptyContent?: ReactNode;
  /** Estimated row height or estimator used before DOM measurement. */
  estimateSize: number | ((item: T, index: number) => number);
  /** Non-negative vertical gap between rows. */
  gap?: number;
  /** Stable unique key extractor. Never use a mutable list index as identity. */
  getItemKey: (item: T, index: number) => Key;
  /** Finite owned viewport height in CSS pixels. */
  height: number;
  /** Non-negative SSR and first-mount scroll offset. */
  initialOffset?: number;
  /** Caller-owned ordered data. */
  items: readonly T[];
  /** Observes blur events after internal focus-retention bookkeeping. */
  onBlurCapture?: (event: ReactFocusEvent<HTMLDivElement>) => void;
  /** Observes focus events after internal focus-retention bookkeeping. */
  onFocusCapture?: (event: ReactFocusEvent<HTMLDivElement>) => void;
  /** Receives deduplicated visible and overscan windows. */
  onRangeChange?: (range: VirtualListRange) => void;
  /** Additional rows mounted before and after the visible window. */
  overscan?: number;
  /** Imperative measurement and scrolling handle. */
  ref?: Ref<VirtualListRef>;
  /** Renders one row; event and business state ownership remain with the caller. */
  renderItem: (item: T, index: number) => ReactNode;
};

/** Props for the vertical-only {@link VirtualList}. A list accessible name is required. */
export type VirtualListProps<T> = VirtualListBaseProps<T> & VirtualListAccessibleName;
