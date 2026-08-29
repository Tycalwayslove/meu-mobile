import type { HTMLAttributes, ReactNode, Ref } from "react";

/**
 * Visual and request state exposed by {@link InfiniteList}.
 *
 * @public
 */
export type InfiniteListStatus = "idle" | "loading" | "error" | "complete";
/**
 * Entry point that initiated a pagination request.
 *
 * @public
 */
export type InfiniteListTrigger = "auto" | "manual" | "retry";

/**
 * Request lifecycle supplied to an InfiniteList page loader.
 *
 * @public
 */
export type InfiniteListLoadContext = {
  /** Aborts when the list completes or unmounts; loaders should forward it to cancellable I/O. */
  signal: AbortSignal;
  /** Entry point that initiated this request. */
  trigger: InfiniteListTrigger;
};

/**
 * Details reported with an {@link InfiniteListStatus} transition.
 *
 * @public
 */
export type InfiniteListStatusChangeDetails = {
  /** Rejection value when entering the error state. */
  error?: unknown;
  /** Request entry point; omitted for external `hasMore` completion changes. */
  trigger?: InfiniteListTrigger;
};

/**
 * Props for {@link InfiniteList}.
 *
 * @public
 */
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
  /** Loads one additional page. Concurrent calls are locked; the signal supports cooperative cancellation. */
  loadMore: (context: InfiniteListLoadContext) => Promise<void>;
  /** Accessible label for the manual load button. */
  loadMoreLabel?: string;
  /** Polite live-region announcement after one page loads successfully. */
  loadedAnnouncement?: ReactNode;
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
