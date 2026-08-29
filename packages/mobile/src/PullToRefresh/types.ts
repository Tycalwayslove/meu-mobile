import type { HTMLAttributes, ReactNode, Ref } from "react";

/** Pull-to-refresh lifecycle state. @public */
export type PullToRefreshStatus = "idle" | "pulling" | "ready" | "refreshing" | "complete";
/** Input path that started a refresh. @public */
export type PullToRefreshTrigger = "keyboard" | "pull";

/** Metadata emitted with a lifecycle transition. @public */
export type PullToRefreshStatusChangeDetails = {
  /** Current resisted pull distance in CSS pixels. */
  distance: number;
  /** New lifecycle state. */
  status: PullToRefreshStatus;
  /** Input path that caused this transition; omitted for directionless resets such as idle. */
  trigger?: PullToRefreshTrigger;
};

/** Values passed to a custom indicator renderer. @public */
export type PullToRefreshIndicatorDetails = {
  /** Current resisted pull distance in CSS pixels. */
  distance: number;
  /** Resisted distance in CSS pixels required to enter the ready state. */
  threshold: number;
};

/** Props for a scroll-boundary-aware pull-to-refresh enhancement. @public */
export type PullToRefreshProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "onTouchCancel" | "onTouchEnd" | "onTouchMove" | "onTouchStart"
> & {
  /** Accessible label for the focus-visible native refresh button. */
  actionLabel?: string;
  /** Overrides nearest-scroll-container boundary detection. */
  canPull?: () => boolean;
  /** Content translated while pulling. */
  children: ReactNode;
  /** Time to retain the complete state before returning to idle. @defaultValue 500 */
  completeDelay?: number;
  /** Disables touch and native-button refresh entry points. @defaultValue false */
  disabled?: boolean;
  /** Maximum resisted pull distance in pixels. @defaultValue 120 */
  maxPullDistance?: number;
  /** Refresh operation. Concurrent attempts are ignored. */
  onRefresh: () => Promise<void> | void;
  /** Receives a rejected or synchronously thrown refresh error. */
  onRefreshError?: (error: unknown) => void;
  /** Called once for each distinct lifecycle transition. */
  onStatusChange?: (status: PullToRefreshStatus, details: PullToRefreshStatusChangeDetails) => void;
  /** Root element ref. */
  ref?: Ref<HTMLDivElement>;
  /** Custom visual indicator. It must not contain interactive descendants. */
  renderIndicator?: (
    status: PullToRefreshStatus,
    details: PullToRefreshIndicatorDetails
  ) => ReactNode;
  /** Drag resistance, clamped to 0.1–1. @defaultValue 0.45 */
  resistance?: number;
  /** Resisted distance required to refresh. @defaultValue 64 */
  threshold?: number;
};
