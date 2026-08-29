"use client";

import {
  FloatingArrow,
  FloatingFocusManager,
  FloatingPortal,
  arrow as floatingArrow,
  autoUpdate,
  flip,
  hide,
  offset as floatingOffset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useMergeRefs,
  useRole
} from "@floating-ui/react";
import { cloneElement, useId, useState, useSyncExternalStore } from "react";
import type { CSSProperties } from "react";

import { useMeuConfig } from "../ConfigProvider";
import { getConfigBoundaryProps } from "../internal/configBoundary";
import { useControllableOpen } from "../internal/useControllableOpen";
import { useOverlayPresence } from "../internal/useOverlayPresence";
import { arrow as arrowClass, floating } from "./Popover.css";
import type { PopoverOpenChangeDetails, PopoverProps } from "./types";

const subscribe = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function normalizeDistance(value: number, fallback: number) {
  return Number.isFinite(value) ? Math.max(0, value) : fallback;
}

function mapOpenChangeReason(reason: string | undefined): PopoverOpenChangeDetails {
  if (reason === "escape-key") return { reason: "escape" };
  if (reason === "outside-press") return { reason: "outside" };
  if (reason === "focus-out") return { reason: "focus-out" };
  return { reason: "trigger" };
}

/**
 * Renders a positioned non-modal dialog anchored to one trigger element.
 *
 * @public
 */
export function Popover({
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  arrow = true,
  autoFocus = true,
  children,
  className,
  closeOnEscape = true,
  closeOnFocusOut = false,
  closeOnOutsideClick = true,
  container,
  content,
  defaultOpen = false,
  forceMount = false,
  initialFocusRef,
  offset = 10,
  onOpenChange,
  open,
  placement = "top",
  ref,
  restoreFocus = true,
  style,
  trigger = "click",
  viewportPadding = 16,
  ...props
}: PopoverProps) {
  const config = useMeuConfig();
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const generatedId = useId();
  const [arrowElement, setArrowElement] = useState<SVGSVGElement | null>(null);
  const [resolvedOpen, requestOpenChange] = useControllableOpen({
    defaultOpen,
    onOpenChange,
    open
  });
  const { hidden, shouldRender, visualState } = useOverlayPresence(resolvedOpen, forceMount);
  const resolvedOffset = normalizeDistance(offset, 10);
  const resolvedViewportPadding = normalizeDistance(viewportPadding, 16);

  const {
    context,
    floatingStyles,
    isPositioned,
    middlewareData,
    placement: actualPlacement,
    refs
  } = useFloating({
    middleware: [
      floatingOffset(resolvedOffset),
      flip({ padding: resolvedViewportPadding }),
      shift({ padding: resolvedViewportPadding }),
      hide(),
      ...(arrow ? [floatingArrow({ element: arrowElement })] : [])
    ],
    onOpenChange: (nextOpen, _event, reason) => {
      requestOpenChange(nextOpen, mapOpenChangeReason(reason));
    },
    open: resolvedOpen,
    placement,
    strategy: "fixed",
    transform: false,
    whileElementsMounted: autoUpdate
  });

  const click = useClick(context, {
    enabled: trigger === "click",
    event: "click",
    keyboardHandlers: true,
    toggle: true
  });
  const dismiss = useDismiss(context, {
    enabled: resolvedOpen,
    escapeKey: closeOnEscape,
    outsidePress: closeOnOutsideClick,
    outsidePressEvent: "pointerdown"
  });
  const role = useRole(context, { role: "dialog" });
  const { getFloatingProps, getReferenceProps } = useInteractions([click, dismiss, role]);

  const triggerId = children.props.id || `meu-popover-trigger-${generatedId}`;
  const popoverId = `meu-popover-${generatedId}`;
  const triggerRef = useMergeRefs([children.props.ref, refs.setReference]);
  const floatingRef = useMergeRefs([ref, refs.setFloating]);
  const referenceProps = getReferenceProps({
    ...children.props,
    "aria-controls": popoverId,
    "aria-expanded": resolvedOpen,
    "aria-haspopup": "dialog",
    id: triggerId
  });
  const triggerNode = cloneElement(children, {
    ...referenceProps,
    ref: triggerRef
  });

  const floatingProps = getFloatingProps({
    ...props,
    "aria-hidden": resolvedOpen ? undefined : true,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    id: popoverId,
    role: "dialog",
    tabIndex: -1
  });
  const referenceHidden = Boolean(middlewareData.hide && middlewareData.hide.referenceHidden);
  const configBoundary = getConfigBoundaryProps(config);
  const classes = [floating({ state: visualState }), configBoundary.className, className]
    .filter(Boolean)
    .join(" ");
  const panelStyle: CSSProperties = {
    ...style,
    ...floatingStyles,
    ...(!resolvedOpen || isPositioned ? {} : { visibility: "hidden" })
  };
  const panel = (
    <div
      {...floatingProps}
      {...configBoundary}
      ref={floatingRef}
      className={classes}
      style={panelStyle}
      hidden={hidden}
      inert={!resolvedOpen}
      data-meu-component="popover"
      data-meu-focus-branch={triggerId}
      data-offset={resolvedOffset}
      data-placement={actualPlacement}
      data-positioned={isPositioned ? "true" : "false"}
      data-reference-hidden={referenceHidden ? "true" : undefined}
      data-state={visualState}
      data-viewport-padding={resolvedViewportPadding}
    >
      {arrow ? (
        <FloatingArrow
          ref={setArrowElement}
          className={arrowClass}
          context={context}
          width={16}
          height={8}
          tipRadius={2}
          stroke="var(--meu-color-border)"
          strokeWidth={1}
        />
      ) : null}
      {content}
    </div>
  );

  let managedPanel = panel;
  if (resolvedOpen) {
    const initialFocus = autoFocus ? initialFocusRef || refs.floating : -1;
    managedPanel = (
      <FloatingFocusManager
        context={context}
        initialFocus={initialFocus}
        modal={false}
        closeOnFocusOut={closeOnFocusOut}
        order={["floating", "content"]}
        restoreFocus
        returnFocus={restoreFocus}
      >
        {panel}
      </FloatingFocusManager>
    );
  }

  let floatingNode = null;
  if (mounted && shouldRender) {
    const portalContainer = container === undefined ? config.portalContainer : container;
    if (portalContainer === null) {
      floatingNode = managedPanel;
    } else if (portalContainer === undefined) {
      floatingNode = <FloatingPortal>{managedPanel}</FloatingPortal>;
    } else {
      const portalRoot =
        typeof portalContainer === "function" ? portalContainer() : portalContainer;
      floatingNode = <FloatingPortal root={portalRoot}>{managedPanel}</FloatingPortal>;
    }
  }

  return (
    <>
      {triggerNode}
      {floatingNode}
    </>
  );
}
