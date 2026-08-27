"use client";

import { Portal, useBodyScrollLock } from "@meu/primitives-react";
import type { CSSProperties } from "react";

import { useMeuConfig } from "../ConfigProvider";
import { useControllableOpen } from "../internal/useControllableOpen";
import { useOverlayPresence } from "../internal/useOverlayPresence";
import { backdrop, content as contentStyle, root } from "./Mask.css";
import type { MaskOpacity, MaskProps } from "./types";

type MaskStyle = CSSProperties & { "--meu-mask-opacity"?: number };

const opacityValues: Record<Exclude<MaskOpacity, number>, number> = {
  thin: 0.24,
  default: 0.48,
  thick: 0.72
};

function resolveOpacity(opacity: MaskOpacity) {
  if (typeof opacity === "number") {
    if (!Number.isFinite(opacity)) return opacityValues.default;
    return Math.min(1, Math.max(0, opacity));
  }
  return opacityValues[opacity];
}

export function Mask({
  children,
  className,
  container,
  defaultOpen = true,
  dismissible = false,
  forceMount = false,
  lockScroll = true,
  onOpenChange,
  open,
  opacity = "default",
  ref,
  style,
  ...props
}: MaskProps) {
  const config = useMeuConfig();
  const [resolvedOpen, requestOpenChange] = useControllableOpen({
    defaultOpen,
    onOpenChange,
    open
  });
  const { hidden, shouldRender, visualState } = useOverlayPresence(resolvedOpen, forceMount);
  useBodyScrollLock(resolvedOpen && lockScroll);

  if (!shouldRender) return null;

  const portalContainer = container === undefined ? config.portalContainer : container;
  const resolvedStyle: MaskStyle = {
    ...style,
    "--meu-mask-opacity": resolveOpacity(opacity)
  };

  return (
    <Portal container={portalContainer}>
      <div
        {...props}
        ref={ref}
        className={
          className ? `${root({ state: visualState })} ${className}` : root({ state: visualState })
        }
        style={resolvedStyle}
        hidden={hidden}
        aria-hidden="true"
        data-dismissible={dismissible ? "true" : "false"}
        data-meu-component="mask"
        data-state={visualState}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          className={backdrop({ state: visualState })}
          onClick={dismissible ? () => requestOpenChange(false, { reason: "mask" }) : undefined}
        />
        {children !== undefined ? (
          <div className={contentStyle({ state: visualState })}>{children}</div>
        ) : null}
      </div>
    </Portal>
  );
}
