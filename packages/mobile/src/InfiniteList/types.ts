import type { HTMLAttributes, ReactNode, Ref } from "react";

/** Visual and request state exposed by {@link InfiniteList}. */
export type InfiniteListStatus = "idle" | "loading" | "error" | "complete";
/** Entry point that initiated a pagination request. */
export type InfiniteListTrigger = "auto" | "manual" | "retry";

/** Details reported with an {@link InfiniteListStatus} transition. */
export type InfiniteListStatusChangeDetails = {
  /** Rejection value when entering the error state. */
  error?: unknown;
  /** Request entry point; omitted for external `hasMore` completion changes. */
  trigger?: InfiniteListTrigger;
};

/** Props for {@link InfiniteList}. */
export type InfiniteListProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Enables IntersectionObserver preloading while preserving the manual button. */
  autoLoad?: boolean;
  /** Content displayed after `hasMore` becomes false. */
  completeContent?: ReactNode;
  /** Disables automatic, retry, and manual request entry points. */
  disabled?: boolean;
  /** Content displayed after a request rejection. */
  errorContent?: ReactNode;
  /** Caller-owned pagination fact; false is the only completion source. */
  hasMore: boolean;
  /** Loads one additional page. Concurrent calls are locked. */
  loadMore: () => Promise<void>;
  /** Accessible label for the manual load button. */
  loadMoreLabel?: string;
  /** Content displayed while a request is pending. */
  loadingContent?: ReactNode;
  /** Receives the current request rejection. */
  onLoadError?: (error: unknown) => void;
  /** Receives deduplicated request and completion state transitions. */
  onStatusChange?: (status: InfiniteListStatus, details: InfiniteListStatusChangeDetails) => void;
  /** Root element ref. */
  ref?: Ref<HTMLDivElement>;
  /** Replaces status visuals while native manual and retry paths remain available. */
  renderContent?: (status: InfiniteListStatus) => ReactNode;
  /** Accessible label for the retry button. */
  retryLabel?: string;
  /** Non-negative bottom preload distance in CSS pixels. */
  threshold?: number;
};
