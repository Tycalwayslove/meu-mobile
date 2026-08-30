"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Ref } from "react";

import { useMeuConfig } from "../ConfigProvider";
import { VisuallyHidden } from "../internal/VisuallyHidden";
import { action, content, errorText, root, spinner, spinnerReduced } from "./InfiniteList.css";
import type {
  InfiniteListProps,
  InfiniteListStatus,
  InfiniteListStatusChangeDetails,
  InfiniteListTrigger
} from "./types";

type InfiniteListRequestStatus = Exclude<InfiniteListStatus, "complete">;
type InfiniteListAnnouncement = InfiniteListStatus | "loaded";

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

function normalizedThreshold(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 250;
}

function isScrollContainer(node: HTMLElement) {
  const style = window.getComputedStyle(node);
  // An overflow container is the correct observer root even before its first page is tall enough
  // to scroll. Requiring current overflow incorrectly binds short/empty lists to the viewport.
  return /(auto|scroll)/.test(style.overflowY);
}

function findScrollRoot(node: HTMLElement) {
  let current = node.parentElement;
  while (current && current !== document.body && current !== document.documentElement) {
    if (isScrollContainer(current)) return current;
    current = current.parentElement;
  }
  return null;
}

/**
 * Renders a concurrency-safe pagination sentinel with automatic and manual request paths.
 *
 * @public
 */
export function InfiniteList({
  autoLoad = true,
  className,
  completeContent,
  disabled = false,
  errorContent,
  hasMore,
  loadMore,
  loadMoreLabel,
  loadedAnnouncement,
  loadingContent,
  onLoadError,
  onStatusChange,
  ref,
  renderContent,
  retryLabel,
  threshold = 250,
  ...props
}: InfiniteListProps) {
  const { locale, motion } = useMeuConfig();
  const rootRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLButtonElement>(null);
  const mountedRef = useRef(true);
  const activeAbortControllerRef = useRef<AbortController | null>(null);
  const activeRequestIdRef = useRef<number | null>(null);
  const requestIdRef = useRef(0);
  const hasMoreRef = useRef(hasMore);
  const onLoadErrorRef = useRef(onLoadError);
  const onStatusChangeRef = useRef(onStatusChange);
  const statusRef = useRef<InfiniteListRequestStatus>("idle");
  const reportedStatusRef = useRef<InfiniteListStatus>(hasMore ? "idle" : "complete");
  const restoreActionFocusRef = useRef(false);
  const [status, setStatus] = useState<InfiniteListRequestStatus>("idle");
  const [announcement, setAnnouncement] = useState<InfiniteListAnnouncement>(
    hasMore ? "idle" : "complete"
  );

  useEffect(() => {
    onLoadErrorRef.current = onLoadError;
    onStatusChangeRef.current = onStatusChange;
  }, [onLoadError, onStatusChange]);

  const labels =
    locale === "en-US"
      ? {
          complete: "No more content",
          error: "Could not load more content",
          idle: "More content is available",
          loadMore: "Load more",
          loaded: "More content loaded",
          loading: "Loading more content…",
          retry: "Retry"
        }
      : {
          complete: "没有更多内容了",
          error: "加载更多内容失败",
          idle: "还有更多内容",
          loadMore: "加载更多",
          loaded: "已加载更多内容",
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
      setAnnouncement(nextStatus);
      const callback = onStatusChangeRef.current;
      if (callback) callback(nextStatus, details);
    },
    []
  );

  const requestLoad = useCallback(
    async (trigger: InfiniteListTrigger) => {
      if (disabled || !hasMoreRef.current || activeRequestIdRef.current !== null) return;
      if (statusRef.current === "error" && trigger === "auto") return;
      restoreActionFocusRef.current =
        trigger !== "auto" &&
        typeof document !== "undefined" &&
        actionRef.current === document.activeElement;
      requestIdRef.current += 1;
      const requestId = requestIdRef.current;
      const abortController = new AbortController();
      activeAbortControllerRef.current = abortController;
      activeRequestIdRef.current = requestId;
      publishStatus("loading", { trigger });
      try {
        await loadMore({ signal: abortController.signal, trigger });
        if (!mountedRef.current) return;
        if (requestIdRef.current !== requestId || activeRequestIdRef.current !== requestId) return;
        activeAbortControllerRef.current = null;
        activeRequestIdRef.current = null;
        statusRef.current = "idle";
        setStatus("idle");
        setAnnouncement("loaded");
        if (hasMoreRef.current && reportedStatusRef.current !== "idle") {
          reportedStatusRef.current = "idle";
          const callback = onStatusChangeRef.current;
          if (callback) callback("idle", { trigger });
        }
      } catch (error) {
        if (!mountedRef.current) return;
        if (requestIdRef.current !== requestId || activeRequestIdRef.current !== requestId) return;
        activeAbortControllerRef.current = null;
        activeRequestIdRef.current = null;
        publishStatus("error", { error, trigger });
        const callback = onLoadErrorRef.current;
        if (callback) callback(error);
      }
    },
    [disabled, loadMore, publishStatus]
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (activeAbortControllerRef.current) activeAbortControllerRef.current.abort();
      activeAbortControllerRef.current = null;
      requestIdRef.current += 1;
      activeRequestIdRef.current = null;
      restoreActionFocusRef.current = false;
    };
  }, []);

  useEffect(() => {
    const hadMore = hasMoreRef.current;
    hasMoreRef.current = hasMore;
    if (hadMore && !hasMore) {
      if (activeAbortControllerRef.current) activeAbortControllerRef.current.abort();
      activeAbortControllerRef.current = null;
      requestIdRef.current += 1;
      activeRequestIdRef.current = null;
      restoreActionFocusRef.current = false;
      statusRef.current = "idle";
      // External completion is a committed pagination-generation boundary. Resetting while the
      // complete UI is rendered prevents a prior error/loading state from reviving on re-enable.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("idle");
    }
    const resolvedStatus: InfiniteListStatus = hasMore ? statusRef.current : "complete";
    if (reportedStatusRef.current !== resolvedStatus) {
      reportedStatusRef.current = resolvedStatus;
      // External completion/reopening replaces any request-specific live announcement.
      setAnnouncement(resolvedStatus);
      const callback = onStatusChangeRef.current;
      if (callback) callback(resolvedStatus, {});
    }
  }, [hasMore]);

  const resolvedStatus = hasMore ? status : "complete";

  useEffect(() => {
    if (!restoreActionFocusRef.current) return;
    if (resolvedStatus === "loading") return;
    if (disabled || !hasMore || resolvedStatus === "complete") {
      restoreActionFocusRef.current = false;
      return;
    }
    const actionNode = actionRef.current;
    if (!actionNode) return;
    actionNode.focus();
    restoreActionFocusRef.current = false;
  }, [disabled, hasMore, resolvedStatus]);

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
    let observer: IntersectionObserver | null = null;
    try {
      observer = new IntersectionObserver(
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
    } catch {
      // Some embedded WebViews expose an incomplete observer implementation. The persistent
      // native action is the functional fallback, so observer setup failure must not break mount.
      if (observer) observer.disconnect();
      return undefined;
    }
    return () => {
      if (observer) observer.disconnect();
    };
  }, [autoLoad, disabled, hasMore, requestLoad, resolvedThreshold, status]);

  const manualLoad = useCallback(() => requestLoad("manual"), [requestLoad]);
  const retry = useCallback(() => requestLoad("retry"), [requestLoad]);
  const defaultStatusContent =
    resolvedStatus === "loading" ? (
      <>
        <span
          className={motion === "reduced" ? `${spinner} ${spinnerReduced}` : spinner}
          aria-hidden="true"
        />
        <div>{loadingContent === undefined ? labels.loading : loadingContent}</div>
      </>
    ) : resolvedStatus === "complete" ? (
      <div>{completeContent === undefined ? labels.complete : completeContent}</div>
    ) : resolvedStatus === "error" ? (
      <div className={errorText}>{errorContent === undefined ? labels.error : errorContent}</div>
    ) : null;
  const defaultAction =
    resolvedStatus === "error" ? (
      <button
        ref={actionRef}
        className={action}
        type="button"
        disabled={disabled}
        onClick={() => void retry()}
      >
        {retryLabel || labels.retry}
      </button>
    ) : resolvedStatus === "idle" ? (
      <button
        ref={actionRef}
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
      aria-disabled={disabled ? "true" : undefined}
      data-auto-load={autoLoad ? "true" : "false"}
      data-meu-component="infinite-list"
      data-disabled={disabled ? "true" : undefined}
      data-status={resolvedStatus}
    >
      <VisuallyHidden role="status" aria-live="polite" aria-atomic="true">
        {hasMore && announcement === "loaded"
          ? loadedAnnouncement === undefined
            ? labels.loaded
            : loadedAnnouncement
          : labels[hasMore ? announcement : "complete"]}
      </VisuallyHidden>
      <div className={content}>
        {renderContent ? renderContent(resolvedStatus) : defaultStatusContent}
        {defaultAction}
      </div>
    </div>
  );
}
