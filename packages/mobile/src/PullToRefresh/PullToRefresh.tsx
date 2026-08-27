"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, Ref } from "react";

import { useMeuConfig } from "../ConfigProvider";
import { content, indicator, keyboardAction, motion, root } from "./PullToRefresh.css";
import type {
  PullToRefreshProps,
  PullToRefreshStatus,
  PullToRefreshStatusChangeDetails,
  PullToRefreshTrigger
} from "./types";

type PullSession = { active: boolean; startX: number; startY: number };

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

function positiveNumber(value: number, fallback: number) {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function normalizedResistance(value: number) {
  return Number.isFinite(value) ? Math.max(0.1, Math.min(1, value)) : 0.45;
}

function isScrollable(node: HTMLElement) {
  const style = window.getComputedStyle(node);
  return /(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight;
}

function defaultCanPull(rootNode: HTMLElement) {
  let current = rootNode.parentElement;
  while (current && current !== document.body && current !== document.documentElement) {
    if (isScrollable(current)) return current.scrollTop <= 0;
    current = current.parentElement;
  }
  const scrollingElement = document.scrollingElement || document.documentElement;
  return scrollingElement.scrollTop <= 0;
}

export function PullToRefresh({
  actionLabel,
  canPull,
  children,
  className,
  completeDelay = 500,
  disabled = false,
  maxPullDistance = 120,
  onRefresh,
  onRefreshError,
  onStatusChange,
  ref,
  renderIndicator,
  resistance = 0.45,
  style,
  threshold = 64,
  ...props
}: PullToRefreshProps) {
  const config = useMeuConfig();
  const generatedId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<PullSession | null>(null);
  const completeTimerRef = useRef<number | null>(null);
  const mountedRef = useRef(true);
  const statusRef = useRef<PullToRefreshStatus>("idle");
  const [distance, setDistance] = useState(0);
  const [status, setStatus] = useState<PullToRefreshStatus>("idle");
  const resolvedThreshold = positiveNumber(threshold, 64);
  const resolvedMaximum = Math.max(
    resolvedThreshold,
    positiveNumber(maxPullDistance, resolvedThreshold * 1.875)
  );
  const resolvedResistance = normalizedResistance(resistance);
  const resolvedCompleteDelay = Math.max(0, Number.isFinite(completeDelay) ? completeDelay : 500);
  const contentId = `meu-pull-to-refresh-content-${generatedId}`;
  const localizedActionLabel =
    actionLabel || (config.locale === "en-US" ? "Refresh content" : "刷新内容");

  const publishStatus = useCallback(
    (nextStatus: PullToRefreshStatus, nextDistance: number, trigger?: PullToRefreshTrigger) => {
      if (statusRef.current === nextStatus) return;
      statusRef.current = nextStatus;
      setStatus(nextStatus);
      if (onStatusChange) {
        const details: PullToRefreshStatusChangeDetails = {
          distance: nextDistance,
          status: nextStatus,
          ...(trigger ? { trigger } : {})
        };
        onStatusChange(nextStatus, details);
      }
    },
    [onStatusChange]
  );

  const reset = useCallback(() => {
    setDistance(0);
    publishStatus("idle", 0);
  }, [publishStatus]);

  const beginRefresh = useCallback(
    async (trigger: PullToRefreshTrigger) => {
      if (disabled || statusRef.current === "refreshing") return;
      if (completeTimerRef.current !== null) {
        window.clearTimeout(completeTimerRef.current);
        completeTimerRef.current = null;
      }
      setDistance(resolvedThreshold);
      publishStatus("refreshing", resolvedThreshold, trigger);
      try {
        await onRefresh();
        if (!mountedRef.current) return;
        publishStatus("complete", resolvedThreshold, trigger);
        completeTimerRef.current = window.setTimeout(() => {
          completeTimerRef.current = null;
          if (mountedRef.current) reset();
        }, resolvedCompleteDelay);
      } catch (error) {
        if (!mountedRef.current) return;
        if (onRefreshError) onRefreshError(error);
        reset();
      }
    },
    [
      disabled,
      onRefresh,
      onRefreshError,
      publishStatus,
      reset,
      resolvedCompleteDelay,
      resolvedThreshold
    ]
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (completeTimerRef.current !== null) window.clearTimeout(completeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return undefined;

    const finish = (cancelled: boolean) => {
      const session = sessionRef.current;
      sessionRef.current = null;
      if (!session || !session.active) return;
      if (!cancelled && statusRef.current === "ready") void beginRefresh("pull");
      else reset();
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (disabled || statusRef.current !== "idle" || event.touches.length !== 1) return;
      const touch = event.touches[0];
      if (!touch) return;
      const allowed = canPull ? canPull() : defaultCanPull(node);
      if (!allowed) return;
      sessionRef.current = { active: false, startX: touch.clientX, startY: touch.clientY };
    };

    const handleTouchMove = (event: TouchEvent) => {
      const session = sessionRef.current;
      const touch = event.touches[0];
      if (!session || !touch || event.touches.length !== 1) return;
      const deltaX = touch.clientX - session.startX;
      const deltaY = touch.clientY - session.startY;
      if (!session.active && Math.abs(deltaX) > Math.abs(deltaY)) {
        sessionRef.current = null;
        return;
      }
      if (deltaY <= 0) {
        if (session.active) reset();
        return;
      }
      if (deltaY < 4) return;
      session.active = true;
      event.preventDefault();
      const nextDistance = Math.min(resolvedMaximum, deltaY * resolvedResistance);
      setDistance(nextDistance);
      publishStatus(nextDistance >= resolvedThreshold ? "ready" : "pulling", nextDistance, "pull");
    };

    const handleTouchEnd = () => finish(false);
    const handleTouchCancel = () => finish(true);
    node.addEventListener("touchstart", handleTouchStart, { passive: true });
    node.addEventListener("touchmove", handleTouchMove, { passive: false });
    node.addEventListener("touchend", handleTouchEnd);
    node.addEventListener("touchcancel", handleTouchCancel);
    return () => {
      node.removeEventListener("touchstart", handleTouchStart);
      node.removeEventListener("touchmove", handleTouchMove);
      node.removeEventListener("touchend", handleTouchEnd);
      node.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [
    beginRefresh,
    canPull,
    disabled,
    publishStatus,
    reset,
    resolvedMaximum,
    resolvedResistance,
    resolvedThreshold
  ]);

  const defaultIndicator =
    status === "ready"
      ? config.locale === "en-US"
        ? "Release to refresh"
        : "松开刷新"
      : status === "refreshing"
        ? config.locale === "en-US"
          ? "Refreshing…"
          : "刷新中…"
        : status === "complete"
          ? config.locale === "en-US"
            ? "Refresh complete"
            : "刷新完成"
          : config.locale === "en-US"
            ? "Pull to refresh"
            : "下拉刷新";
  const indicatorContent = renderIndicator
    ? renderIndicator(status, { distance, threshold: resolvedThreshold })
    : defaultIndicator;
  const rootStyle = {
    ...style,
    "--meu-pull-to-refresh-distance": `${distance}px`,
    "--meu-pull-to-refresh-threshold": `${resolvedThreshold}px`
  } as CSSProperties;
  const draggingNow = status === "pulling" || status === "ready";

  return (
    <div
      {...props}
      ref={(node) => {
        rootRef.current = node;
        assignRef(ref, node);
      }}
      className={className ? `${root} ${className}` : root}
      style={rootStyle}
      aria-busy={status === "refreshing" ? "true" : undefined}
      data-dragging={draggingNow ? "true" : "false"}
      data-meu-component="pull-to-refresh"
      data-pull-distance={Math.round(distance)}
      data-status={status}
    >
      <button
        className={keyboardAction}
        type="button"
        aria-controls={contentId}
        disabled={disabled || status === "refreshing"}
        onClick={() => void beginRefresh("keyboard")}
      >
        {localizedActionLabel}
      </button>
      <div className={`${indicator} ${motion}`} role="status" aria-live="polite">
        {indicatorContent}
      </div>
      <div className={`${content} ${motion}`} id={contentId} aria-busy={status === "refreshing"}>
        {children}
      </div>
    </div>
  );
}
