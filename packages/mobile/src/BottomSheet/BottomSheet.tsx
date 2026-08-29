"use client";

import { MeuIconX } from "@meu/icons-react";
import { Portal, useBodyScrollLock, useFocusTrap } from "@meu/primitives-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent, Ref, RefObject } from "react";

import { useMeuConfig } from "../ConfigProvider";
import { VisuallyHidden } from "../internal/VisuallyHidden";
import { useControllableOpen } from "../internal/useControllableOpen";
import { getConfigBoundaryProps } from "../internal/configBoundary";
import { useOverlayPresence } from "../internal/useOverlayPresence";
import { Mask } from "../Mask";
import {
  body,
  closeButton,
  content as contentClass,
  dragHandle as dragHandleClass,
  header,
  layer,
  panel,
  title as titleClass
} from "./BottomSheet.css";
import type { BottomSheetProps, BottomSheetSnapChangeReason, BottomSheetSnapPoint } from "./types";

type ResolvedSnapPoint = {
  height: number;
  value: BottomSheetSnapPoint;
};

type DragSession = {
  moved: boolean;
  pointerId: number;
  startHeight: number;
  startTime: number;
  startY: number;
  target: HTMLButtonElement;
};

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

function pointHeight(point: BottomSheetSnapPoint, viewportHeight: number, contentHeight: number) {
  const maximum = viewportHeight * 0.9;
  if (point === "content") {
    const measured = contentHeight > 0 ? contentHeight : viewportHeight * 0.5;
    return Math.min(measured, maximum);
  }
  if (!Number.isFinite(point) || point <= 0 || point > 1) return null;
  return Math.min(point * viewportHeight, maximum);
}

function normalizeSnapPoints(
  points: ReadonlyArray<BottomSheetSnapPoint>,
  viewportHeight: number,
  contentHeight: number
) {
  if (viewportHeight <= 0) return [];
  const source = points.length > 0 ? points : (["content"] as const);
  const resolved: ResolvedSnapPoint[] = [];
  source.forEach((value) => {
    const height = pointHeight(value, viewportHeight, contentHeight);
    if (height === null || height < 1) return;
    const duplicate = resolved.some((entry) => Math.abs(entry.height - height) < 1);
    if (!duplicate) resolved.push({ height, value });
  });
  if (resolved.length === 0) {
    resolved.push({ height: viewportHeight * 0.5, value: "content" });
  }
  return resolved.sort((left, right) => left.height - right.height);
}

function findPointIndex(
  points: ResolvedSnapPoint[],
  requested: BottomSheetSnapPoint | undefined,
  viewportHeight: number,
  contentHeight: number
) {
  if (points.length === 0) return 0;
  if (requested === undefined) return points.length - 1;
  const exact = points.findIndex((point) => point.value === requested);
  if (exact >= 0) return exact;
  const requestedHeight = pointHeight(requested, viewportHeight, contentHeight);
  if (requestedHeight === null) return points.length - 1;
  let closestIndex = 0;
  points.forEach((point, index) => {
    if (
      Math.abs(point.height - requestedHeight) <
      Math.abs(points[closestIndex]!.height - requestedHeight)
    ) {
      closestIndex = index;
    }
  });
  return closestIndex;
}

function snapPointText(
  point: BottomSheetSnapPoint,
  index: number,
  total: number,
  locale: "en-US" | "zh-CN"
) {
  if (locale === "en-US") {
    const value = point === "content" ? "Content height" : `${Math.round(point * 100)}%`;
    return `${value}, position ${index + 1} of ${total}`;
  }
  if (point === "content") return `内容高度，位置 ${index + 1}/${total}`;
  return `${Math.round(point * 100)}%，位置 ${index + 1}/${total}`;
}

/**
 * Renders a modal bottom sheet with draggable snap points.
 *
 * @public
 */
export function BottomSheet({
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  children,
  className,
  closeLabel,
  closeOnEscape = true,
  closeOnMaskClick = false,
  container,
  defaultOpen = false,
  defaultSnapPoint,
  dragHandle = true,
  dragHandleLabel,
  dragToDismiss = true,
  forceMount = false,
  initialFocusRef,
  lockScroll = true,
  maskOpacity = "default",
  onOpenChange,
  onSnapPointChange,
  open,
  ref,
  restoreFocus = true,
  returnFocusRef,
  safeArea = true,
  showCloseButton = false,
  snapPoint,
  snapPoints = ["content"],
  style,
  title,
  ...props
}: BottomSheetProps) {
  const config = useMeuConfig();
  const generatedId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dragSessionRef = useRef<DragSession | null>(null);
  const suppressHandleClickRef = useRef(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [bodyScrollable, setBodyScrollable] = useState(false);
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const [uncontrolledSnapPoint, setUncontrolledSnapPoint] = useState<
    BottomSheetSnapPoint | undefined
  >(defaultSnapPoint);
  const [resolvedOpen, requestOpenChange] = useControllableOpen({
    defaultOpen,
    onOpenChange,
    open
  });
  const { hidden, shouldRender, visualState } = useOverlayPresence(resolvedOpen, forceMount);
  const resolvedSnapPoints = useMemo(
    () => normalizeSnapPoints(snapPoints, viewportHeight, contentHeight),
    [contentHeight, snapPoints, viewportHeight]
  );
  const controlledSnap = snapPoint !== undefined;
  const requestedSnapPoint = controlledSnap ? snapPoint : uncontrolledSnapPoint;
  const activeIndex = findPointIndex(
    resolvedSnapPoints,
    requestedSnapPoint,
    viewportHeight,
    contentHeight
  );
  const activePoint = resolvedSnapPoints[activeIndex];
  const minimumHeight = resolvedSnapPoints[0] ? resolvedSnapPoints[0].height : 0;
  const maximumHeight = resolvedSnapPoints[resolvedSnapPoints.length - 1]
    ? resolvedSnapPoints[resolvedSnapPoints.length - 1]!.height
    : 0;
  const visibleHeight = dragHeight === null ? (activePoint ? activePoint.height : 0) : dragHeight;
  const offset = Math.max(0, maximumHeight - visibleHeight);
  const titleId = `meu-bottom-sheet-title-${generatedId}`;
  const statusId = `meu-bottom-sheet-status-${generatedId}`;
  const localizedCloseLabel = closeLabel || (config.locale === "en-US" ? "Close" : "关闭");
  const localizedHandleLabel =
    dragHandleLabel || (config.locale === "en-US" ? "Adjust sheet height" : "调整面板高度");
  const localizedBodyLabel = config.locale === "en-US" ? "Scrollable content" : "可滚动内容";
  const hasTitle = title !== undefined && title !== null;
  const resolvedLabelledby = ariaLabelledby || (!ariaLabel && hasTitle ? titleId : undefined);
  const portalContainer = container === undefined ? config.portalContainer : container;
  const focusTrapRef = useMemo<RefObject<HTMLElement | null>>(() => {
    // A changed Portal destination remounts the panel. Rebinding the trap prevents it from
    // retaining the detached panel that belonged to the previous container.
    void portalContainer;
    return {
      get current() {
        return panelRef.current;
      }
    };
  }, [portalContainer]);
  const configBoundary = getConfigBoundaryProps(config);

  useBodyScrollLock(resolvedOpen && lockScroll);
  useFocusTrap({
    active: resolvedOpen,
    containerRef: focusTrapRef,
    initialFocusRef,
    onEscape: closeOnEscape ? () => requestOpenChange(false, { reason: "escape" }) : undefined,
    restoreFocus,
    returnFocusRef
  });

  useEffect(() => {
    if (controlledSnap || !activePoint || uncontrolledSnapPoint === activePoint.value) return;
    setUncontrolledSnapPoint(activePoint.value);
  }, [activePoint, controlledSnap, uncontrolledSnapPoint]);

  useEffect(() => {
    if (resolvedOpen) return;
    const session = dragSessionRef.current;
    dragSessionRef.current = null;
    if (session && session.target.hasPointerCapture(session.pointerId)) {
      session.target.releasePointerCapture(session.pointerId);
    }
    suppressHandleClickRef.current = false;
    if (dragHeight !== null) setDragHeight(null);
  }, [dragHeight, resolvedOpen]);

  useEffect(
    () => () => {
      const session = dragSessionRef.current;
      dragSessionRef.current = null;
      if (session && session.target.hasPointerCapture(session.pointerId)) {
        session.target.releasePointerCapture(session.pointerId);
      }
      suppressHandleClickRef.current = false;
    },
    []
  );

  useEffect(() => {
    if (!shouldRender) return undefined;
    const updateViewport = () => {
      const visualViewport = window.visualViewport;
      setViewportHeight(visualViewport ? visualViewport.height : window.innerHeight);
    };
    updateViewport();
    window.addEventListener("resize", updateViewport);
    const visualViewport = window.visualViewport;
    if (visualViewport) visualViewport.addEventListener("resize", updateViewport);
    return () => {
      window.removeEventListener("resize", updateViewport);
      if (visualViewport) visualViewport.removeEventListener("resize", updateViewport);
    };
  }, [shouldRender]);

  useEffect(() => {
    if (!shouldRender) return undefined;
    const measure = () => {
      const panelNode = panelRef.current;
      const bodyNode = bodyRef.current;
      const contentNode = contentRef.current;
      if (!panelNode || !bodyNode || !contentNode) return;
      const fixedHeight = panelNode.scrollHeight - bodyNode.clientHeight;
      setContentHeight(Math.max(1, fixedHeight + contentNode.scrollHeight));
      setBodyScrollable(bodyNode.scrollHeight > bodyNode.clientHeight + 1);
    };
    const frame = window.requestAnimationFrame(measure);
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && bodyRef.current) {
      observer = new ResizeObserver(measure);
      observer.observe(bodyRef.current);
      if (contentRef.current) observer.observe(contentRef.current);
    }
    return () => {
      window.cancelAnimationFrame(frame);
      if (observer) observer.disconnect();
    };
  }, [children, dragHandle, shouldRender, showCloseButton, title, viewportHeight]);

  const requestSnapPoint = useCallback(
    (nextIndex: number, reason: BottomSheetSnapChangeReason) => {
      const nextPoint = resolvedSnapPoints[nextIndex];
      if (!nextPoint || nextIndex === activeIndex) return;
      if (!controlledSnap) setUncontrolledSnapPoint(nextPoint.value);
      if (onSnapPointChange) {
        onSnapPointChange(nextPoint.value, { index: nextIndex, reason });
      }
    },
    [activeIndex, controlledSnap, onSnapPointChange, resolvedSnapPoints]
  );

  const finishDrag = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>, cancelled = false) => {
      const session = dragSessionRef.current;
      if (!session || session.pointerId !== event.pointerId) return;
      dragSessionRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      const elapsed = Math.max(1, event.timeStamp - session.startTime);
      const downwardVelocity = (event.clientY - session.startY) / elapsed;
      const releasedHeight = Math.max(
        0,
        Math.min(maximumHeight, session.startHeight - (event.clientY - session.startY))
      );
      setDragHeight(null);
      suppressHandleClickRef.current = cancelled ? false : session.moved;
      if (!cancelled && session.moved) {
        window.setTimeout(() => {
          suppressHandleClickRef.current = false;
        }, 0);
      }
      if (cancelled || resolvedSnapPoints.length === 0) return;
      if (
        dragToDismiss &&
        (releasedHeight < minimumHeight * 0.65 ||
          (downwardVelocity > 0.8 && releasedHeight <= minimumHeight))
      ) {
        requestOpenChange(false, { reason: "drag" });
        return;
      }
      let nextIndex = 0;
      resolvedSnapPoints.forEach((point, index) => {
        if (
          Math.abs(point.height - releasedHeight) <
          Math.abs(resolvedSnapPoints[nextIndex]!.height - releasedHeight)
        ) {
          nextIndex = index;
        }
      });
      if (downwardVelocity > 0.5 && activeIndex > 0) {
        nextIndex = Math.min(nextIndex, activeIndex - 1);
      } else if (downwardVelocity < -0.5 && activeIndex < resolvedSnapPoints.length - 1) {
        nextIndex = Math.max(nextIndex, activeIndex + 1);
      }
      requestSnapPoint(nextIndex, "drag");
    },
    [
      activeIndex,
      dragToDismiss,
      maximumHeight,
      minimumHeight,
      requestOpenChange,
      requestSnapPoint,
      resolvedSnapPoints
    ]
  );

  if (!shouldRender) return null;

  const panelStyle = {
    ...style,
    "--meu-bottom-sheet-offset": `${offset}px`,
    height: maximumHeight > 0 ? `${maximumHeight}px` : "50vh"
  } as CSSProperties;
  const statusText = activePoint
    ? snapPointText(activePoint.value, activeIndex, resolvedSnapPoints.length, config.locale)
    : "";

  return (
    <Portal container={portalContainer}>
      <div
        {...configBoundary}
        className={`${layer({ state: visualState })} ${configBoundary.className}`}
        hidden={hidden}
        inert={!resolvedOpen}
        aria-hidden={resolvedOpen ? undefined : "true"}
        data-meu-overlay-layer="bottom-sheet"
        data-state={visualState}
      >
        <Mask
          container={null}
          dismissible={closeOnMaskClick}
          forceMount
          lockScroll={false}
          onOpenChange={() => requestOpenChange(false, { reason: "mask" })}
          open={resolvedOpen}
          opacity={maskOpacity}
          style={{ position: "absolute", zIndex: 0 }}
        />
        <div
          {...props}
          ref={(node) => {
            panelRef.current = node;
            assignRef(ref, node);
          }}
          className={
            className
              ? `${panel({ safeArea, state: visualState })} ${className}`
              : panel({ safeArea, state: visualState })
          }
          style={panelStyle}
          role="dialog"
          aria-label={ariaLabel}
          aria-labelledby={resolvedLabelledby}
          aria-modal="true"
          tabIndex={-1}
          data-dragging={dragHeight === null ? undefined : "true"}
          data-meu-component="bottom-sheet"
          data-snap-index={activeIndex}
          data-snap-point={activePoint ? String(activePoint.value) : undefined}
          data-state={visualState}
        >
          {dragHandle ? (
            <button
              className={dragHandleClass}
              type="button"
              disabled={!resolvedOpen}
              aria-describedby={statusId}
              aria-label={localizedHandleLabel}
              onClick={() => {
                if (suppressHandleClickRef.current) {
                  suppressHandleClickRef.current = false;
                  return;
                }
                const nextIndex =
                  activeIndex >= resolvedSnapPoints.length - 1 ? 0 : activeIndex + 1;
                requestSnapPoint(nextIndex, "handle");
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  requestSnapPoint(
                    Math.min(activeIndex + 1, resolvedSnapPoints.length - 1),
                    "handle"
                  );
                } else if (event.key === "ArrowDown") {
                  event.preventDefault();
                  requestSnapPoint(Math.max(activeIndex - 1, 0), "handle");
                } else if (event.key === "Home") {
                  event.preventDefault();
                  requestSnapPoint(0, "handle");
                } else if (event.key === "End") {
                  event.preventDefault();
                  requestSnapPoint(resolvedSnapPoints.length - 1, "handle");
                }
              }}
              onPointerDown={(event) => {
                if (
                  !resolvedOpen ||
                  event.button !== 0 ||
                  (Boolean(event.pointerType) && event.isPrimary === false) ||
                  dragSessionRef.current !== null ||
                  maximumHeight <= 0 ||
                  !activePoint
                )
                  return;
                event.currentTarget.setPointerCapture(event.pointerId);
                dragSessionRef.current = {
                  moved: false,
                  pointerId: event.pointerId,
                  startHeight: activePoint.height,
                  startTime: event.timeStamp,
                  startY: event.clientY,
                  target: event.currentTarget
                };
                setDragHeight(activePoint.height);
              }}
              onPointerMove={(event) => {
                const session = dragSessionRef.current;
                if (!session || session.pointerId !== event.pointerId) return;
                const delta = event.clientY - session.startY;
                if (Math.abs(delta) > 4) session.moved = true;
                setDragHeight(Math.max(0, Math.min(maximumHeight, session.startHeight - delta)));
              }}
              onPointerUp={(event) => finishDrag(event)}
              onPointerCancel={(event) => finishDrag(event, true)}
              onLostPointerCapture={(event) => finishDrag(event, true)}
            />
          ) : null}
          <VisuallyHidden id={statusId}>{statusText}</VisuallyHidden>
          {hasTitle || showCloseButton ? (
            <div className={header}>
              {hasTitle ? (
                <h2 className={titleClass} id={titleId}>
                  {title}
                </h2>
              ) : null}
              {showCloseButton ? (
                <button
                  className={closeButton}
                  type="button"
                  disabled={!resolvedOpen}
                  aria-label={localizedCloseLabel}
                  onClick={() => requestOpenChange(false, { reason: "close-button" })}
                >
                  <MeuIconX size={20} />
                </button>
              ) : null}
            </div>
          ) : null}
          <div
            ref={bodyRef}
            className={body}
            role="region"
            aria-label={localizedBodyLabel}
            tabIndex={bodyScrollable ? 0 : undefined}
          >
            <div ref={contentRef} className={contentClass}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
