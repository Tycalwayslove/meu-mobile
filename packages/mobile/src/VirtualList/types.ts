import type {
  FocusEvent as ReactFocusEvent,
  HTMLAttributes,
  Key,
  ReactNode,
  Ref
} from "react";

export type VirtualListAlign = "start" | "center" | "end" | "auto";
export type VirtualListScrollBehavior = "auto" | "smooth";

export type VirtualListScrollOptions = {
  behavior?: VirtualListScrollBehavior;
};

export type VirtualListScrollToIndexOptions = VirtualListScrollOptions & {
  align?: VirtualListAlign;
};

export type VirtualListRange = {
  overscanEndIndex: number;
  overscanStartIndex: number;
  visibleEndIndex: number;
  visibleStartIndex: number;
};

export type VirtualListRef = {
  measure: () => void;
  nativeElement: HTMLDivElement | null;
  scrollToIndex: (index: number, options?: VirtualListScrollToIndexOptions) => void;
  scrollToOffset: (offset: number, options?: VirtualListScrollOptions) => void;
};

type VirtualListAccessibleName =
  | { "aria-label": string; "aria-labelledby"?: never }
  | { "aria-label"?: never; "aria-labelledby": string };

type VirtualListBaseProps<T> = Omit<
  HTMLAttributes<HTMLDivElement>,
  | "aria-label"
  | "aria-labelledby"
  | "children"
  | "onBlurCapture"
  | "onFocusCapture"
  | "role"
> & {
  emptyContent?: ReactNode;
  estimateSize: number | ((item: T, index: number) => number);
  gap?: number;
  getItemKey: (item: T, index: number) => Key;
  height: number;
  initialOffset?: number;
  items: readonly T[];
  onBlurCapture?: (event: ReactFocusEvent<HTMLDivElement>) => void;
  onFocusCapture?: (event: ReactFocusEvent<HTMLDivElement>) => void;
  onRangeChange?: (range: VirtualListRange) => void;
  overscan?: number;
  ref?: Ref<VirtualListRef>;
  renderItem: (item: T, index: number) => ReactNode;
};

export type VirtualListProps<T> = VirtualListBaseProps<T> & VirtualListAccessibleName;
