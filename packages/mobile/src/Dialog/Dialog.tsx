"use client";

import { Portal, useBodyScrollLock, useFocusTrap } from "@meu/primitives-react";
import { useId, useRef, useState } from "react";
import type { Ref } from "react";

import { Button } from "../Button";
import { useMeuConfig } from "../ConfigProvider";
import { useControllableOpen } from "../internal/useControllableOpen";
import { getConfigBoundaryProps } from "../internal/configBoundary";
import { useOverlayPresence } from "../internal/useOverlayPresence";
import { Mask } from "../Mask";
import {
  action as actionStyle,
  actions as actionsStyle,
  body,
  content,
  description as descriptionStyle,
  layer,
  panel,
  title as titleStyle
} from "./Dialog.css";
import type { DialogAction, DialogActionLayout, DialogProps } from "./types";

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

function resolveActionLayout(layout: DialogActionLayout, actionCount: number) {
  if (layout !== "auto") return layout;
  return actionCount > 2 ? "vertical" : "horizontal";
}

function getPreferredActionKey(actions: ReadonlyArray<DialogAction>) {
  const autoFocusAction = actions.find((action) => action.autoFocus && !action.disabled);
  if (autoFocusAction) return autoFocusAction.key;
  const firstEnabledAction = actions.find((action) => !action.disabled);
  return firstEnabledAction ? firstEnabledAction.key : undefined;
}

/**
 * Renders a modal dialog with asynchronous native-button actions.
 *
 * @public
 */
export function Dialog({
  actionLayout = "auto",
  actions,
  children,
  className,
  closeOnEscape = true,
  closeOnMaskClick = false,
  container,
  defaultOpen = false,
  description,
  forceMount = false,
  lockScroll = true,
  maskOpacity = "default",
  onActionError,
  onOpenChange,
  open,
  ref,
  restoreFocus = true,
  returnFocusRef,
  role = "alertdialog",
  title,
  ...props
}: DialogProps) {
  const config = useMeuConfig();
  const generatedId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const initialActionRef = useRef<HTMLButtonElement>(null);
  const actionTokenRef = useRef(0);
  const openStateRef = useRef(false);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [resolvedOpen, requestOpenChange] = useControllableOpen({
    defaultOpen,
    onOpenChange,
    open
  });
  const { hidden, shouldRender, visualState } = useOverlayPresence(resolvedOpen, forceMount);
  const titleId = `${generatedId}-title`;
  const descriptionId = `${generatedId}-description`;
  const preferredActionKey = getPreferredActionKey(actions);
  const resolvedLayout = resolveActionLayout(actionLayout, actions.length);
  const portalContainer = container === undefined ? config.portalContainer : container;
  const configBoundary = getConfigBoundaryProps(config);
  const dismissBlocked = pendingKey !== null;

  if (openStateRef.current !== resolvedOpen) {
    openStateRef.current = resolvedOpen;
    actionTokenRef.current += 1;
    if (!resolvedOpen && pendingKey !== null) setPendingKey(null);
  }

  useBodyScrollLock(resolvedOpen && lockScroll);
  useFocusTrap({
    active: resolvedOpen,
    containerRef: panelRef,
    initialFocusRef: initialActionRef,
    onEscape:
      closeOnEscape && !dismissBlocked
        ? () => requestOpenChange(false, { reason: "escape" })
        : undefined,
    restoreFocus,
    returnFocusRef
  });

  if (!shouldRender) return null;

  const runAction = async (action: DialogAction) => {
    if (pendingKey !== null || action.disabled) return;
    const actionToken = ++actionTokenRef.current;
    const isCurrentAction = () => actionTokenRef.current === actionToken && openStateRef.current;
    setPendingKey(action.key);
    let result: boolean | void;
    try {
      result = action.onPress ? await action.onPress() : undefined;
      if (!isCurrentAction()) return;
    } catch (error) {
      if (!isCurrentAction()) return;
      if (onActionError) {
        onActionError(error, action);
        return;
      }
      throw error;
    } finally {
      if (actionTokenRef.current === actionToken) {
        setPendingKey((currentKey) => (currentKey === action.key ? null : currentKey));
      }
    }
    if (isCurrentAction() && result !== false && action.closeOnPress !== false) {
      requestOpenChange(false, { actionKey: action.key, reason: "action" });
    }
  };

  return (
    <Portal container={portalContainer}>
      <div
        {...configBoundary}
        className={`${layer({ state: visualState })} ${configBoundary.className}`}
        hidden={hidden}
        inert={!resolvedOpen}
        aria-hidden={resolvedOpen ? undefined : "true"}
        data-meu-overlay-layer="dialog"
        data-state={visualState}
      >
        <Mask
          container={null}
          dismissible={closeOnMaskClick && !dismissBlocked}
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
              ? `${panel({ state: visualState })} ${className}`
              : panel({ state: visualState })
          }
          role={role}
          aria-busy={pendingKey !== null ? "true" : undefined}
          aria-describedby={description === undefined ? undefined : descriptionId}
          aria-labelledby={titleId}
          aria-modal="true"
          tabIndex={-1}
          data-action-layout={resolvedLayout}
          data-meu-component="dialog"
          data-state={visualState}
        >
          <div className={content}>
            <h2 className={titleStyle} id={titleId}>
              {title}
            </h2>
            {description === undefined ? null : (
              <div className={descriptionStyle} id={descriptionId}>
                {description}
              </div>
            )}
            {children === undefined ? null : <div className={body}>{children}</div>}
          </div>
          {actions.length > 0 ? (
            <div className={actionsStyle({ layout: resolvedLayout })}>
              {actions.map((action) => {
                const tone = action.tone || "neutral";
                return (
                  <Button
                    ref={action.key === preferredActionKey ? initialActionRef : undefined}
                    className={actionStyle}
                    key={action.key}
                    block
                    disabled={action.disabled || dismissBlocked}
                    loading={pendingKey === action.key}
                    tone={tone}
                    variant={tone === "neutral" ? "outline" : "solid"}
                    onClick={() => {
                      void runAction(action);
                    }}
                  >
                    {action.label}
                  </Button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </Portal>
  );
}
