"use client";

import { Portal } from "@meu/primitives-react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import type { FocusEvent, MouseEvent, Ref } from "react";

import { useMeuConfig } from "../ConfigProvider";
import { getConfigBoundaryProps } from "../internal/configBoundary";
import { useControllableOpen } from "../internal/useControllableOpen";
import { useOverlayPresence } from "../internal/useOverlayPresence";
import { VisuallyHidden } from "../internal/VisuallyHidden";
import {
  action as actionStyle,
  icon as iconStyle,
  message as messageStyle,
  toast as toastStyle,
  viewport
} from "./Toast.css";
import type { ToastOpenChangeDetails, ToastProps } from "./types";
import { ToastAnnouncementContext } from "./ToastAnnouncementContext";
import { ToastTimerResetContext } from "./ToastTimerContext";

const defaultDuration = 3000;
const minimumActionDuration = 5000;
const maximumDuration = 2_147_483_647;

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

function getEffectiveDuration(duration: number, hasAction: boolean) {
  const normalizedDuration = Number.isFinite(duration)
    ? Math.min(Math.max(0, duration), maximumDuration)
    : defaultDuration;
  if (!hasAction || normalizedDuration === 0) return normalizedDuration;
  return Math.max(normalizedDuration, minimumActionDuration);
}

function usePausableTimer({
  duration,
  onTimeout,
  open,
  resetKey
}: {
  duration: number;
  onTimeout: () => void;
  open: boolean;
  resetKey: number;
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
  }, [duration, open, resetKey, schedule]);

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

/**
 * Renders one declarative non-modal feedback message in a context-preserving Portal.
 *
 * @public
 */
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
  const managedAnnouncement = useContext(ToastAnnouncementContext);
  const providerManagesAnnouncement = managedAnnouncement !== undefined;
  const timerResetKey = useContext(ToastTimerResetContext);
  const configBoundary = getConfigBoundaryProps(config);
  const [pending, setPending] = useState(false);
  const [actionFailed, setActionFailed] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const forwardedRefRef = useRef(ref);
  const mountedRef = useRef(true);
  const actionRunRef = useRef(0);
  const [resolvedOpen, requestOpenChange] = useControllableOpen<ToastOpenChangeDetails>({
    defaultOpen,
    onOpenChange,
    open
  });
  const { hidden, shouldRender, visualState } = useOverlayPresence(resolvedOpen, forceMount);
  const effectiveDuration = getEffectiveDuration(duration, action !== undefined);
  const portalContainer = container === undefined ? config.portalContainer : container;
  const resolvedIcon = icon === undefined ? null : icon;
  const announcementTone = managedAnnouncement ? managedAnnouncement.tone : tone;
  const liveRole =
    announcementTone === "warning" || announcementTone === "danger" ? "alert" : "status";
  const { pause, resume } = usePausableTimer({
    duration: effectiveDuration,
    onTimeout: () => requestOpenChange(false, { reason: "timeout" }),
    open: resolvedOpen,
    resetKey: timerResetKey
  });
  const resumeRef = useRef(resume);
  resumeRef.current = resume;
  const setRootNode = useCallback((node: HTMLDivElement | null) => {
    const previousNode = rootRef.current;
    if (previousNode && previousNode !== node) {
      resumeRef.current("focus");
      resumeRef.current("pointer");
    }
    rootRef.current = node;
    assignRef(forwardedRefRef.current, node);
  }, []);

  useEffect(() => {
    const previousRef = forwardedRefRef.current;
    if (previousRef === ref) return;
    assignRef(previousRef, null);
    forwardedRefRef.current = ref;
    assignRef(ref, rootRef.current);
  }, [ref]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !root.contains(document.activeElement)) resume("focus");
  }, [action, resume]);

  useEffect(() => {
    actionRunRef.current += 1;
    setPending(false);
    setActionFailed(false);
    resume("action");
  }, [resume, timerResetKey]);

  useEffect(() => {
    if (!resolvedOpen) return undefined;
    const update = () => {
      if (document.visibilityState === "hidden") pause("visibility");
      else resume("visibility");
    };
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, [pause, resolvedOpen, resume]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      actionRunRef.current += 1;
    };
  }, []);

  useEffect(() => {
    if (!resolvedOpen) {
      actionRunRef.current += 1;
      setPending(false);
      setActionFailed(false);
    }
  }, [resolvedOpen]);

  if (!shouldRender) return null;

  const runAction = async () => {
    if (!action || pending) return;
    pause("action");
    setPending(true);
    setActionFailed(false);
    actionRunRef.current += 1;
    const actionRun = actionRunRef.current;
    let result: boolean | void;
    try {
      result = action.onPress ? await action.onPress() : undefined;
    } catch (error) {
      if (mountedRef.current && actionRunRef.current === actionRun) {
        setActionFailed(true);
        if (onActionError) {
          try {
            onActionError(error);
          } catch {
            // Error observers must not turn a contained action failure into an unhandled rejection.
          }
        }
      }
      return;
    } finally {
      if (mountedRef.current && actionRunRef.current === actionRun) {
        setPending(false);
        resume("action");
      }
    }
    if (
      mountedRef.current &&
      actionRunRef.current === actionRun &&
      result !== false &&
      action.closeOnPress !== false
    ) {
      requestOpenChange(false, { reason: "action" });
    }
  };

  return (
    <Portal container={portalContainer}>
      <div
        {...configBoundary}
        className={`${viewport({ position })} ${configBoundary.className}`}
        hidden={hidden}
        inert={!resolvedOpen}
        aria-hidden={resolvedOpen ? undefined : "true"}
        data-meu-overlay-layer="toast"
        data-position={position}
      >
        <div
          {...props}
          ref={setRootNode}
          className={
            className
              ? `${toastStyle({ state: visualState, tone })} ${className}`
              : toastStyle({ state: visualState, tone })
          }
          aria-busy={pending ? "true" : undefined}
          data-action-error={actionFailed ? "true" : undefined}
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
          {providerManagesAnnouncement ? (
            <>
              <div className={messageStyle} data-meu-toast-message>
                {message}
              </div>
              <VisuallyHidden
                role={liveRole}
                aria-atomic="true"
                aria-live={liveRole === "alert" ? "assertive" : "polite"}
                data-announcement-sequence={
                  managedAnnouncement === null ? undefined : managedAnnouncement.sequence
                }
                data-meu-toast-announcer
              >
                {managedAnnouncement ? (
                  <span key={managedAnnouncement.sequence}>{managedAnnouncement.message}</span>
                ) : null}
              </VisuallyHidden>
            </>
          ) : (
            <div
              className={messageStyle}
              role={liveRole}
              aria-atomic="true"
              aria-live={liveRole === "alert" ? "assertive" : "polite"}
            >
              {message}
            </div>
          )}
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
