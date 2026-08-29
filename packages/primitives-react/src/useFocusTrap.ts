"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";

/**
 * Configuration for the shared nested-modal focus manager.
 *
 * @public
 */
export type FocusTrapOptions = {
  /** Whether this trap participates in the global nested-trap stack. */
  active: boolean;
  /** Modal container whose tabbable descendants remain reachable. */
  containerRef: RefObject<HTMLElement | null>;
  /** Preferred initial target; falls back to the first tabbable descendant or the container. */
  initialFocusRef?: RefObject<HTMLElement | null> | undefined;
  /** Called for Escape only while this trap is the topmost active trap. */
  onEscape?: (() => void) | undefined;
  /** Restores focus captured when this trap activates. Defaults to `true`. */
  restoreFocus?: boolean;
  /** Explicit restoration target; otherwise the currently focused element is captured. */
  returnFocusRef?: RefObject<HTMLElement | null> | undefined;
};

type TrapEntry = { container: HTMLElement; token: symbol };
type IsolationSnapshot = { ariaHidden: string | null; inert: boolean };

const trapStack: TrapEntry[] = [];
const isolationSnapshots = new Map<HTMLElement, IsolationSnapshot>();
let isolationObserver: MutationObserver | null = null;
let isolationScheduled = false;
const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "summary",
  "[contenteditable]:not([contenteditable='false'])",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

function isVisible(element: HTMLElement) {
  if (element.closest("[hidden], [aria-hidden='true'], [inert]")) return false;
  let current: HTMLElement | null = element;
  while (current) {
    const style = window.getComputedStyle(current);
    if (style.display === "none" || style.visibility === "hidden") return false;
    current = current.parentElement;
  }
  return true;
}

function getFocusableElements(container: HTMLElement) {
  const candidates = Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) => element.tabIndex >= 0 && !element.matches(":disabled") && isVisible(element)
  );
  const radioFiltered = candidates.filter((element) => {
    if (!(element instanceof HTMLInputElement) || element.type !== "radio" || !element.name) {
      return true;
    }
    const group = candidates.filter(
      (candidate): candidate is HTMLInputElement =>
        candidate instanceof HTMLInputElement &&
        candidate.type === "radio" &&
        candidate.name === element.name &&
        candidate.form === element.form
    );
    const checked = group.find((candidate) => candidate.checked);
    return checked ? checked === element : group[0] === element;
  });
  const documentOrder = new Map(radioFiltered.map((element, index) => [element, index]));
  return radioFiltered.sort((left, right) => {
    const leftTabIndex = left.tabIndex;
    const rightTabIndex = right.tabIndex;
    if (leftTabIndex > 0 || rightTabIndex > 0) {
      if (leftTabIndex <= 0) return 1;
      if (rightTabIndex <= 0) return -1;
      if (leftTabIndex !== rightTabIndex) return leftTabIndex - rightTabIndex;
    }
    return (documentOrder.get(left) || 0) - (documentOrder.get(right) || 0);
  });
}

function restoreIsolation() {
  isolationSnapshots.forEach((snapshot, element) => {
    if (snapshot.inert) element.setAttribute("inert", "");
    else element.removeAttribute("inert");
    if (snapshot.ariaHidden === null) element.removeAttribute("aria-hidden");
    else element.setAttribute("aria-hidden", snapshot.ariaHidden);
    element.removeAttribute("data-meu-modal-isolated");
  });
  isolationSnapshots.clear();
}

function isolateElement(element: HTMLElement) {
  if (!isolationSnapshots.has(element)) {
    isolationSnapshots.set(element, {
      ariaHidden: element.getAttribute("aria-hidden"),
      inert: element.hasAttribute("inert")
    });
  }
  element.setAttribute("inert", "");
  element.setAttribute("aria-hidden", "true");
  element.setAttribute("data-meu-modal-isolated", "true");
}

function overlayRoot(element: HTMLElement) {
  return element.closest<HTMLElement>("[data-meu-overlay-layer]") || element;
}

function collectAllowedRoots(container: HTMLElement) {
  const ownerDocument = container.ownerDocument;
  const roots = new Set<HTMLElement>([overlayRoot(container)]);
  ownerDocument.querySelectorAll<HTMLElement>("[data-meu-focus-branch]").forEach((branch) => {
    const referenceId = branch.getAttribute("data-meu-focus-branch");
    const reference = referenceId ? ownerDocument.getElementById(referenceId) : null;
    if (reference && container.contains(reference)) roots.add(branch);
  });
  container.querySelectorAll<HTMLElement>("[aria-controls]").forEach((controller) => {
    const ids = (controller.getAttribute("aria-controls") || "").split(/\s+/).filter(Boolean);
    ids.forEach((id) => {
      const controlled = ownerDocument.getElementById(id);
      if (controlled) roots.add(overlayRoot(controlled));
    });
  });
  ownerDocument
    .querySelectorAll<HTMLElement>("[data-meu-overlay-layer='toast']:not([hidden])")
    .forEach((toast) => roots.add(toast));
  return roots;
}

function applyModalIsolation() {
  restoreIsolation();
  const top = trapStack[trapStack.length - 1];
  if (!top || !top.container.isConnected) return;
  const ownerDocument = top.container.ownerDocument;
  const body = ownerDocument.body;
  const allowedRoots = collectAllowedRoots(top.container);
  const allowedAncestors = new Set<HTMLElement>();
  allowedRoots.forEach((root) => {
    let current: HTMLElement | null = root;
    while (current && current !== body) {
      allowedAncestors.add(current);
      current = current.parentElement;
    }
  });

  const isolateSiblings = (parent: HTMLElement) => {
    Array.from(parent.children).forEach((child) => {
      if (!(child instanceof HTMLElement)) return;
      if (allowedRoots.has(child)) return;
      if (allowedAncestors.has(child)) isolateSiblings(child);
      else isolateElement(child);
    });
  };
  isolateSiblings(body);
}

function startIsolationObserver(ownerDocument: Document) {
  if (isolationObserver || typeof MutationObserver === "undefined") return;
  isolationObserver = new MutationObserver(() => {
    if (isolationScheduled) return;
    isolationScheduled = true;
    void Promise.resolve().then(() => {
      isolationScheduled = false;
      applyModalIsolation();
    });
  });
  isolationObserver.observe(ownerDocument.body, { childList: true, subtree: true });
}

function stopIsolationObserver() {
  if (isolationObserver) isolationObserver.disconnect();
  isolationObserver = null;
  isolationScheduled = false;
}

function isFocusBranchForContainer(container: HTMLElement, target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  const branch = target.closest<HTMLElement>("[data-meu-focus-branch]");
  if (!branch) return false;
  const referenceId = branch.getAttribute("data-meu-focus-branch");
  if (!referenceId) return false;
  const reference = document.getElementById(referenceId);
  return reference ? container.contains(reference) : false;
}

function getToastFocusableElements(container: HTMLElement) {
  const elements: HTMLElement[] = [];
  container.ownerDocument
    .querySelectorAll<HTMLElement>("[data-meu-overlay-layer='toast']:not([hidden])")
    .forEach((toast) => elements.push(...getFocusableElements(toast)));
  return elements;
}

function isToastFocusTarget(container: HTMLElement, target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  const toast = target.closest<HTMLElement>("[data-meu-overlay-layer='toast']:not([hidden])");
  return toast !== null && toast.ownerDocument === container.ownerDocument;
}

function isTopTrap(token: symbol) {
  const top = trapStack[trapStack.length - 1];
  return top !== undefined && top.token === token;
}

/**
 * Traps focus inside the topmost active modal while allowing registered non-modal focus branches.
 *
 * @public
 */
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
        preferred && container.contains(preferred) && isVisible(preferred)
          ? preferred
          : focusable[0] || container;
      target.focus({ preventScroll: true });
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!container || !isTopTrap(token)) return;
      if (isFocusBranchForContainer(container, document.activeElement)) return;
      if (event.key === "Escape" && escapeRef.current) {
        event.preventDefault();
        event.stopPropagation();
        escapeRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const containerFocusable = getFocusableElements(container);
      const toastFocusable = getToastFocusableElements(container);
      const focusable = [...containerFocusable, ...toastFocusable];
      if (focusable.length === 0) {
        event.preventDefault();
        container.focus({ preventScroll: true });
        return;
      }
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const activeElement = document.activeElement;
      const activeIndex = focusable.findIndex((element) => element === activeElement);
      if (
        activeIndex < 0 &&
        activeElement !== container &&
        (!activeElement ||
          !container.contains(activeElement) ||
          isToastFocusTarget(container, activeElement))
      ) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus({ preventScroll: true });
        return;
      }
      if (toastFocusable.length > 0 && activeIndex >= 0) {
        const nextIndex = event.shiftKey
          ? (activeIndex - 1 + focusable.length) % focusable.length
          : (activeIndex + 1) % focusable.length;
        const nextElement = focusable[nextIndex]!;
        const crossingToastBoundary =
          isToastFocusTarget(container, activeElement) ||
          isToastFocusTarget(container, nextElement) ||
          nextIndex === 0 ||
          nextIndex === focusable.length - 1;
        if (crossingToastBoundary) {
          event.preventDefault();
          nextElement.focus({ preventScroll: true });
          return;
        }
      }
      if (event.shiftKey && (activeElement === first || activeElement === container)) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    const onFocusIn = (event: FocusEvent) => {
      if (
        !container ||
        !isTopTrap(token) ||
        container.contains(event.target as Node) ||
        isFocusBranchForContainer(container, event.target) ||
        isToastFocusTarget(container, event.target)
      )
        return;
      focusFirst();
    };

    const activate = () => {
      container = containerRef.current;
      if (!container) {
        frame = window.requestAnimationFrame(activate);
        return;
      }
      activated = true;
      trapStack.push({ container, token });
      startIsolationObserver(container.ownerDocument);
      applyModalIsolation();
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
        if (trapStack.length === 0) stopIsolationObserver();
        applyModalIsolation();
      }
      if (restoreFocus && previousFocus && previousFocus.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, [active, containerRef, initialFocusRef, restoreFocus, returnFocusRef]);
}
