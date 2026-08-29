"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { Button } from "../Button";
import { useMeuConfig } from "../ConfigProvider";
import { Dialog } from "../Dialog";
import { useControllableOpen } from "../internal/useControllableOpen";
import { Popup } from "../Popup";
import {
  actionButton,
  actionContent,
  actionDescription,
  actionLabel,
  cancelGroup,
  description as descriptionStyle,
  group,
  header,
  popupPanel,
  root,
  title as titleStyle
} from "./ActionMenu.css";
import type { ActionMenuAction, ActionMenuConfirmation, ActionMenuProps } from "./types";

type PendingConfirmation = {
  action: ActionMenuAction;
  index: number;
  trigger: HTMLButtonElement;
};

function getPreferredActionKey(actions: ReadonlyArray<ActionMenuAction>) {
  const neutral = actions.find((action) => action.tone !== "danger" && !action.disabled);
  if (neutral) return neutral.key;
  const danger = actions.find((action) => action.tone === "danger" && !action.disabled);
  return danger ? danger.key : undefined;
}

function resolveConfirmation(
  config: ActionMenuConfirmation | undefined,
  action: ActionMenuAction,
  locale: "en-US" | "zh-CN"
) {
  const isEnglish = locale === "en-US";
  return {
    cancelText:
      config && config.cancelText !== undefined ? config.cancelText : isEnglish ? "Cancel" : "取消",
    confirmText:
      config && config.confirmText !== undefined
        ? config.confirmText
        : action.tone === "danger"
          ? isEnglish
            ? "Continue"
            : "继续操作"
          : isEnglish
            ? "Confirm"
            : "确认",
    description:
      config && config.description !== undefined
        ? config.description
        : action.tone === "danger"
          ? isEnglish
            ? "This action may be irreversible. Review it before continuing."
            : "此操作可能无法撤销，请确认后继续。"
          : isEnglish
            ? "Review this action before continuing."
            : "请确认后继续此操作。",
    title:
      config && config.title !== undefined
        ? config.title
        : action.tone === "danger"
          ? isEnglish
            ? "Continue with this action?"
            : "确认继续此操作？"
          : isEnglish
            ? "Confirm this action?"
            : "确认此操作？"
  };
}

/**
 * Renders a focus-managed bottom action sheet with optional per-action confirmation.
 *
 * @public
 */
export function ActionMenu({
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  actions,
  cancelText,
  className,
  closeOnAction = true,
  closeOnEscape = true,
  closeOnMaskClick = true,
  container,
  defaultOpen = false,
  description,
  forceMount = false,
  initialFocusRef,
  lockScroll = true,
  maskOpacity = "default",
  onAction,
  onActionError,
  onOpenChange,
  open,
  ref,
  restoreFocus = true,
  returnFocusRef,
  safeArea = true,
  title,
  ...props
}: ActionMenuProps) {
  const config = useMeuConfig();
  const generatedId = useId();
  const initialActionRef = useRef<HTMLButtonElement>(null);
  const confirmationReturnTargetRef = useRef<HTMLButtonElement | null>(null);
  const resolvedOpenRef = useRef(false);
  const actionTokenRef = useRef(0);
  const openStateRef = useRef(false);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<PendingConfirmation | null>(null);
  const [resolvedOpen, requestOpenChange] = useControllableOpen({
    defaultOpen,
    onOpenChange,
    open
  });
  const titleId = `meu-action-menu-title-${generatedId}`;
  const descriptionId = `meu-action-menu-description-${generatedId}`;
  const hasTitle = title !== undefined && title !== null;
  const hasDescription = description !== undefined && description !== null;
  const resolvedLabelledby = ariaLabelledby || (!ariaLabel && hasTitle ? titleId : undefined);
  const preferredActionKey = getPreferredActionKey(actions);
  const localizedCancel =
    cancelText === undefined ? (config.locale === "en-US" ? "Cancel" : "取消") : cancelText;
  const accessibleNameProps = ariaLabel
    ? ({ "aria-label": ariaLabel } as const)
    : resolvedLabelledby
      ? ({ "aria-labelledby": resolvedLabelledby } as const)
      : ({ "aria-label": config.locale === "en-US" ? "Actions" : "操作" } as const);
  const dismissBlocked = pendingKey !== null || confirmation !== null;
  if (openStateRef.current !== resolvedOpen) {
    openStateRef.current = resolvedOpen;
    resolvedOpenRef.current = resolvedOpen;
    actionTokenRef.current += 1;
    if (!resolvedOpen && pendingKey !== null) setPendingKey(null);
  }
  if (!resolvedOpen && confirmation !== null) {
    setConfirmation(null);
  }
  const groupedActions = useMemo(() => {
    const neutral: Array<{ action: ActionMenuAction; index: number }> = [];
    const danger: Array<{ action: ActionMenuAction; index: number }> = [];
    actions.forEach((action, index) => {
      const entry = { action, index };
      if (action.tone === "danger") danger.push(entry);
      else neutral.push(entry);
    });
    return { danger, neutral };
  }, [actions]);

  useEffect(() => {
    resolvedOpenRef.current = resolvedOpen;
  }, [resolvedOpen]);

  useEffect(() => {
    if (!resolvedOpen) {
      confirmationReturnTargetRef.current = null;
      return undefined;
    }
    if (confirmation !== null) return undefined;
    const returnTarget = confirmationReturnTargetRef.current;
    if (!returnTarget) return undefined;
    confirmationReturnTargetRef.current = null;
    const frame = window.requestAnimationFrame(() => {
      if (resolvedOpenRef.current && returnTarget.isConnected && !returnTarget.disabled) {
        returnTarget.focus({ preventScroll: true });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [confirmation, resolvedOpen]);

  useEffect(() => {
    if (!resolvedOpen) return undefined;
    const returnTarget = returnFocusRef
      ? returnFocusRef.current
      : document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    return () => {
      if (!restoreFocus || !returnTarget) return;
      window.requestAnimationFrame(() => {
        if (!resolvedOpenRef.current && returnTarget.isConnected) {
          returnTarget.focus({ preventScroll: true });
        }
      });
    };
  }, [resolvedOpen, restoreFocus, returnFocusRef]);

  const runAction = async (action: ActionMenuAction, index: number) => {
    if (pendingKey !== null || action.disabled) return false;
    const actionToken = ++actionTokenRef.current;
    const isCurrentAction = () => actionTokenRef.current === actionToken && openStateRef.current;
    setPendingKey(action.key);
    let result: boolean | void;
    try {
      result = action.onPress ? await action.onPress() : undefined;
      if (!isCurrentAction()) return false;
      if (result === false) return false;
      result = onAction ? await onAction(action, index) : undefined;
      if (!isCurrentAction()) return false;
      if (result === false) return false;
    } catch (error) {
      if (!isCurrentAction()) return false;
      if (onActionError) {
        onActionError(error, action);
        return false;
      }
      throw error;
    } finally {
      if (actionTokenRef.current === actionToken) {
        setPendingKey((currentKey) => (currentKey === action.key ? null : currentKey));
      }
    }
    if (isCurrentAction() && action.closeOnPress !== false && closeOnAction) {
      requestOpenChange(false, { actionKey: action.key, reason: "action" });
    }
    return undefined;
  };

  const renderAction = ({ action, index }: { action: ActionMenuAction; index: number }) => {
    const needsConfirmation = action.tone === "danger" || action.confirmation !== undefined;
    return (
      <Button
        ref={action.key === preferredActionKey ? initialActionRef : undefined}
        block
        className={actionButton}
        disabled={action.disabled || dismissBlocked}
        key={action.key}
        leadingIcon={action.icon}
        loading={pendingKey === action.key}
        size="large"
        tone={action.tone === "danger" ? "danger" : "neutral"}
        variant="ghost"
        onClick={(event) => {
          if (needsConfirmation) {
            confirmationReturnTargetRef.current = null;
            setConfirmation({ action, index, trigger: event.currentTarget });
          } else void runAction(action, index);
        }}
      >
        <span className={actionContent}>
          <span className={actionLabel}>{action.label}</span>
          {action.description === undefined ? null : (
            <span className={actionDescription}>{action.description}</span>
          )}
        </span>
      </Button>
    );
  };

  const confirmationContent = confirmation
    ? resolveConfirmation(confirmation.action.confirmation, confirmation.action, config.locale)
    : null;

  return (
    <Popup
      {...accessibleNameProps}
      {...(container === undefined ? {} : { container })}
      {...(hasDescription ? { "aria-describedby": descriptionId } : {})}
      {...(returnFocusRef === undefined ? {} : { returnFocusRef })}
      aria-busy={pendingKey !== null ? "true" : undefined}
      className={popupPanel}
      closeOnEscape={closeOnEscape && !dismissBlocked}
      closeOnMaskClick={closeOnMaskClick && !dismissBlocked}
      forceMount={forceMount}
      initialFocusRef={initialFocusRef || initialActionRef}
      lockScroll={lockScroll}
      maskOpacity={maskOpacity}
      open={resolvedOpen}
      position="bottom"
      restoreFocus={false}
      safeArea={safeArea}
      onOpenChange={(nextOpen, details) => {
        if (nextOpen) return;
        if (details.reason === "mask" || details.reason === "escape") {
          requestOpenChange(false, { reason: details.reason });
        }
      }}
    >
      <div
        {...props}
        ref={ref}
        aria-busy={pendingKey !== null ? "true" : undefined}
        aria-describedby={hasDescription ? descriptionId : undefined}
        className={className ? `${root} ${className}` : root}
        data-meu-component="action-menu"
      >
        {hasTitle || hasDescription ? (
          <header className={header}>
            {hasTitle ? (
              <h2 className={titleStyle} id={titleId}>
                {title}
              </h2>
            ) : null}
            {hasDescription ? (
              <p className={descriptionStyle} id={descriptionId}>
                {description}
              </p>
            ) : null}
          </header>
        ) : null}
        {groupedActions.neutral.length > 0 ? (
          <div className={group} data-action-group="neutral">
            {groupedActions.neutral.map(renderAction)}
          </div>
        ) : null}
        {groupedActions.danger.length > 0 ? (
          <div className={group} data-action-group="danger">
            {groupedActions.danger.map(renderAction)}
          </div>
        ) : null}
        {localizedCancel === null ? null : (
          <div className={`${group} ${cancelGroup}`} data-action-group="cancel">
            <Button
              ref={preferredActionKey === undefined ? initialActionRef : undefined}
              block
              className={actionButton}
              disabled={dismissBlocked}
              size="large"
              tone="neutral"
              variant="ghost"
              onClick={() => requestOpenChange(false, { reason: "cancel" })}
            >
              {localizedCancel}
            </Button>
          </div>
        )}
      </div>
      {confirmation && confirmationContent ? (
        <Dialog
          open
          title={confirmationContent.title}
          description={confirmationContent.description}
          actions={[
            {
              autoFocus: true,
              key: "cancel",
              label: confirmationContent.cancelText,
              tone: "neutral"
            },
            {
              key: "confirm",
              label: confirmationContent.confirmText,
              onPress: () => runAction(confirmation.action, confirmation.index),
              tone: confirmation.action.tone === "danger" ? "danger" : "accent"
            }
          ]}
          closeOnEscape={pendingKey === null}
          restoreFocus={false}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              confirmationReturnTargetRef.current = confirmation.trigger;
              setConfirmation(null);
            }
          }}
        />
      ) : null}
    </Popup>
  );
}
