"use client";

/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- An overflowing region must receive keyboard focus so arrow keys can scroll it. */

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

export function isHorizontallyOverflowing(
  element: Pick<HTMLElement, "clientWidth" | "scrollWidth"> | null
) {
  return element !== null && element.scrollWidth > element.clientWidth;
}

export function ScrollableTableRegion({
  ariaLabel,
  children
}: {
  ariaLabel: string;
  children: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;

    const updateOverflow = () => setOverflowing(isHorizontallyOverflowing(element));
    updateOverflow();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateOverflow);
      return () => window.removeEventListener("resize", updateOverflow);
    }

    const observer = new ResizeObserver(updateOverflow);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="component-document__table-wrap"
      role={overflowing ? "region" : undefined}
      aria-label={overflowing ? ariaLabel : undefined}
      tabIndex={overflowing ? 0 : undefined}
    >
      {children}
    </div>
  );
}
