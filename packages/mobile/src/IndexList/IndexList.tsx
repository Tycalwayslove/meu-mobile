"use client";

import { useEffect, useId, useImperativeHandle, useRef, useState } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  TouchEvent as ReactTouchEvent
} from "react";

import { useMeuConfig } from "../ConfigProvider";
import { body, content, heading, indexButton, rail, root, section, status } from "./IndexList.css";
import type {
  IndexListChangeDetails,
  IndexListProps,
  IndexListScrollOptions,
  IndexListSection
} from "./types";

type IndexInputEvent = NonNullable<IndexListChangeDetails["event"]>;

function uniqueSections(sections: readonly IndexListSection[]): IndexListSection[] {
  const keys = new Set<string>();
  return sections.filter((candidate) => {
    if (keys.has(candidate.key)) return false;
    keys.add(candidate.key);
    return true;
  });
}

function keyIdSuffix(key: string): string {
  if (key.length === 0) return "empty";
  return Array.from(key)
    .map((character) => {
      const codePoint = character.codePointAt(0);
      return codePoint === undefined ? "0" : codePoint.toString(16);
    })
    .join("-");
}

function sectionTop(sectionNode: HTMLElement): number {
  return sectionNode.offsetTop;
}

/**
 * Renders a bounded, sectioned list with an accessible keyboard and touch index rail.
 *
 * @public
 */
export function IndexList({
  activeKey: activeKeyProp,
  className,
  defaultActiveKey,
  indexAriaLabel,
  onIndexChange,
  ref,
  sections,
  sticky = true,
  ...props
}: IndexListProps) {
  const { locale, motion } = useMeuConfig();
  const generatedId = useId();
  const normalizedSections = uniqueSections(sections);
  const firstSection = normalizedSections[0];
  const firstKey = firstSection ? firstSection.key : null;
  const controlled = activeKeyProp !== undefined;
  const validDefault = normalizedSections.some((candidate) => candidate.key === defaultActiveKey);
  const [uncontrolledActiveKey, setUncontrolledActiveKey] = useState<string | null>(() =>
    validDefault && defaultActiveKey !== undefined ? defaultActiveKey : firstKey
  );
  const normalizedUncontrolledKey = normalizedSections.some(
    (candidate) => candidate.key === uncontrolledActiveKey
  )
    ? uncontrolledActiveKey
    : firstKey;
  if (!controlled && uncontrolledActiveKey !== normalizedUncontrolledKey) {
    setUncontrolledActiveKey(normalizedUncontrolledKey);
  }
  const activeKey = controlled
    ? normalizedSections.some((candidate) => candidate.key === activeKeyProp)
      ? activeKeyProp !== null && activeKeyProp !== undefined
        ? activeKeyProp
        : firstKey
      : firstKey
    : normalizedUncontrolledKey;
  const rovingKey = activeKey !== null ? activeKey : firstKey;
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const railRef = useRef<HTMLElement | null>(null);
  const sectionRefs = useRef(new Map<string, HTMLElement>());
  const indexRefs = useRef(new Map<string, HTMLButtonElement>());
  const indexRefCallbacks = useRef(new Map<string, (node: HTMLButtonElement | null) => void>());
  const pendingFocusRecoveryRef = useRef(false);
  const activeKeyRef = useRef<string | null>(activeKey);
  const programmaticKeyRef = useRef<string | null>(null);
  const programmaticIdleTimerRef = useRef<number | null>(null);
  const programmaticHardTimerRef = useRef<number | null>(null);
  const controlledRollbackTimerRef = useRef<number | null>(null);
  const initialUncontrolledAlignmentRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const touchIdRef = useRef<number | null>(null);
  const gestureKeyRef = useRef<string | null>(null);
  const compatClickUntilRef = useRef(0);
  const globalPointerCleanupRef = useRef<(() => void) | null>(null);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    activeKeyRef.current = activeKey;
  }, [activeKey]);

  const resolvedIndexLabel = indexAriaLabel || (locale === "en-US" ? "Section index" : "分组索引");
  const contentLabel = locale === "en-US" ? "Indexed content" : "索引内容";
  const sectionFallbackLabel = (position: number) =>
    locale === "en-US" ? `Section ${position}` : `第 ${position} 组`;

  function accessibleSectionName(candidate: IndexListSection, position: number) {
    return candidate.ariaLabel || candidate.key || sectionFallbackLabel(position);
  }

  function clearProgrammaticTracking() {
    if (programmaticIdleTimerRef.current !== null) {
      window.clearTimeout(programmaticIdleTimerRef.current);
      programmaticIdleTimerRef.current = null;
    }
    if (programmaticHardTimerRef.current !== null) {
      window.clearTimeout(programmaticHardTimerRef.current);
      programmaticHardTimerRef.current = null;
    }
    programmaticKeyRef.current = null;
  }

  function startProgrammaticTracking(key: string, behavior: ScrollBehavior) {
    clearProgrammaticTracking();
    programmaticKeyRef.current = key;
    programmaticHardTimerRef.current = window.setTimeout(
      clearProgrammaticTracking,
      behavior === "smooth" ? 1500 : 100
    );
  }

  function effectiveBehavior(requested: ScrollBehavior | undefined): ScrollBehavior {
    const behavior = requested || "auto";
    if (behavior !== "smooth") return behavior;
    if (motion === "reduced") return "auto";
    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return "auto";
    }
    return behavior;
  }

  function scrollBodyToKey(key: string, requestedBehavior?: ScrollBehavior) {
    const scroller = bodyRef.current;
    const target = sectionRefs.current.get(key);
    if (!scroller || !target) return false;
    const behavior = effectiveBehavior(requestedBehavior);
    startProgrammaticTracking(key, behavior);
    scroller.scrollTo({ top: sectionTop(target), behavior });
    return true;
  }

  function scheduleControlledRollback(requestedKey: string) {
    if (!controlled) return;
    if (controlledRollbackTimerRef.current !== null) {
      window.clearTimeout(controlledRollbackTimerRef.current);
    }
    controlledRollbackTimerRef.current = window.setTimeout(() => {
      controlledRollbackTimerRef.current = null;
      if (activeKeyRef.current === requestedKey) return;
      const authoritativeKey = activeKeyRef.current;
      if (authoritativeKey !== null) scrollBodyToKey(authoritativeKey, "auto");
    }, 0);
  }

  function updateActive(key: string, details: IndexListChangeDetails) {
    if (activeKeyRef.current === key) return;
    if (!controlled) {
      activeKeyRef.current = key;
      setUncontrolledActiveKey(key);
    }
    if (details.source !== "scroll") {
      const position = normalizedSections.findIndex((candidate) => candidate.key === key);
      const candidate = position >= 0 ? normalizedSections[position] : undefined;
      if (candidate) {
        const name = accessibleSectionName(candidate, position + 1);
        setAnnouncement(locale === "en-US" ? `Moved to ${name}` : `已定位到${name}`);
      }
    }
    if (onIndexChange) onIndexChange(key, details);
    scheduleControlledRollback(key);
  }

  function scrollToSection(
    key: string,
    options: IndexListScrollOptions = {},
    details: IndexListChangeDetails = { source: "imperative" }
  ) {
    if (!scrollBodyToKey(key, options.behavior)) return false;
    updateActive(key, details);
    if (options.focusIndex) {
      const indexTarget = indexRefs.current.get(key);
      if (indexTarget) indexTarget.focus();
    }
    return true;
  }

  useImperativeHandle(ref, () => ({ scrollTo: scrollToSection }));

  const sectionKeySignature = JSON.stringify(normalizedSections.map((candidate) => candidate.key));
  useEffect(() => {
    if (!controlled || activeKey === null) return;
    scrollBodyToKey(activeKey, "auto");
    // scrollBodyToKey intentionally follows the latest rendered section nodes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey, controlled, sectionKeySignature]);

  useEffect(() => {
    if (controlled || initialUncontrolledAlignmentRef.current) return;
    initialUncontrolledAlignmentRef.current = true;
    if (validDefault && activeKey !== null) scrollBodyToKey(activeKey, "auto");
    // This effect applies the initial default once; later active changes already own their scroll.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey, controlled, validDefault]);

  useEffect(() => {
    if (rovingKey === null) return;
    const railNode = railRef.current;
    const target = indexRefs.current.get(rovingKey);
    if (!railNode || !target) return;
    if (pendingFocusRecoveryRef.current) {
      pendingFocusRecoveryRef.current = false;
      target.focus();
    }
    const railRect = railNode.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    if (railRect.height <= 0 || targetRect.height <= 0) return;
    if (targetRect.top < railRect.top) railNode.scrollTop += targetRect.top - railRect.top;
    else if (targetRect.bottom > railRect.bottom) {
      railNode.scrollTop += targetRect.bottom - railRect.bottom;
    }
  }, [rovingKey, sectionKeySignature]);

  useEffect(() => {
    const currentKeys = new Set(normalizedSections.map((candidate) => candidate.key));
    for (const key of indexRefCallbacks.current.keys()) {
      if (!currentKeys.has(key)) indexRefCallbacks.current.delete(key);
    }
    // The primitive signature represents the normalized key set without rerunning on content renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionKeySignature]);

  useEffect(
    () => () => {
      clearProgrammaticTracking();
      if (controlledRollbackTimerRef.current !== null) {
        window.clearTimeout(controlledRollbackTimerRef.current);
      }
      const cleanupGlobalPointer = globalPointerCleanupRef.current;
      if (cleanupGlobalPointer) cleanupGlobalPointer();
    },
    []
  );

  function handleScroll() {
    const scroller = bodyRef.current;
    if (!scroller || normalizedSections.length === 0) return;
    const programmaticKey = programmaticKeyRef.current;
    if (programmaticKey !== null) {
      const target = sectionRefs.current.get(programmaticKey);
      if (target && Math.abs(scroller.scrollTop - sectionTop(target)) <= 1) {
        clearProgrammaticTracking();
      } else {
        if (programmaticIdleTimerRef.current !== null) {
          window.clearTimeout(programmaticIdleTimerRef.current);
        }
        programmaticIdleTimerRef.current = window.setTimeout(clearProgrammaticTracking, 150);
      }
      return;
    }
    const scrollTop = scroller.scrollTop + 1;
    const firstCandidate = normalizedSections[0];
    let nextKey = firstCandidate ? firstCandidate.key : null;
    for (const candidate of normalizedSections) {
      const node = sectionRefs.current.get(candidate.key);
      if (!node || sectionTop(node) > scrollTop) break;
      nextKey = candidate.key;
    }
    if (nextKey) updateActive(nextKey, { source: "scroll" });
  }

  function cancelProgrammaticScrollForUser() {
    const scroller = bodyRef.current;
    if (programmaticKeyRef.current === null || !scroller) return;
    scroller.scrollTo({ top: scroller.scrollTop, behavior: "auto" });
    clearProgrammaticTracking();
  }

  function handleIndexKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, key: string) {
    if (normalizedSections.length === 0) return;
    const currentIndex = normalizedSections.findIndex((candidate) => candidate.key === key);
    let targetIndex = -1;
    if (event.key === "ArrowDown") {
      targetIndex = (currentIndex + 1 + normalizedSections.length) % normalizedSections.length;
    } else if (event.key === "ArrowUp") {
      targetIndex = (currentIndex - 1 + normalizedSections.length) % normalizedSections.length;
    } else if (event.key === "Home") {
      targetIndex = 0;
    } else if (event.key === "End") {
      targetIndex = normalizedSections.length - 1;
    }
    if (targetIndex < 0) return;
    const target = normalizedSections[targetIndex];
    if (!target) return;
    event.preventDefault();
    scrollToSection(target.key, { focusIndex: true }, { event, source: "index" });
  }

  function keyAtPointer(clientY: number) {
    let nearestKey: string | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const candidate of normalizedSections) {
      const node = indexRefs.current.get(candidate.key);
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

  function selectAtClientY(clientY: number, event?: IndexInputEvent) {
    const key = keyAtPointer(clientY);
    if (!key || key === gestureKeyRef.current) return;
    gestureKeyRef.current = key;
    scrollToSection(key, {}, event ? { event, source: "index" } : { source: "index" });
  }

  function clearPointer() {
    pointerIdRef.current = null;
    gestureKeyRef.current = null;
    const cleanupGlobalPointer = globalPointerCleanupRef.current;
    if (cleanupGlobalPointer) cleanupGlobalPointer();
    globalPointerCleanupRef.current = null;
  }

  function installGlobalPointerFallback() {
    const handleMove = (event: globalThis.PointerEvent) => {
      if (pointerIdRef.current !== event.pointerId) return;
      selectAtClientY(event.clientY);
      if (event.cancelable) event.preventDefault();
    };
    const handleEnd = (event: globalThis.PointerEvent) => {
      if (pointerIdRef.current === event.pointerId) clearPointer();
    };
    window.addEventListener("pointermove", handleMove, { passive: false });
    window.addEventListener("pointerup", handleEnd);
    window.addEventListener("pointercancel", handleEnd);
    globalPointerCleanupRef.current = () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleEnd);
      window.removeEventListener("pointercancel", handleEnd);
    };
  }

  function finishPointer(event: ReactPointerEvent<HTMLElement>) {
    if (pointerIdRef.current !== event.pointerId) return;
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
    clearPointer();
  }

  function touchById(event: ReactTouchEvent<HTMLElement>, identifier: number) {
    for (let index = 0; index < event.changedTouches.length; index += 1) {
      const touch = event.changedTouches[index];
      if (touch && touch.identifier === identifier) return touch;
    }
    for (let index = 0; index < event.touches.length; index += 1) {
      const touch = event.touches[index];
      if (touch && touch.identifier === identifier) return touch;
    }
    return null;
  }

  function indexRefFor(key: string) {
    const existingCallback = indexRefCallbacks.current.get(key);
    if (existingCallback) return existingCallback;
    const callback = (node: HTMLButtonElement | null) => {
      if (node) {
        indexRefs.current.set(key, node);
        return;
      }
      const previousNode = indexRefs.current.get(key);
      if (previousNode && document.activeElement === previousNode) {
        pendingFocusRecoveryRef.current = true;
      }
      indexRefs.current.delete(key);
    };
    indexRefCallbacks.current.set(key, callback);
    return callback;
  }

  const classes = className ? `${root} ${className}` : root;

  return (
    <div
      {...props}
      className={classes}
      data-empty={normalizedSections.length === 0 ? "true" : undefined}
      data-meu-component="index-list"
    >
      {/* The region is a focusable native scroll viewport and must observe user input to cancel a smooth command. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        ref={bodyRef}
        className={body}
        aria-label={contentLabel}
        role="region"
        tabIndex={normalizedSections.length > 0 ? 0 : undefined}
        onKeyDown={cancelProgrammaticScrollForUser}
        onPointerDown={cancelProgrammaticScrollForUser}
        onScroll={handleScroll}
        onTouchStart={cancelProgrammaticScrollForUser}
        onWheel={cancelProgrammaticScrollForUser}
        data-meu-index-list-body
      >
        {normalizedSections.map((candidate) => {
          const idSuffix = keyIdSuffix(candidate.key);
          const sectionId = `${generatedId}-section-${idSuffix}`;
          const headingId = `${generatedId}-heading-${idSuffix}`;
          return (
            <section
              ref={(node) => {
                if (node) sectionRefs.current.set(candidate.key, node);
                else sectionRefs.current.delete(candidate.key);
              }}
              id={sectionId}
              className={section}
              data-index-key={candidate.key}
              aria-labelledby={headingId}
              key={candidate.key}
            >
              <div id={headingId} className={heading({ sticky })}>
                {candidate.title !== undefined ? candidate.title : candidate.key}
              </div>
              <div className={content}>{candidate.content}</div>
            </section>
          );
        })}
      </div>
      {normalizedSections.length > 0 ? (
        <nav
          ref={railRef}
          className={rail}
          aria-label={resolvedIndexLabel}
          onPointerDown={(event) => {
            if ((event.pointerType && !event.isPrimary) || event.button !== 0) return;
            const cleanupGlobalPointer = globalPointerCleanupRef.current;
            if (cleanupGlobalPointer) cleanupGlobalPointer();
            pointerIdRef.current = event.pointerId;
            gestureKeyRef.current = null;
            compatClickUntilRef.current = Date.now() + 800;
            let captured = false;
            try {
              if (typeof event.currentTarget.setPointerCapture === "function") {
                event.currentTarget.setPointerCapture(event.pointerId);
                captured =
                  typeof event.currentTarget.hasPointerCapture !== "function" ||
                  event.currentTarget.hasPointerCapture(event.pointerId);
              }
            } catch {
              // Global listeners below preserve drag selection when capture is unavailable.
            }
            if (!captured) installGlobalPointerFallback();
            selectAtClientY(event.clientY, event);
            event.preventDefault();
          }}
          onPointerMove={(event) => {
            if (pointerIdRef.current !== event.pointerId) return;
            selectAtClientY(event.clientY, event);
            event.preventDefault();
          }}
          onPointerUp={finishPointer}
          onPointerCancel={finishPointer}
          onLostPointerCapture={(event) => {
            if (pointerIdRef.current === event.pointerId) clearPointer();
          }}
          onTouchStart={(event) => {
            if (pointerIdRef.current !== null || touchIdRef.current !== null) return;
            const touch = event.changedTouches[0];
            if (!touch) return;
            touchIdRef.current = touch.identifier;
            gestureKeyRef.current = null;
            compatClickUntilRef.current = Date.now() + 800;
            selectAtClientY(touch.clientY, event);
            event.preventDefault();
          }}
          onTouchMove={(event) => {
            const touchId = touchIdRef.current;
            if (touchId === null) return;
            const touch = touchById(event, touchId);
            if (!touch) return;
            selectAtClientY(touch.clientY, event);
            event.preventDefault();
          }}
          onTouchEnd={(event) => {
            const touchId = touchIdRef.current;
            if (touchId === null || !touchById(event, touchId)) return;
            touchIdRef.current = null;
            gestureKeyRef.current = null;
          }}
          onTouchCancel={() => {
            touchIdRef.current = null;
            gestureKeyRef.current = null;
          }}
        >
          {normalizedSections.map((candidate, index) => {
            const current = candidate.key === activeKey;
            const tabbable = candidate.key === rovingKey;
            const idSuffix = keyIdSuffix(candidate.key);
            return (
              <button
                ref={indexRefFor(candidate.key)}
                type="button"
                className={indexButton({ active: current })}
                aria-controls={`${generatedId}-section-${idSuffix}`}
                aria-current={current ? "location" : undefined}
                aria-label={accessibleSectionName(candidate, index + 1)}
                tabIndex={tabbable ? 0 : -1}
                onKeyDown={(event) => handleIndexKeyDown(event, candidate.key)}
                onClick={(event) => {
                  if (event.detail > 0 && Date.now() <= compatClickUntilRef.current) {
                    compatClickUntilRef.current = 0;
                    return;
                  }
                  scrollToSection(candidate.key, {}, { event, source: "index" });
                }}
                key={candidate.key}
              >
                {candidate.brief !== undefined ? candidate.brief : candidate.key.charAt(0)}
              </button>
            );
          })}
        </nav>
      ) : null}
      <span className={status} role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </span>
    </div>
  );
}
