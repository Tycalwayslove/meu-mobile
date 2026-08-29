"use client";

import { useEffect, useId, useImperativeHandle, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from "react";

import { useMeuConfig } from "../ConfigProvider";
import { body, content, heading, indexButton, rail, root, section } from "./IndexList.css";
import type { IndexListChangeDetails, IndexListProps, IndexListScrollOptions } from "./types";

/**
 * Renders a bounded, sectioned list with an accessible keyboard and touch index rail.
 *
 * @public
 */
export function IndexList({
  className,
  indexAriaLabel,
  onIndexChange,
  ref,
  sections,
  sticky = true,
  ...props
}: IndexListProps) {
  const { locale } = useMeuConfig();
  const generatedId = useId();
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const indexRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const programmaticKeyRef = useRef<string | null>(null);
  const programmaticTimerRef = useRef<number | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const initialKey = sections.length > 0 && sections[0] ? sections[0].key : null;
  const activeKeyRef = useRef<string | null>(initialKey);
  const [activeKey, setActiveKey] = useState<string | null>(initialKey);
  const resolvedIndexLabel = indexAriaLabel || (locale === "en-US" ? "Section index" : "分组索引");

  function updateActive(key: string, details: IndexListChangeDetails) {
    if (activeKeyRef.current === key) return;
    activeKeyRef.current = key;
    setActiveKey(key);
    if (onIndexChange) onIndexChange(key, details);
  }

  function scrollToSection(
    key: string,
    options: IndexListScrollOptions = {},
    details: IndexListChangeDetails = { source: "index" }
  ) {
    const scroller = bodyRef.current;
    const target = sectionRefs.current[key];
    if (!scroller || !target) return false;
    if (programmaticTimerRef.current !== null) {
      window.clearTimeout(programmaticTimerRef.current);
    }
    programmaticKeyRef.current = key;
    scroller.scrollTo({ top: target.offsetTop, behavior: options.behavior || "auto" });
    programmaticTimerRef.current = window.setTimeout(
      () => {
        programmaticKeyRef.current = null;
        programmaticTimerRef.current = null;
      },
      options.behavior === "smooth" ? 600 : 200
    );
    updateActive(key, details);
    if (options.focusIndex) {
      const indexTarget = indexRefs.current[key];
      if (indexTarget) indexTarget.focus();
    }
    return true;
  }

  useImperativeHandle(ref, () => ({ scrollTo: scrollToSection }));

  useEffect(
    () => () => {
      if (programmaticTimerRef.current !== null) {
        window.clearTimeout(programmaticTimerRef.current);
      }
    },
    []
  );

  function handleScroll() {
    const scroller = bodyRef.current;
    if (!scroller || sections.length === 0) return;
    if (programmaticKeyRef.current !== null) return;
    const scrollTop = scroller.scrollTop + 1;
    let nextKey = sections[0] ? sections[0].key : null;
    for (const candidate of sections) {
      const node = sectionRefs.current[candidate.key];
      if (!node || node.offsetTop > scrollTop) break;
      nextKey = candidate.key;
    }
    if (nextKey) updateActive(nextKey, { source: "scroll" });
  }

  function handleIndexKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, key: string) {
    if (sections.length === 0) return;
    const currentIndex = sections.findIndex((candidate) => candidate.key === key);
    let targetIndex = -1;
    if (event.key === "ArrowDown") {
      targetIndex = (currentIndex + 1 + sections.length) % sections.length;
    } else if (event.key === "ArrowUp") {
      targetIndex = (currentIndex - 1 + sections.length) % sections.length;
    } else if (event.key === "Home") {
      targetIndex = 0;
    } else if (event.key === "End") {
      targetIndex = sections.length - 1;
    }
    if (targetIndex < 0) return;
    const target = sections[targetIndex];
    if (!target) return;
    event.preventDefault();
    scrollToSection(target.key, { focusIndex: true }, { event, source: "index" });
  }

  function keyAtPointer(clientY: number) {
    let nearestKey: string | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const candidate of sections) {
      const node = indexRefs.current[candidate.key];
      if (!node) continue;
      const rect = node.getBoundingClientRect();
      const distance =
        clientY < rect.top ? rect.top - clientY : clientY > rect.bottom ? clientY - rect.bottom : 0;
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestKey = candidate.key;
      }
    }
    return nearestKey;
  }

  function selectAtPointer(event: ReactPointerEvent<HTMLElement>) {
    const key = keyAtPointer(event.clientY);
    if (!key || key === activeKeyRef.current) return;
    scrollToSection(key, {}, { event, source: "index" });
  }

  function finishPointer(event: ReactPointerEvent<HTMLElement>) {
    if (pointerIdRef.current !== event.pointerId) return;
    pointerIdRef.current = null;
    try {
      if (
        typeof event.currentTarget.hasPointerCapture === "function" &&
        typeof event.currentTarget.releasePointerCapture === "function" &&
        event.currentTarget.hasPointerCapture(event.pointerId)
      ) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {
      // Old WebViews can lose capture between the check and release.
    }
  }

  const classes = className ? `${root} ${className}` : root;
  const displayedActiveKey = sections.some((candidate) => candidate.key === activeKey)
    ? activeKey
    : initialKey;

  return (
    <div {...props} className={classes} data-meu-component="index-list">
      <div
        ref={bodyRef}
        className={body}
        aria-label="索引内容"
        role="region"
        tabIndex={0}
        onScroll={handleScroll}
        data-meu-index-list-body
      >
        {sections.map((candidate, index) => (
          <section
            ref={(node) => {
              sectionRefs.current[candidate.key] = node;
            }}
            className={section}
            data-index-key={candidate.key}
            aria-labelledby={`${generatedId}-section-${index}`}
            key={candidate.key}
          >
            <div id={`${generatedId}-section-${index}`} className={heading({ sticky })}>
              {candidate.title !== undefined ? candidate.title : candidate.key}
            </div>
            <div className={content}>{candidate.content}</div>
          </section>
        ))}
      </div>
      <nav
        className={rail}
        aria-label={resolvedIndexLabel}
        onPointerDown={(event) => {
          if ((event.pointerType && !event.isPrimary) || event.button !== 0) return;
          pointerIdRef.current = event.pointerId;
          try {
            event.currentTarget.setPointerCapture(event.pointerId);
          } catch {
            // Pointer capture is an enhancement; buttons remain fully operable without it.
          }
          selectAtPointer(event);
          event.preventDefault();
        }}
        onPointerMove={(event) => {
          if (pointerIdRef.current !== event.pointerId) return;
          selectAtPointer(event);
          event.preventDefault();
        }}
        onPointerUp={finishPointer}
        onPointerCancel={finishPointer}
        onLostPointerCapture={(event) => {
          if (pointerIdRef.current === event.pointerId) pointerIdRef.current = null;
        }}
      >
        {sections.map((candidate) => {
          const active = candidate.key === displayedActiveKey;
          return (
            <button
              ref={(node) => {
                indexRefs.current[candidate.key] = node;
              }}
              type="button"
              className={indexButton({ active })}
              aria-current={active ? "location" : undefined}
              aria-label={candidate.ariaLabel || candidate.key}
              tabIndex={active ? 0 : -1}
              onKeyDown={(event) => handleIndexKeyDown(event, candidate.key)}
              onClick={(event) => {
                scrollToSection(candidate.key, {}, { event, source: "index" });
              }}
              key={candidate.key}
            >
              {candidate.brief !== undefined ? candidate.brief : candidate.key.charAt(0)}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
