"use client";

import { Portal } from "@meu/primitives-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FocusEvent, MouseEvent } from "react";

import { useMeuConfig } from "../ConfigProvider";
import { useControllableOpen } from "../internal/useControllableOpen";
import { useOverlayPresence } from "../internal/useOverlayPresence";
import {
  action as actionStyle,
  icon as iconStyle,
  message as messageStyle,
  toast as toastStyle,
  viewport
} from "./Toast.css";
import type { ToastOpenChangeDetails, ToastProps } from "./types";

const defaultDuration = 3000;
const minimumActionDuration = 5000;

function getEffectiveDuration(duration: number, hasAction: boolean) {
  const normalizedDuration = Number.isFinite(duration) ? Math.max(0, duration) : defaultDuration;
  if (!hasAction || normalizedDuration === 0) return normalizedDuration;
  return Math.max(normalizedDuration, minimumActionDuration);
}

function usePausableTimer({
  duration,
  onTimeout,
  open
}: {
  duration: number;
  onTimeout: () => void;
  open: boolean;
}) {
  const onTimeoutRef = useRef(onTimeout);
  const pausedReasonsRef = useRef(new Set<string>());
  const remainingRef = useRef(duration);
  const startedAtRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const schedule = useCallback(() => {
    if (!open || duration === 0 || pausedReasonsRef.current.size > 0) return;
    if (timerRef.current !== null) return;
    startedAtRef.current = Date.now();
    timerRef.current = window.setTimeout(
      () => {
        timerRef.current = null;
        remainingRef.current = 0;
        onTimeoutRef.current();
      },
      Math.max(0, remainingRef.current)
    );
  }, [duration, open]);

  useEffect(() => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    remainingRef.current = duration;
    if (!open) pausedReasonsRef.current.clear();
    schedule();

    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [duration, open, schedule]);

  const pause = useCallback((reason: string) => {
    if (pausedReasonsRef.current.has(reason)) return;
    pausedReasonsRef.current.add(reason);
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
      remainingRef.current = Math.max(
        0,
        remainingRef.current - (Date.now() - startedAtRef.current)
      );
    }
  }, []);

  const resume = useCallback(
    (reason: string) => {
      pausedReasonsRef.current.delete(reason);
      schedule();
    },
    [schedule]
  );

  return { pause, resume };
}

export function Toast({
  action,
  className,
  container,
  defaultOpen = false,
  duration = defaultDuration,
  forceMount = false,
  icon,
  message,
  onActionError,
  onBlurCapture,
  onFocusCapture,
  onMouseEnter,
  onMouseLeave,
  onOpenChange,
  open,
  position = "center",
  ref,
  tone = "neutral",
  ...props
}: ToastProps) {
  const config = useMeuConfig();
  const [pending, setPending] = useState(false);
  const [resolvedOpen, requestOpenChange] = useControllableOpen<ToastOpenChangeDetails>({
    defaultOpen,
    onOpenChange,
    open
  });
  const { hidden, shouldRender, visualState } = useOverlayPresence(resolvedOpen, forceMount);
  const effectiveDuration = getEffectiveDuration(duration, action !== undefined);
  const portalContainer = container === undefined ? config.portalContainer : container;
  const resolvedIcon = icon === undefined ? null : icon;
  const liveRole = tone === "warning" || tone === "danger" ? "alert" : "status";
  const { pause, resume } = usePausableTimer({
    duration: effectiveDuration,
    onTimeout: () => requestOpenChange(false, { reason: "timeout" }),
    open: resolvedOpen
  });

  if (!shouldRender) return null;

  const runAction = async () => {
    if (!action || pending) return;
    pause("action");
    setPending(true);
    let result: boolean | void;
    try {
      result = action.onPress ? await action.onPress() : undefined;
    } catch (error) {
      if (onActionError) {
        onActionError(error);
        return;
      }
      throw error;
    } finally {
      setPending(false);
      resume("action");
    }
    if (result !== false && action.closeOnPress !== false) {
      requestOpenChange(false, { reason: "action" });
    }
  };

  return (
    <Portal container={portalContainer}>
      <div
        className={viewport({ position })}
        hidden={hidden}
        aria-hidden={resolvedOpen ? undefined : "true"}
        lang={config.locale}
        data-meu-overlay-layer="toast"
        data-position={position}
        data-meu-theme={config.theme}
      >
        <div
          {...props}
          ref={ref}
          className={
            className
              ? `${toastStyle({ state: visualState, tone })} ${className}`
              : toastStyle({ state: visualState, tone })
          }
          aria-busy={pending ? "true" : undefined}
          data-meu-component="toast"
          data-state={visualState}
          data-tone={tone}
          onMouseEnter={(event: MouseEvent<HTMLDivElement>) => {
            pause("pointer");
            if (onMouseEnter) onMouseEnter(event);
          }}
          onMouseLeave={(event: MouseEvent<HTMLDivElement>) => {
            resume("pointer");
            if (onMouseLeave) onMouseLeave(event);
          }}
          onFocusCapture={(event: FocusEvent<HTMLDivElement>) => {
            pause("focus");
            if (onFocusCapture) onFocusCapture(event);
          }}
          onBlurCapture={(event: FocusEvent<HTMLDivElement>) => {
            if (!event.currentTarget.contains(event.relatedTarget)) resume("focus");
            if (onBlurCapture) onBlurCapture(event);
          }}
        >
          {resolvedIcon !== null && resolvedIcon !== false ? (
            <span className={iconStyle} aria-hidden="true">
              {resolvedIcon}
            </span>
          ) : null}
          <div
            className={messageStyle}
            role={liveRole}
            aria-atomic="true"
            aria-live={liveRole === "alert" ? "assertive" : "polite"}
          >
            {message}
          </div>
          {action ? (
            <button
              className={actionStyle}
              type="button"
              disabled={pending}
              aria-busy={pending ? "true" : undefined}
              onClick={() => {
                void runAction();
              }}
            >
              {action.label}
            </button>
          ) : null}
        </div>
      </div>
    </Portal>
  );
}
