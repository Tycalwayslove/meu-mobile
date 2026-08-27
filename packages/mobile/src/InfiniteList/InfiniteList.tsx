"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Ref } from "react";

import { useMeuConfig } from "../ConfigProvider";
import { VisuallyHidden } from "../internal/VisuallyHidden";
import { action, content, errorText, root, spinner } from "./InfiniteList.css";
import type {
  InfiniteListProps,
  InfiniteListStatus,
  InfiniteListStatusChangeDetails,
  InfiniteListTrigger
} from "./types";

type InfiniteListRequestStatus = Exclude<InfiniteListStatus, "complete">;

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

function normalizedThreshold(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 250;
}

function isScrollable(node: HTMLElement) {
  const style = window.getComputedStyle(node);
  return /(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight;
}

function findScrollRoot(node: HTMLElement) {
  let current = node.parentElement;
  while (current && current !== document.body && current !== document.documentElement) {
    if (isScrollable(current)) return current;
    current = current.parentElement;
  }
  return null;
}

export function InfiniteList({
  autoLoad = true,
  className,
  completeContent,
  disabled = false,
  errorContent,
  hasMore,
  loadMore,
  loadMoreLabel,
  loadingContent,
  onLoadError,
  onStatusChange,
  ref,
  renderContent,
  retryLabel,
  threshold = 250,
  ...props
}: InfiniteListProps) {
  const { locale } = useMeuConfig();
  const rootRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(hasMore);
  const statusRef = useRef<InfiniteListRequestStatus>("idle");
  const reportedStatusRef = useRef<InfiniteListStatus>(hasMore ? "idle" : "complete");
  const [status, setStatus] = useState<InfiniteListRequestStatus>("idle");

  const labels =
    locale === "en-US"
      ? {
          complete: "No more content",
          error: "Could not load more content",
          idle: "More content is available",
          loadMore: "Load more",
          loading: "Loading more content…",
          retry: "Retry"
        }
      : {
          complete: "没有更多内容了",
          error: "加载更多内容失败",
          idle: "还有更多内容",
          loadMore: "加载更多",
          loading: "正在加载更多内容…",
          retry: "重试"
        };
  const resolvedThreshold = normalizedThreshold(threshold);

  const publishStatus = useCallback(
    (nextStatus: InfiniteListRequestStatus, details: InfiniteListStatusChangeDetails = {}) => {
      if (statusRef.current === nextStatus) return;
      statusRef.current = nextStatus;
      reportedStatusRef.current = nextStatus;
      setStatus(nextStatus);
      if (onStatusChange) onStatusChange(nextStatus, details);
    },
    [onStatusChange]
  );

  const requestLoad = useCallback(
    async (trigger: InfiniteListTrigger) => {
      if (disabled || !hasMoreRef.current || loadingRef.current) return;
      if (statusRef.current === "error" && trigger === "auto") return;
      loadingRef.current = true;
      publishStatus("loading", { trigger });
      try {
        await loadMore();
        if (!mountedRef.current) return;
        loadingRef.current = false;
        statusRef.current = "idle";
        setStatus("idle");
        if (hasMoreRef.current && reportedStatusRef.current !== "idle") {
          reportedStatusRef.current = "idle";
          if (onStatusChange) onStatusChange("idle", { trigger });
        }
      } catch (error) {
        if (!mountedRef.current) return;
        loadingRef.current = false;
        publishStatus("error", { error, trigger });
        if (onLoadError) onLoadError(error);
      }
    },
    [disabled, loadMore, onLoadError, onStatusChange, publishStatus]
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    hasMoreRef.current = hasMore;
    const resolvedStatus: InfiniteListStatus = hasMore ? statusRef.current : "complete";
    if (reportedStatusRef.current !== resolvedStatus) {
      reportedStatusRef.current = resolvedStatus;
      if (onStatusChange) onStatusChange(resolvedStatus, {});
    }
  }, [hasMore, onStatusChange]);

  useEffect(() => {
    const node = rootRef.current;
    if (
      !node ||
      !autoLoad ||
      disabled ||
      !hasMore ||
      status !== "idle" ||
      typeof IntersectionObserver === "undefined"
    ) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void requestLoad("auto");
      },
      {
        root: findScrollRoot(node),
        rootMargin: `0px 0px ${resolvedThreshold}px 0px`,
        threshold: 0
      }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [autoLoad, disabled, hasMore, requestLoad, resolvedThreshold, status]);

  const resolvedStatus = hasMore ? status : "complete";
  const manualLoad = useCallback(() => requestLoad("manual"), [requestLoad]);
  const retry = useCallback(() => requestLoad("retry"), [requestLoad]);
  const defaultStatusContent =
    resolvedStatus === "loading" ? (
      <>
        <span className={spinner} aria-hidden="true" />
        <div>{loadingContent === undefined ? labels.loading : loadingContent}</div>
      </>
    ) : resolvedStatus === "complete" ? (
      <div>{completeContent === undefined ? labels.complete : completeContent}</div>
    ) : resolvedStatus === "error" ? (
      <div className={errorText}>{errorContent === undefined ? labels.error : errorContent}</div>
    ) : null;
  const defaultAction =
    resolvedStatus === "error" ? (
      <button className={action} type="button" onClick={() => void retry()}>
        {retryLabel || labels.retry}
      </button>
    ) : resolvedStatus === "idle" ? (
      <button
        className={action}
        type="button"
        disabled={disabled}
        onClick={() => void manualLoad()}
      >
        {loadMoreLabel || labels.loadMore}
      </button>
    ) : null;

  return (
    <div
      {...props}
      ref={(node) => {
        rootRef.current = node;
        assignRef(ref, node);
      }}
      className={className ? `${root} ${className}` : root}
      aria-busy={resolvedStatus === "loading" ? "true" : undefined}
      data-auto-load={autoLoad ? "true" : "false"}
      data-meu-component="infinite-list"
      data-status={resolvedStatus}
    >
      <VisuallyHidden role="status" aria-live="polite" aria-atomic="true">
        {labels[resolvedStatus]}
      </VisuallyHidden>
      <div className={content}>
        {renderContent ? renderContent(resolvedStatus) : defaultStatusContent}
        {defaultAction}
      </div>
    </div>
  );
}
