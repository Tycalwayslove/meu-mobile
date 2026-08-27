"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";

export type FocusTrapOptions = {
  active: boolean;
  containerRef: RefObject<HTMLElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null> | undefined;
  onEscape?: (() => void) | undefined;
  restoreFocus?: boolean;
  returnFocusRef?: RefObject<HTMLElement | null> | undefined;
};

type TrapEntry = { token: symbol };

const trapStack: TrapEntry[] = [];
const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

function isVisible(element: HTMLElement) {
  if (element.hidden || element.getAttribute("aria-hidden") === "true") return false;
  const style = window.getComputedStyle(element);
  return style.display !== "none" && style.visibility !== "hidden";
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(isVisible);
}

function isTopTrap(token: symbol) {
  const top = trapStack[trapStack.length - 1];
  return top !== undefined && top.token === token;
}

export function useFocusTrap({
  active,
  containerRef,
  initialFocusRef,
  onEscape,
  restoreFocus = true,
  returnFocusRef
}: FocusTrapOptions) {
  const tokenRef = useRef<symbol>(undefined);
  const escapeRef = useRef(onEscape);
  escapeRef.current = onEscape;
  if (tokenRef.current === undefined) tokenRef.current = Symbol("meu-focus-trap");

  useEffect(() => {
    const token = tokenRef.current;
    if (!active || token === undefined) return undefined;

    const requestedReturnFocus = returnFocusRef ? returnFocusRef.current : null;
    const previousFocus =
      requestedReturnFocus ||
      (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    let container: HTMLElement | null = null;
    let activated = false;
    let frame = 0;

    const focusFirst = () => {
      if (!container) return;
      const preferred = initialFocusRef ? initialFocusRef.current : null;
      const focusable = getFocusableElements(container);
      const target =
        preferred && container.contains(preferred) ? preferred : focusable[0] || container;
      target.focus({ preventScroll: true });
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!container || !isTopTrap(token)) return;
      if (event.key === "Escape" && escapeRef.current) {
        event.preventDefault();
        event.stopPropagation();
        escapeRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = getFocusableElements(container);
      if (focusable.length === 0) {
        event.preventDefault();
        container.focus({ preventScroll: true });
        return;
      }
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === container)
      ) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    const onFocusIn = (event: FocusEvent) => {
      if (!container || !isTopTrap(token) || container.contains(event.target as Node)) return;
      focusFirst();
    };

    const activate = () => {
      container = containerRef.current;
      if (!container) {
        frame = window.requestAnimationFrame(activate);
        return;
      }
      activated = true;
      trapStack.push({ token });
      document.addEventListener("keydown", onKeyDown, true);
      document.addEventListener("focusin", onFocusIn, true);
      focusFirst();
    };

    frame = window.requestAnimationFrame(activate);

    return () => {
      window.cancelAnimationFrame(frame);
      if (activated) {
        document.removeEventListener("keydown", onKeyDown, true);
        document.removeEventListener("focusin", onFocusIn, true);
        const index = trapStack.findIndex((entry) => entry.token === token);
        if (index >= 0) trapStack.splice(index, 1);
      }
      if (restoreFocus && previousFocus && previousFocus.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, [active, containerRef, initialFocusRef, restoreFocus, returnFocusRef]);
}
