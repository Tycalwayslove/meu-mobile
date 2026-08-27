import type { HTMLAttributes, ReactNode, Ref } from "react";

export type PullToRefreshStatus = "idle" | "pulling" | "ready" | "refreshing" | "complete";
export type PullToRefreshTrigger = "keyboard" | "pull";

export type PullToRefreshStatusChangeDetails = {
  distance: number;
  status: PullToRefreshStatus;
  trigger?: PullToRefreshTrigger;
};

export type PullToRefreshIndicatorDetails = { distance: number; threshold: number };

export type PullToRefreshProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "onTouchCancel" | "onTouchEnd" | "onTouchMove" | "onTouchStart"
> & {
  actionLabel?: string;
  canPull?: () => boolean;
  children: ReactNode;
  completeDelay?: number;
  disabled?: boolean;
  maxPullDistance?: number;
  onRefresh: () => Promise<void> | void;
  onRefreshError?: (error: unknown) => void;
  onStatusChange?: (status: PullToRefreshStatus, details: PullToRefreshStatusChangeDetails) => void;
  ref?: Ref<HTMLDivElement>;
  renderIndicator?: (
    status: PullToRefreshStatus,
    details: PullToRefreshIndicatorDetails
  ) => ReactNode;
  resistance?: number;
  threshold?: number;
};
