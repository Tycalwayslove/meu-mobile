"use client";

import {
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";

import { useMeuConfig } from "../ConfigProvider";
import { VisuallyHidden } from "../internal/VisuallyHidden";
import { body, handle, panel } from "./FloatingPanel.css";
import type {
  FloatingPanelHeightChangeReason,
  FloatingPanelPlacement,
  FloatingPanelProps
} from "./types";

const MINIMUM_ANCHOR = 44;
const DRAG_LOCK_DISTANCE = 6;

type FloatingPanelStyle = CSSProperties & { "--meu-floating-panel-translate"?: string };

type DragSession = {
  active: boolean;
  pointerId: number;
  source: "content" | "handle";
  startHeight: number;
  startIndex: number;
  startTime: number;
  startX: number;
  startY: number;
};

function viewportHeight() {
  if (typeof window === "undefined") return 0;
  const visualViewport = window.visualViewport;
  return Math.max(1, visualViewport ? visualViewport.height : window.innerHeight);
}

function normalizeAnchors(anchors: ReadonlyArray<number>, availableHeight: number) {
  if (availableHeight <= 0) return [];
  const minimum = Math.min(MINIMUM_ANCHOR, availableHeight);
  const normalized = anchors
    .filter((anchor) => Number.isFinite(anchor) && anchor > 0)
    .map((anchor) => Math.min(availableHeight, Math.max(minimum, anchor)))
    .sort((left, right) => left - right)
    .filter((anchor, index, source) => index === 0 || Math.abs(anchor - source[index - 1]!) >= 1);
  if (normalized.length > 0) return normalized;
  return [Math.max(minimum, availableHeight * 0.5)];
}

function nearestAnchorIndex(anchors: ReadonlyArray<number>, requested: number | undefined) {
  if (anchors.length === 0) return 0;
  if (requested === undefined || !Number.isFinite(requested)) return 0;
  let nearestIndex = 0;
  anchors.forEach((anchor, index) => {
    if (Math.abs(anchor - requested) < Math.abs(anchors[nearestIndex]! - requested)) {
      nearestIndex = index;
    }
  });
  return nearestIndex;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function heightDelta(deltaY: number, placement: FloatingPanelPlacement) {
  return placement === "bottom" ? -deltaY : deltaY;
}

function isInteractiveContent(target: EventTarget | null, boundary: HTMLElement | null) {
  if (!(target instanceof Element) || !boundary) return false;
  const interactive = target.closest(
    "a, button, input, select, textarea, summary, [contenteditable='true'], [role='button'], [role='link']"
  );
  return interactive ? boundary.contains(interactive) : false;
}

export function FloatingPanel({
  anchors,
  children,
  className,
  defaultHeight,
  disabled = false,
  dragFromContent = true,
  handleLabel,
  height,
  inertiaFactor = 50,
  onHeightChange,
  placement = "bottom",
  ref,
  safeArea = true,
  style,
  ...props
}: FloatingPanelProps) {
  const config = useMeuConfig();
  const bodyId = `meu-floating-panel-body-${useId()}`;
  const statusId = `meu-floating-panel-status-${useId()}`;
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const dragSessionRef = useRef<DragSession | null>(null);
  const suppressHandleClickRef = useRef(false);
  const immediateFrameRef = useRef(0);
  const [availableHeight, setAvailableHeight] = useState(0);
  const [uncontrolledHeight, setUncontrolledHeight] = useState(defaultHeight);
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [immediate, setImmediate] = useState(false);
  const resolvedAnchors = useMemo(
    () => normalizeAnchors(anchors, availableHeight),
    [anchors, availableHeight]
  );
  const controlled = height !== undefined;
  const requestedHeight = controlled ? height : uncontrolledHeight;
  const activeIndex = nearestAnchorIndex(resolvedAnchors, requestedHeight);
  const activeHeight = resolvedAnchors[activeIndex] || 0;
  const minimumHeight = resolvedAnchors[0] || 0;
  const maximumHeight = resolvedAnchors[resolvedAnchors.length - 1] || 0;
  const visibleHeight = dragHeight === null ? activeHeight : dragHeight;
  const translate = Math.max(0, maximumHeight - visibleHeight) * (placement === "top" ? -1 : 1);
  const normalizedInertia = Number.isFinite(inertiaFactor)
    ? Math.min(200, Math.max(0, inertiaFactor))
    : 50;
  const canDragFromContent =
    dragFromContent &&
    !disabled &&
    resolvedAnchors.length > 1 &&
    activeIndex < resolvedAnchors.length - 1;
  const localizedHandleLabel =
    handleLabel ||
    (config.locale === "en-US" ? "Adjust floating panel height" : "调整浮动面板高度");

  useEffect(() => {
    const update = () => setAvailableHeight(viewportHeight());
    update();
    window.addEventListener("resize", update);
    const visualViewport = window.visualViewport;
    if (visualViewport) visualViewport.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      if (visualViewport) visualViewport.removeEventListener("resize", update);
    };
  }, []);

  useEffect(
    () => () => {
      if (immediateFrameRef.current) window.cancelAnimationFrame(immediateFrameRef.current);
    },
    []
  );

  const requestHeight = useCallback(
    (nextIndex: number, reason: FloatingPanelHeightChangeReason, skipAnimation = false) => {
      const nextHeight = resolvedAnchors[nextIndex];
      if (nextHeight === undefined || nextIndex === activeIndex) return;
      if (skipAnimation) {
        setImmediate(true);
        if (immediateFrameRef.current) window.cancelAnimationFrame(immediateFrameRef.current);
        immediateFrameRef.current = window.requestAnimationFrame(() => {
          immediateFrameRef.current = 0;
          setImmediate(false);
        });
      }
      if (!controlled) setUncontrolledHeight(nextHeight);
      if (onHeightChange) onHeightChange(nextHeight, { index: nextIndex, reason });
    },
    [activeIndex, controlled, onHeightChange, resolvedAnchors]
  );

  useImperativeHandle(
    ref,
    () => ({
      nativeElement: rootRef.current,
      setHeight(nextHeight, options) {
        requestHeight(
          nearestAnchorIndex(resolvedAnchors, nextHeight),
          "imperative",
          Boolean(options && options.immediate)
        );
      }
    }),
    [requestHeight, resolvedAnchors]
  );

  const beginDrag = useCallback(
    (event: ReactPointerEvent<HTMLElement>, source: DragSession["source"]) => {
      if (disabled || event.button !== 0 || !event.isPrimary || resolvedAnchors.length < 2) return;
      if (source === "content") {
        if (!canDragFromContent || isInteractiveContent(event.target, bodyRef.current)) return;
      }
      dragSessionRef.current = {
        active: false,
        pointerId: event.pointerId,
        source,
        startHeight: activeHeight,
        startIndex: activeIndex,
        startTime: event.timeStamp,
        startX: event.clientX,
        startY: event.clientY
      };
      if (typeof event.currentTarget.setPointerCapture === "function") {
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // Some WebViews expose Pointer Events without pointer-capture support.
        }
      }
    },
    [activeHeight, activeIndex, canDragFromContent, disabled, resolvedAnchors.length]
  );

  const moveDrag = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const session = dragSessionRef.current;
      if (!session || session.pointerId !== event.pointerId) return;
      const deltaX = event.clientX - session.startX;
      const deltaY = event.clientY - session.startY;
      if (!session.active) {
        if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < DRAG_LOCK_DISTANCE) return;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          dragSessionRef.current = null;
          return;
        }
        session.active = true;
        setDragging(true);
      }
      if (event.cancelable) event.preventDefault();
      setDragHeight(
        clamp(session.startHeight + heightDelta(deltaY, placement), minimumHeight, maximumHeight)
      );
    },
    [maximumHeight, minimumHeight, placement]
  );

  const finishDrag = useCallback(
    (event: ReactPointerEvent<HTMLElement>, cancelled = false) => {
      const session = dragSessionRef.current;
      if (!session || session.pointerId !== event.pointerId) return;
      dragSessionRef.current = null;
      if (
        typeof event.currentTarget.hasPointerCapture === "function" &&
        event.currentTarget.hasPointerCapture(event.pointerId)
      ) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      setDragging(false);
      setDragHeight(null);
      if (!session.active || cancelled) return;
      if (session.source === "handle") {
        suppressHandleClickRef.current = true;
        window.setTimeout(() => {
          suppressHandleClickRef.current = false;
        }, 0);
      }
      const deltaY = event.clientY - session.startY;
      const elapsed = Math.max(1, event.timeStamp - session.startTime);
      const releasedHeight = clamp(
        session.startHeight + heightDelta(deltaY, placement),
        minimumHeight,
        maximumHeight
      );
      const velocity = heightDelta(deltaY, placement) / elapsed;
      const projectedHeight = clamp(
        releasedHeight + velocity * normalizedInertia,
        minimumHeight,
        maximumHeight
      );
      let nextIndex = nearestAnchorIndex(resolvedAnchors, projectedHeight);
      if (velocity > 0.5 && session.startIndex < resolvedAnchors.length - 1) {
        nextIndex = Math.max(nextIndex, session.startIndex + 1);
      } else if (velocity < -0.5 && session.startIndex > 0) {
        nextIndex = Math.min(nextIndex, session.startIndex - 1);
      }
      requestHeight(nextIndex, "drag");
    },
    [maximumHeight, minimumHeight, normalizedInertia, placement, requestHeight, resolvedAnchors]
  );

  const moveBy = useCallback(
    (change: number) => {
      requestHeight(clamp(activeIndex + change, 0, resolvedAnchors.length - 1), "keyboard");
    },
    [activeIndex, requestHeight, resolvedAnchors.length]
  );

  const handleButton = (
    <button
      className={handle}
      type="button"
      aria-controls={bodyId}
      aria-describedby={statusId}
      aria-expanded={activeIndex === resolvedAnchors.length - 1}
      aria-label={localizedHandleLabel}
      disabled={disabled}
      onClick={() => {
        if (suppressHandleClickRef.current || disabled || resolvedAnchors.length < 2) return;
        requestHeight((activeIndex + 1) % resolvedAnchors.length, "handle");
      }}
      onKeyDown={(event) => {
        let handled = true;
        if (event.key === "Home") requestHeight(0, "keyboard");
        else if (event.key === "End") requestHeight(resolvedAnchors.length - 1, "keyboard");
        else if (event.key === "ArrowUp" || event.key === "PageUp") {
          moveBy(placement === "bottom" ? 1 : -1);
        } else if (event.key === "ArrowDown" || event.key === "PageDown") {
          moveBy(placement === "bottom" ? -1 : 1);
        } else handled = false;
        if (handled) event.preventDefault();
      }}
      onPointerCancel={(event) => finishDrag(event, true)}
      onPointerDown={(event) => beginDrag(event, "handle")}
      onPointerMove={moveDrag}
      onPointerUp={finishDrag}
    />
  );
  const statusText = `${Math.round(activeHeight)} px，位置 ${activeIndex + 1}/${Math.max(
    1,
    resolvedAnchors.length
  )}`;
  const panelStyle = {
    ...style,
    "--meu-floating-panel-translate": `${translate}px`,
    height: maximumHeight > 0 ? `${maximumHeight}px` : "50vh"
  } as FloatingPanelStyle;

  return (
    <div
      {...props}
      ref={rootRef}
      className={
        className
          ? `${panel({ placement, safeArea })} ${className}`
          : panel({ placement, safeArea })
      }
      style={panelStyle}
      lang={config.locale}
      data-anchor-index={activeIndex}
      data-current-height={Math.round(activeHeight * 1000) / 1000}
      data-disabled={disabled ? "true" : undefined}
      data-dragging={dragging ? "true" : undefined}
      data-immediate={immediate ? "true" : undefined}
      data-meu-component="floating-panel"
      data-meu-theme={config.theme}
      data-measured={availableHeight > 0 ? "true" : "false"}
      data-placement={placement}
    >
      {placement === "bottom" ? handleButton : null}
      <div
        ref={bodyRef}
        id={bodyId}
        className={body}
        data-content-drag={canDragFromContent ? "true" : undefined}
        data-content-dragging={dragging ? "true" : undefined}
        onPointerCancel={(event) => finishDrag(event, true)}
        onPointerDown={(event) => beginDrag(event, "content")}
        onPointerMove={moveDrag}
        onPointerUp={finishDrag}
      >
        {children}
      </div>
      {placement === "top" ? handleButton : null}
      <VisuallyHidden id={statusId} aria-live="polite">
        {statusText}
      </VisuallyHidden>
    </div>
  );
}
