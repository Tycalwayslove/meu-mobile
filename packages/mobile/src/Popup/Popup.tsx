"use client";

import { MeuIconX } from "@meu/icons-react";
import { Portal, useBodyScrollLock, useFocusTrap } from "@meu/primitives-react";
import { useRef } from "react";
import type { Ref } from "react";

import { useMeuConfig } from "../ConfigProvider";
import { useControllableOpen } from "../internal/useControllableOpen";
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
  const panelRef = useRef<HTMLDivElement>(null);
  const [resolvedOpen, requestOpenChange] = useControllableOpen({
    defaultOpen,
    onOpenChange,
    open
  });
  const { hidden, shouldRender, visualState } = useOverlayPresence(resolvedOpen, forceMount);
  const localizedCloseLabel = closeLabel || (config.locale === "en-US" ? "Close" : "关闭");
  const portalContainer = container === undefined ? config.portalContainer : container;

  useBodyScrollLock(resolvedOpen && lockScroll);
  useFocusTrap({
    active: resolvedOpen,
    containerRef: panelRef,
    initialFocusRef,
    onEscape: closeOnEscape ? () => requestOpenChange(false, { reason: "escape" }) : undefined,
    restoreFocus,
    returnFocusRef
  });

  if (!shouldRender) return null;

  return (
    <Portal container={portalContainer}>
      <div
        className={layer({ state: visualState })}
        hidden={hidden}
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
