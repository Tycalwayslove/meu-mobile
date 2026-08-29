"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, Key, PointerEvent as ReactPointerEvent, Ref } from "react";

import { useMeuConfig } from "../ConfigProvider";
import {
  actionButton,
  actions,
  content,
  keyboardAction,
  keyboardActionLeft,
  keyboardActionRight,
  root
} from "./SwipeActions.css";
import type {
  SwipeActionsAction,
  SwipeActionsActionPressDetails,
  SwipeActionsOpenChangeDetails,
  SwipeActionsProps,
  SwipeActionsSide
} from "./types";

type SwipeActionsStyle = CSSProperties & { "--meu-swipe-actions-offset"?: string };

type DragSession = {
  active: boolean;
  pointerId: number;
  startOffset: number;
  startSide: SwipeActionsSide | null;
  startTime: number;
  startX: number;
  startY: number;
};

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

function normalizeThreshold(value: number) {
  if (!Number.isFinite(value)) return 0.35;
  return Math.min(0.9, Math.max(0.1, value));
}

function sideOffset(side: SwipeActionsSide | null, leftWidth: number, rightWidth: number) {
  if (side === "left") return leftWidth;
  if (side === "right") return -rightWidth;
  return 0;
}

function availableSide(
  side: SwipeActionsSide | null,
  leftActions: ReadonlyArray<SwipeActionsAction>,
  rightActions: ReadonlyArray<SwipeActionsAction>
) {
  if (side === "left" && leftActions.length === 0) return null;
  if (side === "right" && rightActions.length === 0) return null;
  return side;
}

/**
 * Renders swipe-revealed action rails with equivalent keyboard controls.
 *
 * @public
 */
export function SwipeActions({
  children,
  className,
  closeOnAction = true,
  closeOnOutsidePress = true,
  defaultOpenSide = null,
  disabled = false,
  leftActions = [],
  leftActionsLabel,
  onAction,
  onActionError,
  onClickCapture,
  onKeyDownCapture,
  onLostPointerCapture,
  onOpenSideChange,
  onPointerCancel,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  openSide,
  openThreshold = 0.35,
  ref,
  revealLeftLabel,
  revealRightLabel,
  rightActions = [],
  rightActionsLabel,
  style,
  ...props
}: SwipeActionsProps) {
  const { locale } = useMeuConfig();
  const controlled = openSide !== undefined;
  const [uncontrolledSide, setUncontrolledSide] = useState<SwipeActionsSide | null>(
    availableSide(defaultOpenSide, leftActions, rightActions)
  );
  const requestedSide = controlled ? openSide : uncontrolledSide;
  const resolvedSide = disabled
    ? null
    : availableSide(requestedSide || null, leftActions, rightActions);
  if (!controlled && uncontrolledSide !== resolvedSide) {
    setUncontrolledSide(resolvedSide);
  }
  const rootRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const leftRevealRef = useRef<HTMLButtonElement>(null);
  const rightRevealRef = useRef<HTMLButtonElement>(null);
  const dragSessionRef = useRef<DragSession | null>(null);
  const offsetRef = useRef(0);
  const sideRef = useRef<SwipeActionsSide | null>(resolvedSide);
  const widthsRef = useRef({ left: 0, right: 0 });
  const suppressClickRef = useRef(false);
  const mountedRef = useRef(true);
  const [dragging, setDragging] = useState(false);
  const [leftWidth, setLeftWidth] = useState(0);
  const [rightWidth, setRightWidth] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loadingKey, setLoadingKey] = useState<Key | null>(null);
  const threshold = normalizeThreshold(openThreshold);
  const labels =
    locale === "en-US"
      ? {
          left: "Left actions",
          revealLeft: "Show left actions",
          revealRight: "Show right actions",
          right: "Right actions"
        }
      : {
          left: "左侧操作",
          revealLeft: "显示左侧操作",
          revealRight: "显示右侧操作",
          right: "右侧操作"
        };

  const updateOffset = useCallback((nextOffset: number) => {
    offsetRef.current = nextOffset;
    setOffset(nextOffset);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    sideRef.current = resolvedSide;
    updateOffset(sideOffset(resolvedSide, leftWidth, rightWidth));
  }, [leftWidth, resolvedSide, rightWidth, updateOffset]);

  useEffect(() => {
    if (!disabled) return;
    dragSessionRef.current = null;
    setDragging(false);
    updateOffset(0);
  }, [disabled, updateOffset]);

  useEffect(() => {
    const measure = () => {
      const nextLeft = leftRef.current ? leftRef.current.getBoundingClientRect().width : 0;
      const nextRight = rightRef.current ? rightRef.current.getBoundingClientRect().width : 0;
      widthsRef.current = { left: nextLeft, right: nextRight };
      setLeftWidth(nextLeft);
      setRightWidth(nextRight);
    };
    measure();
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(measure);
      if (leftRef.current) observer.observe(leftRef.current);
      if (rightRef.current) observer.observe(rightRef.current);
    } else {
      window.addEventListener("resize", measure);
    }
    return () => {
      if (observer) observer.disconnect();
      else window.removeEventListener("resize", measure);
    };
  }, [leftActions, rightActions]);

  const requestSide = useCallback(
    (nextSide: SwipeActionsSide | null, details: SwipeActionsOpenChangeDetails) => {
      const available = disabled ? null : availableSide(nextSide, leftActions, rightActions);
      const currentSide = sideRef.current;
      setDragging(false);
      updateOffset(sideOffset(available, widthsRef.current.left, widthsRef.current.right));
      if (available === currentSide) return;
      if (!controlled) {
        sideRef.current = available;
        setUncontrolledSide(available);
      }
      if (onOpenSideChange) onOpenSideChange(available, details);
      if (controlled) {
        window.requestAnimationFrame(() => {
          if (!mountedRef.current) return;
          updateOffset(
            sideOffset(sideRef.current, widthsRef.current.left, widthsRef.current.right)
          );
        });
      }
    },
    [controlled, disabled, leftActions, onOpenSideChange, rightActions, updateOffset]
  );

  useEffect(() => {
    if (!closeOnOutsidePress || resolvedSide === null) return undefined;
    const closeIfOutside = (event: Event) => {
      const node = rootRef.current;
      if (!node || node.contains(event.target as Node)) return;
      requestSide(null, { reason: "outside" });
    };
    document.addEventListener("pointerdown", closeIfOutside);
    document.addEventListener("focusin", closeIfOutside);
    return () => {
      document.removeEventListener("pointerdown", closeIfOutside);
      document.removeEventListener("focusin", closeIfOutside);
    };
  }, [closeOnOutsidePress, requestSide, resolvedSide]);

  const finishDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>, cancelled: boolean) => {
      const session = dragSessionRef.current;
      if (!session || session.pointerId !== event.pointerId) return;
      dragSessionRef.current = null;
      try {
        if (
          typeof event.currentTarget.hasPointerCapture === "function" &&
          typeof event.currentTarget.releasePointerCapture === "function" &&
          event.currentTarget.hasPointerCapture(event.pointerId)
        ) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      } catch {
        // Older WebViews can lose capture between the check and release.
      }
      setDragging(false);
      if (!session.active || cancelled) {
        updateOffset(sideOffset(sideRef.current, widthsRef.current.left, widthsRef.current.right));
        return;
      }
      suppressClickRef.current = true;
      const elapsed = Math.max(1, event.timeStamp - session.startTime);
      const velocity = (event.clientX - session.startX) / elapsed;
      const currentOffset = offsetRef.current;
      let nextSide: SwipeActionsSide | null = session.startSide;
      if (session.startSide === null) {
        if (
          currentOffset > 0 &&
          widthsRef.current.left > 0 &&
          (currentOffset >= widthsRef.current.left * threshold || velocity > 0.5)
        ) {
          nextSide = "left";
        } else if (
          currentOffset < 0 &&
          widthsRef.current.right > 0 &&
          (-currentOffset >= widthsRef.current.right * threshold || velocity < -0.5)
        ) {
          nextSide = "right";
        } else {
          nextSide = null;
        }
      } else if (session.startSide === "left") {
        const travelled = widthsRef.current.left - currentOffset;
        nextSide =
          travelled >= widthsRef.current.left * threshold || velocity < -0.5 ? null : "left";
      } else {
        const travelled = widthsRef.current.right + currentOffset;
        nextSide =
          travelled >= widthsRef.current.right * threshold || velocity > 0.5 ? null : "right";
      }
      requestSide(nextSide, { reason: "swipe" });
    },
    [requestSide, threshold, updateOffset]
  );

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (onPointerDown) onPointerDown(event);
    if (
      event.defaultPrevented ||
      disabled ||
      loadingKey !== null ||
      !event.isPrimary ||
      event.button !== 0 ||
      (event.target as HTMLElement).closest("[data-meu-swipe-action-control]")
    ) {
      return;
    }
    if (
      document.activeElement === leftRevealRef.current ||
      document.activeElement === rightRevealRef.current
    ) {
      (document.activeElement as HTMLElement).blur();
    }
    dragSessionRef.current = {
      active: false,
      pointerId: event.pointerId,
      startOffset: offsetRef.current,
      startSide: sideRef.current,
      startTime: event.timeStamp,
      startX: event.clientX,
      startY: event.clientY
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (onPointerMove) onPointerMove(event);
    const session = dragSessionRef.current;
    if (!session || session.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - session.startX;
    const deltaY = event.clientY - session.startY;
    if (!session.active) {
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) >= 6) {
        dragSessionRef.current = null;
        return;
      }
      if (Math.abs(deltaX) < 6) return;
      session.active = true;
      setDragging(true);
      if (typeof event.currentTarget.setPointerCapture === "function") {
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // Synthetic events and older WebViews can reject capture; root listeners still finish the drag.
        }
      }
    }
    event.preventDefault();
    const nextOffset = Math.max(
      -widthsRef.current.right,
      Math.min(widthsRef.current.left, session.startOffset + deltaX)
    );
    updateOffset(nextOffset);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (onPointerUp) onPointerUp(event);
    finishDrag(event, false);
  };

  const handlePointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (onPointerCancel) onPointerCancel(event);
    finishDrag(event, true);
  };

  const focusRevealControl = useCallback(
    (side: SwipeActionsSide) => {
      window.requestAnimationFrame(() => {
        if (!mountedRef.current || disabled || sideRef.current !== null) return;
        const control = side === "left" ? leftRevealRef.current : rightRevealRef.current;
        if (control) control.focus();
      });
    },
    [disabled]
  );

  const revealWithKeyboard = (side: SwipeActionsSide) => {
    requestSide(side, { reason: "keyboard" });
    window.requestAnimationFrame(() => {
      if (!mountedRef.current || sideRef.current !== side) return;
      const group = side === "left" ? leftRef.current : rightRef.current;
      const firstAction = group
        ? group.querySelector<HTMLButtonElement>("button:not(:disabled)")
        : null;
      if (firstAction) firstAction.focus();
    });
  };

  useEffect(() => {
    const activeElement = document.activeElement;
    if (!(activeElement instanceof HTMLElement)) return;
    const group = activeElement.closest<HTMLElement>("[data-meu-swipe-actions-group]");
    const focusedSide = group
      ? (group.dataset.meuSwipeActionsGroup as SwipeActionsSide | undefined)
      : undefined;
    if (!focusedSide || focusedSide === resolvedSide) return;
    if (disabled) activeElement.blur();
    else focusRevealControl(focusedSide);
  }, [disabled, focusRevealControl, resolvedSide]);

  const pressAction = async (action: SwipeActionsAction, index: number, side: SwipeActionsSide) => {
    if (disabled || action.disabled || loadingKey !== null) return;
    const details: SwipeActionsActionPressDetails = { index, side };
    setLoadingKey(action.key);
    try {
      const actionResult = action.onPress ? await action.onPress(details) : undefined;
      const rootResult = onAction ? await onAction(action, details) : undefined;
      const shouldClose = action.closeOnPress === undefined ? closeOnAction : action.closeOnPress;
      if (shouldClose && actionResult !== false && rootResult !== false) {
        const keyboardFocus =
          document.activeElement instanceof HTMLElement &&
          Boolean(document.activeElement.closest("[data-meu-swipe-actions-group]"));
        requestSide(null, { actionKey: action.key, reason: "action" });
        if (keyboardFocus) focusRevealControl(side);
      }
    } catch (error) {
      if (onActionError) onActionError(error, action);
    } finally {
      if (mountedRef.current) setLoadingKey(null);
    }
  };

  const renderActions = (items: ReadonlyArray<SwipeActionsAction>, side: SwipeActionsSide) => (
    <div
      ref={side === "left" ? leftRef : rightRef}
      className={actions({ side })}
      role="group"
      aria-busy={loadingKey !== null ? "true" : undefined}
      aria-hidden={resolvedSide === side ? undefined : "true"}
      aria-label={
        side === "left" ? leftActionsLabel || labels.left : rightActionsLabel || labels.right
      }
      data-meu-swipe-actions-group={side}
      data-open={resolvedSide === side ? "true" : "false"}
    >
      {items.map((action, index) => (
        <button
          key={action.key}
          className={actionButton({ tone: action.tone })}
          type="button"
          aria-label={action["aria-label"]}
          disabled={disabled || action.disabled || loadingKey !== null}
          tabIndex={resolvedSide === side ? 0 : -1}
          data-action-key={String(action.key)}
          data-meu-swipe-action-control
          onClick={() => void pressAction(action, index, side)}
        >
          {action.label}
        </button>
      ))}
    </div>
  );

  const resolvedStyle = {
    ...style,
    "--meu-swipe-actions-offset": `${offset}px`
  } as SwipeActionsStyle;

  return (
    <div
      {...props}
      ref={(node) => {
        rootRef.current = node;
        assignRef(ref, node);
      }}
      className={className ? `${root} ${className}` : root}
      style={resolvedStyle}
      data-disabled={disabled ? "true" : "false"}
      data-dragging={dragging ? "true" : "false"}
      data-meu-component="swipe-actions"
      data-offset={Math.round(offset)}
      data-open-side={resolvedSide || "none"}
      onClickCapture={(event) => {
        if (suppressClickRef.current) {
          suppressClickRef.current = false;
          if (!(event.target as HTMLElement).closest("[data-meu-swipe-action-control]")) {
            event.preventDefault();
            event.stopPropagation();
          }
        }
        if (onClickCapture) onClickCapture(event);
      }}
      onKeyDownCapture={(event) => {
        if (resolvedSide !== null && event.key === "Escape") {
          event.preventDefault();
          requestSide(null, { reason: "escape" });
          const activeSide = resolvedSide;
          focusRevealControl(activeSide);
        }
        if (onKeyDownCapture) onKeyDownCapture(event);
      }}
      onLostPointerCapture={(event) => {
        if (onLostPointerCapture) onLostPointerCapture(event);
        finishDrag(event, true);
      }}
      onPointerCancel={handlePointerCancel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {leftActions.length > 0 ? (
        <button
          ref={leftRevealRef}
          className={`${keyboardAction} ${keyboardActionLeft}`}
          type="button"
          disabled={disabled}
          data-meu-swipe-action-control
          onClick={() => revealWithKeyboard("left")}
        >
          {revealLeftLabel || labels.revealLeft}
        </button>
      ) : null}
      {rightActions.length > 0 ? (
        <button
          ref={rightRevealRef}
          className={`${keyboardAction} ${keyboardActionRight}`}
          type="button"
          disabled={disabled}
          data-meu-swipe-action-control
          onClick={() => revealWithKeyboard("right")}
        >
          {revealRightLabel || labels.revealRight}
        </button>
      ) : null}
      {leftActions.length > 0 ? renderActions(leftActions, "left") : null}
      {rightActions.length > 0 ? renderActions(rightActions, "right") : null}
      <div
        className={content}
        data-meu-swipe-actions-content
        onClickCapture={(event) => {
          if (resolvedSide === null) return;
          event.preventDefault();
          event.stopPropagation();
          requestSide(null, { reason: "content" });
        }}
      >
        {children}
      </div>
    </div>
  );
}
