"use client";

import { useEffect, useLayoutEffect, useReducer, useSyncExternalStore } from "react";
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
   * in place, and a callback resolves lazily after the client is available. A
   * callback that is empty on the first client render is retried once after refs
   * from that commit are attached.
   *
   * @defaultValue `undefined`
   */
  container?: PortalContainer | (() => PortalContainer | null | undefined) | null | undefined;
};

const subscribe = () => () => undefined;
const getClientSnapshot = () => typeof document !== "undefined";
const getServerSnapshot = () => false;
const useClientLayoutEffect = typeof document === "undefined" ? useEffect : useLayoutEffect;

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
 * destination changes or the component unmounts. React context and synthetic
 * events continue through the logical tree, including for cross-document targets.
 *
 * @public
 */
export function Portal({ children, container }: PortalProps) {
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const [, retryLazyContainer] = useReducer((attempt: number) => attempt + 1, 0);

  let target: PortalContainer | null | undefined = null;
  let shouldRetryLazyContainer = false;
  if (mounted) {
    target = document.body;
    if (typeof container === "function") {
      target = container();
      shouldRetryLazyContainer = !isPortalContainer(target);
    } else if (isPortalContainer(container)) {
      target = container;
    } else if (container === null) {
      target = null;
    }
  }

  useClientLayoutEffect(() => {
    // A ref-backed resolver can be empty during the first client render and
    // become available in the same commit. Retry once after refs are attached;
    // a persistently empty resolver remains an intentional inline fallback.
    if (mounted && shouldRetryLazyContainer) {
      retryLazyContainer();
    }
  }, [container, mounted, shouldRetryLazyContainer]);

  return isPortalContainer(target) ? createPortal(children, target) : <>{children}</>;
}
