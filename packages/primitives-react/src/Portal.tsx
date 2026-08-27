"use client";

import { useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

export type PortalProps = {
  children: ReactNode;
  container?: HTMLElement | (() => HTMLElement) | null | undefined;
};

const subscribe = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function Portal({ children, container }: PortalProps) {
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  if (!mounted) {
    return null;
  }

  let target: HTMLElement | null = document.body;
  if (typeof container === "function") {
    target = container();
  } else if (container instanceof HTMLElement) {
    target = container;
  } else if (container === null) {
    target = null;
  }

  return target ? createPortal(children, target) : <>{children}</>;
}
