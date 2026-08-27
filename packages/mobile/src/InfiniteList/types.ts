import type { HTMLAttributes, ReactNode, Ref } from "react";

export type InfiniteListStatus = "idle" | "loading" | "error" | "complete";
export type InfiniteListTrigger = "auto" | "manual" | "retry";

export type InfiniteListStatusChangeDetails = {
  error?: unknown;
  trigger?: InfiniteListTrigger;
};

export type InfiniteListProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  autoLoad?: boolean;
  completeContent?: ReactNode;
  disabled?: boolean;
  errorContent?: ReactNode;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  loadMoreLabel?: string;
  loadingContent?: ReactNode;
  onLoadError?: (error: unknown) => void;
  onStatusChange?: (status: InfiniteListStatus, details: InfiniteListStatusChangeDetails) => void;
  ref?: Ref<HTMLDivElement>;
  renderContent?: (status: InfiniteListStatus) => ReactNode;
  retryLabel?: string;
  threshold?: number;
};
