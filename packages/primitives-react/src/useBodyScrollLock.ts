"use client";

import { useEffect, useRef } from "react";

type BodyStyleSnapshot = {
  left: string;
  overflow: string;
  paddingLeft: string;
  paddingRight: string;
  position: string;
  right: string;
  top: string;
  width: string;
};

const activeLocks = new Set<symbol>();
let savedScrollY = 0;
let savedStyles: BodyStyleSnapshot | null = null;

function acquireLock(token: symbol) {
  if (activeLocks.has(token)) return;
  activeLocks.add(token);
  if (activeLocks.size > 1 || typeof document === "undefined") return;

  const body = document.body;
  savedScrollY = typeof window === "undefined" ? 0 : window.scrollY;
  savedStyles = {
    left: body.style.left,
    overflow: body.style.overflow,
    paddingLeft: body.style.paddingLeft,
    paddingRight: body.style.paddingRight,
    position: body.style.position,
    right: body.style.right,
    top: body.style.top,
    width: body.style.width
  };

  const scrollbarWidth =
    typeof window === "undefined"
      ? 0
      : Math.max(0, window.innerWidth - document.documentElement.clientWidth);
  if (scrollbarWidth > 0) {
    const computedStyle = window.getComputedStyle(body);
    if (computedStyle.direction === "rtl") {
      const currentPadding = Number.parseFloat(computedStyle.paddingLeft) || 0;
      body.style.paddingLeft = `${currentPadding + scrollbarWidth}px`;
    } else {
      const currentPadding = Number.parseFloat(computedStyle.paddingRight) || 0;
      body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    }
  }
  body.style.position = "fixed";
  body.style.top = `${-savedScrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  body.style.overflow = "hidden";
  body.setAttribute("data-meu-scroll-locked", "true");
}

function releaseLock(token: symbol) {
  if (!activeLocks.delete(token) || activeLocks.size > 0 || typeof document === "undefined") return;

  const body = document.body;
  const snapshot = savedStyles;
  if (snapshot) {
    body.style.left = snapshot.left;
    body.style.overflow = snapshot.overflow;
    body.style.paddingLeft = snapshot.paddingLeft;
    body.style.paddingRight = snapshot.paddingRight;
    body.style.position = snapshot.position;
    body.style.right = snapshot.right;
    body.style.top = snapshot.top;
    body.style.width = snapshot.width;
  }
  body.removeAttribute("data-meu-scroll-locked");
  if (typeof window !== "undefined" && window.scrollY !== savedScrollY) {
    window.scrollTo(0, savedScrollY);
  }
  savedStyles = null;
}

/**
 * Reference-counted body scroll lock for modal overlays.
 *
 * The first active caller snapshots body styles and scroll position; the final caller restores
 * them. Scrollbar compensation follows the document direction.
 *
 * @public
 */
export function useBodyScrollLock(locked: boolean) {
  const tokenRef = useRef<symbol>(undefined);
  if (tokenRef.current === undefined) tokenRef.current = Symbol("meu-body-scroll-lock");

  useEffect(() => {
    const token = tokenRef.current;
    if (!locked || token === undefined) return undefined;
    acquireLock(token);
    return () => releaseLock(token);
  }, [locked]);
}
