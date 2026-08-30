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
import { getConfigBoundaryProps } from "../internal/configBoundary";
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
  captureTarget: HTMLElement | null;
  configurationKey: string;
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
  const height = visualViewport ? visualViewport.height : window.innerHeight;
  return Number.isFinite(height) && height > 0 ? height : 1;
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
    [
      "a",
      "button",
      "input",
      "label",
      "select",
      "textarea",
      "summary",
      "audio[controls]",
      "video[controls]",
      "iframe",
      "[contenteditable]:not([contenteditable='false'])",
      "[tabindex]:not([tabindex='-1'])",
      "[role='button']",
      "[role='checkbox']",
      "[role='combobox']",
      "[role='link']",
      "[role='menuitem']",
      "[role='menuitemcheckbox']",
      "[role='menuitemradio']",
      "[role='option']",
      "[role='radio']",
      "[role='scrollbar']",
      "[role='searchbox']",
      "[role='slider']",
      "[role='spinbutton']",
      "[role='switch']",
      "[role='tab']",
      "[role='textbox']",
      "[role='treeitem']",
      "[data-meu-floating-panel-drag-ignore]"
    ].join(", ")
  );
  return interactive ? interactive !== boundary && boundary.contains(interactive) : false;
}

function releaseDragPointerCapture(session: DragSession) {
  const target = session.captureTarget;
  if (!target) return;
  try {
    if (
      typeof target.hasPointerCapture === "function" &&
      typeof target.releasePointerCapture === "function" &&
      target.hasPointerCapture(session.pointerId)
    ) {
      target.releasePointerCapture(session.pointerId);
    }
  } catch {
    // Pointer capture can already be gone after a browser-level cancellation.
  }
}

/**
 * Renders a persistent modeless panel with draggable height anchors.
 *
 * @public
 */
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
  const suppressHandleClickTimerRef = useRef<number | null>(null);
  const immediateFrameRef = useRef(0);
  const cancelledDragFrameRef = useRef(0);
  const fallbackPointerCleanupRef = useRef<(() => void) | null>(null);
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
  const dragConfigurationKey = `${placement}|${disabled ? 1 : 0}|${dragFromContent ? 1 : 0}|${resolvedAnchors.join(",")}`;
  const effectiveDragging = dragging && !disabled && resolvedAnchors.length > 1;
  const visibleHeight = effectiveDragging && dragHeight !== null ? dragHeight : activeHeight;
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

  const clearFallbackPointerListeners = useCallback(() => {
    if (!fallbackPointerCleanupRef.current) return;
    fallbackPointerCleanupRef.current();
    fallbackPointerCleanupRef.current = null;
  }, []);

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
      if (cancelledDragFrameRef.current) {
        window.cancelAnimationFrame(cancelledDragFrameRef.current);
      }
      if (suppressHandleClickTimerRef.current !== null) {
        window.clearTimeout(suppressHandleClickTimerRef.current);
      }
      clearFallbackPointerListeners();
      dragSessionRef.current = null;
    },
    [clearFallbackPointerListeners]
  );

  useEffect(() => {
    const session = dragSessionRef.current;
    const configurationChanged =
      session !== null && session.configurationKey !== dragConfigurationKey;
    if (!configurationChanged && !disabled && resolvedAnchors.length > 1) return;
    dragSessionRef.current = null;
    if (session) releaseDragPointerCapture(session);
    clearFallbackPointerListeners();
    if (cancelledDragFrameRef.current) {
      window.cancelAnimationFrame(cancelledDragFrameRef.current);
    }
    cancelledDragFrameRef.current = window.requestAnimationFrame(() => {
      cancelledDragFrameRef.current = 0;
      setDragging(false);
      setDragHeight(null);
    });
  }, [clearFallbackPointerListeners, disabled, dragConfigurationKey, resolvedAnchors.length]);

  const requestHeight = useCallback(
    (nextIndex: number, reason: FloatingPanelHeightChangeReason, skipAnimation = false) => {
      const nextHeight = resolvedAnchors[nextIndex];
      if (disabled || nextHeight === undefined || nextIndex === activeIndex) return;
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
    [activeIndex, controlled, disabled, onHeightChange, resolvedAnchors]
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

  const moveDrag = useCallback(
    (
      event: Pick<
        PointerEvent,
        "cancelable" | "clientX" | "clientY" | "pointerId" | "preventDefault"
      >
    ) => {
      const session = dragSessionRef.current;
      if (!session || session.pointerId !== event.pointerId) return;
      if (session.configurationKey !== dragConfigurationKey) {
        dragSessionRef.current = null;
        releaseDragPointerCapture(session);
        clearFallbackPointerListeners();
        setDragging(false);
        setDragHeight(null);
        return;
      }
      const deltaX = event.clientX - session.startX;
      const deltaY = event.clientY - session.startY;
      if (!session.active) {
        if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < DRAG_LOCK_DISTANCE) return;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          dragSessionRef.current = null;
          releaseDragPointerCapture(session);
          clearFallbackPointerListeners();
          return;
        }
        session.active = true;
        setDragging(true);
      }
      if (session.source === "content" && heightDelta(deltaY, placement) <= 0) {
        dragSessionRef.current = null;
        releaseDragPointerCapture(session);
        clearFallbackPointerListeners();
        setDragging(false);
        setDragHeight(null);
        return;
      }
      if (event.cancelable) event.preventDefault();
      setDragHeight(
        clamp(session.startHeight + heightDelta(deltaY, placement), minimumHeight, maximumHeight)
      );
    },
    [clearFallbackPointerListeners, dragConfigurationKey, maximumHeight, minimumHeight, placement]
  );

  const finishDrag = useCallback(
    (event: Pick<PointerEvent, "clientY" | "pointerId" | "timeStamp">, cancelled = false) => {
      const session = dragSessionRef.current;
      if (!session || session.pointerId !== event.pointerId) return;
      dragSessionRef.current = null;
      clearFallbackPointerListeners();
      releaseDragPointerCapture(session);
      setDragging(false);
      setDragHeight(null);
      if (
        !session.active ||
        cancelled ||
        disabled ||
        session.configurationKey !== dragConfigurationKey
      ) {
        return;
      }
      if (session.source === "handle") {
        suppressHandleClickRef.current = true;
        if (suppressHandleClickTimerRef.current !== null) {
          window.clearTimeout(suppressHandleClickTimerRef.current);
        }
        suppressHandleClickTimerRef.current = window.setTimeout(() => {
          suppressHandleClickTimerRef.current = null;
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
    [
      disabled,
      clearFallbackPointerListeners,
      dragConfigurationKey,
      maximumHeight,
      minimumHeight,
      normalizedInertia,
      placement,
      requestHeight,
      resolvedAnchors
    ]
  );

  const beginDrag = useCallback(
    (event: ReactPointerEvent<HTMLElement>, source: DragSession["source"]) => {
      if (disabled || event.button !== 0 || !event.isPrimary || resolvedAnchors.length < 2) return;
      if (source === "content") {
        if (!canDragFromContent || isInteractiveContent(event.target, bodyRef.current)) return;
      }
      clearFallbackPointerListeners();
      if (cancelledDragFrameRef.current) {
        window.cancelAnimationFrame(cancelledDragFrameRef.current);
        cancelledDragFrameRef.current = 0;
      }
      setDragging(false);
      setDragHeight(null);
      dragSessionRef.current = {
        active: false,
        captureTarget: null,
        configurationKey: dragConfigurationKey,
        pointerId: event.pointerId,
        source,
        startHeight: activeHeight,
        startIndex: activeIndex,
        startTime: event.timeStamp,
        startX: event.clientX,
        startY: event.clientY
      };
      let captured = false;
      if (typeof event.currentTarget.setPointerCapture === "function") {
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
          dragSessionRef.current.captureTarget = event.currentTarget;
          captured =
            typeof event.currentTarget.hasPointerCapture !== "function" ||
            event.currentTarget.hasPointerCapture(event.pointerId);
        } catch {
          captured = false;
        }
      }
      if (captured) return;

      const move = (pointerEvent: PointerEvent) => moveDrag(pointerEvent);
      const finish = (pointerEvent: PointerEvent) => finishDrag(pointerEvent);
      const cancel = (pointerEvent: PointerEvent) => finishDrag(pointerEvent, true);
      window.addEventListener("pointermove", move, { passive: false });
      window.addEventListener("pointerup", finish);
      window.addEventListener("pointercancel", cancel);
      fallbackPointerCleanupRef.current = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", finish);
        window.removeEventListener("pointercancel", cancel);
      };
    },
    [
      activeHeight,
      activeIndex,
      canDragFromContent,
      clearFallbackPointerListeners,
      disabled,
      dragConfigurationKey,
      finishDrag,
      moveDrag,
      resolvedAnchors.length
    ]
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
      disabled={disabled || resolvedAnchors.length < 2}
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
      onLostPointerCapture={(event) => finishDrag(event, true)}
      onPointerCancel={(event) => finishDrag(event, true)}
      onPointerDown={(event) => beginDrag(event, "handle")}
      onPointerMove={moveDrag}
      onPointerUp={finishDrag}
    />
  );
  const statusText =
    config.locale === "en-US"
      ? `${Math.round(activeHeight)} px, position ${activeIndex + 1} of ${Math.max(1, resolvedAnchors.length)}`
      : `${Math.round(activeHeight)} px，位置 ${activeIndex + 1}/${Math.max(1, resolvedAnchors.length)}`;
  const panelStyle = {
    ...style,
    "--meu-floating-panel-translate": `${translate}px`,
    height: maximumHeight > 0 ? `${maximumHeight}px` : "50vh"
  } as FloatingPanelStyle;
  const configBoundary = getConfigBoundaryProps(config);

  return (
    <div
      {...props}
      {...configBoundary}
      ref={rootRef}
      className={[panel({ placement, safeArea }), configBoundary.className, className]
        .filter(Boolean)
        .join(" ")}
      style={panelStyle}
      data-anchor-index={activeIndex}
      data-current-height={Math.round(activeHeight * 1000) / 1000}
      data-disabled={disabled ? "true" : undefined}
      data-dragging={effectiveDragging ? "true" : undefined}
      data-immediate={immediate ? "true" : undefined}
      data-meu-component="floating-panel"
      data-measured={availableHeight > 0 ? "true" : "false"}
      data-placement={placement}
    >
      {placement === "bottom" ? handleButton : null}
      <div
        ref={bodyRef}
        id={bodyId}
        className={body}
        role="region"
        aria-label={config.locale === "en-US" ? "Floating panel content" : "浮动面板内容"}
        tabIndex={0}
        data-content-drag={canDragFromContent ? "true" : undefined}
        data-content-dragging={effectiveDragging ? "true" : undefined}
        onLostPointerCapture={(event) => finishDrag(event, true)}
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
