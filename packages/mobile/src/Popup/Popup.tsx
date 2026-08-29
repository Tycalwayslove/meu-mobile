"use client";

import { MeuIconX } from "@meu/icons-react";
import { Portal, useBodyScrollLock, useFocusTrap } from "@meu/primitives-react";
import { useMemo, useRef } from "react";
import type { Ref, RefObject } from "react";

import { useMeuConfig } from "../ConfigProvider";
import { useControllableOpen } from "../internal/useControllableOpen";
import { getConfigBoundaryProps } from "../internal/configBoundary";
import { useOverlayPresence } from "../internal/useOverlayPresence";
import { Mask } from "../Mask";
import { body, closeButton, layer, panel } from "./Popup.css";
import type { PopupProps } from "./types";

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

/**
 * Renders a modal edge panel with focus trapping and an optional mask.
 *
 * @public
 */
export function Popup({
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  children,
  className,
  closeLabel,
  closeOnEscape = true,
  closeOnMaskClick = false,
  container,
  defaultOpen = false,
  forceMount = false,
  initialFocusRef,
  lockScroll = true,
  mask = true,
  maskOpacity = "default",
  onOpenChange,
  open,
  position = "bottom",
  ref,
  restoreFocus = true,
  returnFocusRef,
  safeArea = true,
  showCloseButton = false,
  ...props
}: PopupProps) {
  const config = useMeuConfig();
  const portalContainer = container === undefined ? config.portalContainer : container;
  const panelRef = useRef<HTMLDivElement>(null);
  const focusTrapRef = useMemo<RefObject<HTMLElement | null>>(() => {
    // The dependency intentionally gives the focus trap a new ref identity when the Portal moves.
    void portalContainer;
    return {
      get current() {
        return panelRef.current;
      }
    };
  }, [portalContainer]);
  const [resolvedOpen, requestOpenChange] = useControllableOpen({
    defaultOpen,
    onOpenChange,
    open
  });
  const { hidden, shouldRender, visualState } = useOverlayPresence(resolvedOpen, forceMount);
  const localizedCloseLabel = closeLabel || (config.locale === "en-US" ? "Close" : "关闭");
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

  if (!shouldRender) return null;

  return (
    <Portal container={portalContainer}>
      <div
        {...configBoundary}
        className={`${layer({ state: visualState })} ${configBoundary.className}`}
        hidden={hidden}
        inert={!resolvedOpen}
        aria-hidden={resolvedOpen ? undefined : "true"}
        data-meu-overlay-layer="popup"
        data-state={visualState}
      >
        {mask ? (
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
        ) : null}
        <div
          {...props}
          ref={(node) => {
            panelRef.current = node;
            assignRef(ref, node);
          }}
          className={
            className
              ? `${panel({ position, safeArea, state: visualState })} ${className}`
              : panel({ position, safeArea, state: visualState })
          }
          role="dialog"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          aria-modal="true"
          tabIndex={-1}
          data-meu-component="popup"
          data-position={position}
          data-state={visualState}
        >
          {showCloseButton ? (
            <button
              className={closeButton}
              type="button"
              aria-label={localizedCloseLabel}
              onClick={() => requestOpenChange(false, { reason: "close-button" })}
            >
              <MeuIconX size={20} />
            </button>
          ) : null}
          <div className={body}>{children}</div>
        </div>
      </div>
    </Portal>
  );
}
