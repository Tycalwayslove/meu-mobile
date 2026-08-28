"use client";

import { useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * A DOM node accepted by React DOM as a portal destination.
 *
 * @public
 */
export type PortalContainer = Element | DocumentFragment;

/**
 * Properties for {@link Portal}.
 *
 * @public
 */
export type PortalProps = {
  /** Content rendered into the resolved destination. */
  children: ReactNode;
  /**
   * Overrides the destination. `undefined` uses `document.body`, `null` renders
   * in place, and a callback resolves lazily after the client is available.
   *
   * @defaultValue `undefined`
   */
  container?: PortalContainer | (() => PortalContainer | null | undefined) | null | undefined;
};

const subscribe = () => () => undefined;
const getClientSnapshot = () => typeof document !== "undefined";
const getServerSnapshot = () => false;

function isPortalContainer(value: unknown): value is PortalContainer {
  if (typeof value !== "object" || value === null || !("nodeType" in value)) {
    return false;
  }

  return value.nodeType === 1 || value.nodeType === 11;
}

/**
 * Renders children into `document.body` or a caller-owned DOM container.
 * During SSR and the first hydration pass, children stay in place so server
 * markup remains useful and hydration-safe. React owns portal cleanup when the
 * destination changes or the component unmounts.
 *
 * @public
 */
export function Portal({ children, container }: PortalProps) {
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  if (!mounted) {
    return <>{children}</>;
  }

  let target: PortalContainer | null | undefined = document.body;
  if (typeof container === "function") {
    target = container();
  } else if (isPortalContainer(container)) {
    target = container;
  } else if (container === null) {
    target = null;
  }

  return isPortalContainer(target) ? createPortal(children, target) : <>{children}</>;
}
