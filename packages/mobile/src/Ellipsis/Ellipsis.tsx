"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, Ref } from "react";

import { VisuallyHidden } from "../internal/VisuallyHidden";

import {
  action,
  ellipsisRoot,
  measure,
  measureAction,
  pendingClamp,
  visualText
} from "./Ellipsis.css";
import type { EllipsisDirection, EllipsisProps } from "./types";

type EllipsisStyle = CSSProperties & { "--meu-ellipsis-rows": number };
type EllipsisMeasurement = {
  collapsedContent: string;
  content: string;
  direction: EllipsisDirection;
  ellipsed: boolean;
  rows: number;
};

type IntlSegmenter = {
  segment: (content: string) => Iterable<{ segment: string }>;
};
type IntlSegmenterConstructor = new (
  locale?: string | readonly string[],
  options?: { granularity: "grapheme" }
) => IntlSegmenter;

function isCombiningCodePoint(value: number) {
  return (
    (value >= 0x0300 && value <= 0x036f) ||
    (value >= 0x1ab0 && value <= 0x1aff) ||
    (value >= 0x1dc0 && value <= 0x1dff) ||
    (value >= 0x20d0 && value <= 0x20ff) ||
    (value >= 0xfe20 && value <= 0xfe2f)
  );
}

function splitGraphemes(content: string) {
  const segmenterConstructor = (Intl as typeof Intl & { Segmenter?: IntlSegmenterConstructor })
    .Segmenter;
  if (segmenterConstructor) {
    return Array.from(
      new segmenterConstructor(undefined, { granularity: "grapheme" }).segment(content),
      (entry) => entry.segment
    );
  }

  const result: string[] = [];
  let current = "";
  let regionalCount = 0;
  for (const codePoint of Array.from(content)) {
    const value = codePoint.codePointAt(0) || 0;
    const regional = value >= 0x1f1e6 && value <= 0x1f1ff;
    const continuation =
      current.length > 0 &&
      (isCombiningCodePoint(value) ||
        (value >= 0xfe00 && value <= 0xfe0f) ||
        (value >= 0xe0100 && value <= 0xe01ef) ||
        (value >= 0x1f3fb && value <= 0x1f3ff) ||
        (value >= 0xe0020 && value <= 0xe007f) ||
        value === 0x200d ||
        current.endsWith("\u200d") ||
        (regional && regionalCount % 2 === 1));
    if (!continuation && current) {
      result.push(current);
      current = "";
    }
    current += codePoint;
    if (regional) regionalCount += 1;
    else if (value !== 0x200d) regionalCount = 0;
  }
  if (current) result.push(current);
  return result;
}

function buildCandidate(chars: string[], count: number, direction: EllipsisDirection) {
  if (count >= chars.length) return chars.join("");
  if (direction === "start") return `…${chars.slice(chars.length - count).join("")}`;
  if (direction === "middle") {
    const prefixLength = Math.ceil(count / 2);
    const suffixLength = Math.floor(count / 2);
    return `${chars.slice(0, prefixLength).join("")}…${
      suffixLength ? chars.slice(chars.length - suffixLength).join("") : ""
    }`;
  }
  return `${chars.slice(0, count).join("")}…`;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") return ref(value);
  if (ref) ref.current = value;
  return undefined;
}

function parsePixelValue(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getStyleMeasurementKey(style: CSSProperties | undefined) {
  if (!style) return "";
  const values = style as Record<string, unknown>;
  return Object.keys(style)
    .sort()
    .map((key) => `${key}:${String(values[key])}`)
    .join(";");
}

/**
 * Renders measured multi-line truncation with accessible expand and collapse controls.
 *
 * @public
 */
export function Ellipsis({
  actionRef,
  className,
  collapseAriaLabel,
  collapseText = "收起",
  content,
  defaultExpanded = false,
  direction = "end",
  expanded: expandedProp,
  expandAriaLabel,
  expandText = "展开",
  onEllipsisChange,
  onExpandedChange,
  ref,
  remeasureKey,
  rows = 1,
  style,
  ...props
}: EllipsisProps) {
  const safeRows = Number.isFinite(rows) ? Math.max(1, Math.trunc(rows)) : 1;
  const controlled = expandedProp !== undefined;
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded);
  const expanded = controlled ? expandedProp : uncontrolledExpanded;
  const [measurement, setMeasurement] = useState<EllipsisMeasurement | null>(null);
  const measured = Boolean(
    measurement &&
    measurement.content === content &&
    measurement.direction === direction &&
    measurement.rows === safeRows
  );
  const ellipsed = measured && measurement ? measurement.ellipsed : false;
  const collapsedContent = measured && measurement ? measurement.collapsedContent : content;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);
  const measureTextRef = useRef<HTMLSpanElement | null>(null);
  const measureActionRef = useRef<HTMLSpanElement | null>(null);
  const lastEllipsedRef = useRef<boolean | undefined>(undefined);
  const resolvedStyle: EllipsisStyle = { ...style, "--meu-ellipsis-rows": safeRows };
  const styleMeasurementKey = getStyleMeasurementKey(style);
  const setRootRef = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      const cleanup = assignRef(ref, node);
      if (!node) return undefined;
      return () => {
        rootRef.current = null;
        if (typeof cleanup === "function") cleanup();
        else assignRef(ref, null);
      };
    },
    [ref]
  );
  const setActionRef = useCallback(
    (node: HTMLButtonElement | null) => {
      const cleanup = assignRef(actionRef, node);
      if (!node) return undefined;
      return () => {
        if (typeof cleanup === "function") cleanup();
        else assignRef(actionRef, null);
      };
    },
    [actionRef]
  );

  useEffect(() => {
    const root = rootRef.current;
    const mirror = measureRef.current;
    const mirrorText = measureTextRef.current;
    const mirrorAction = measureActionRef.current;
    if (!root || !mirror || !mirrorText) return;

    let frame: number | null = null;
    let timer: number | null = null;
    let disposed = false;
    function runMeasure() {
      if (!root || !mirror || !mirrorText) return;
      const computed = window.getComputedStyle(root);
      const width =
        root.clientWidth -
        parsePixelValue(computed.paddingLeft) -
        parsePixelValue(computed.paddingRight);
      if (width <= 0) return;
      mirror.style.width = `${width}px`;
      if (mirrorAction) mirrorAction.style.display = "none";
      mirrorText.textContent = "\u00a0";
      const singleLineHeight = mirror.offsetHeight;
      mirrorText.textContent = content || "\u00a0";
      const fullHeight = mirror.offsetHeight;
      const textOnlyMaxHeight = singleLineHeight * safeRows + 0.5;
      const needsEllipsis = singleLineHeight > 0 && fullHeight > textOnlyMaxHeight;

      if (!needsEllipsis) {
        setMeasurement({
          collapsedContent: content,
          content,
          direction,
          ellipsed: false,
          rows: safeRows
        });
        return;
      }

      let actionMaxHeight = textOnlyMaxHeight;
      if (mirrorAction) {
        mirrorAction.style.display = "inline-flex";
        mirrorText.textContent = "";
        const actionLineHeight = mirror.offsetHeight;
        actionMaxHeight =
          singleLineHeight * Math.max(0, safeRows - 1) +
          Math.max(singleLineHeight, actionLineHeight) +
          0.5;
      }
      const chars = splitGraphemes(content);
      let low = 0;
      let high = chars.length;
      while (low < high) {
        const middle = Math.ceil((low + high) / 2);
        mirrorText.textContent = buildCandidate(chars, middle, direction);
        if (mirror.offsetHeight <= actionMaxHeight) low = middle;
        else high = middle - 1;
      }
      setMeasurement({
        collapsedContent: buildCandidate(chars, low, direction),
        content,
        direction,
        ellipsed: true,
        rows: safeRows
      });
    }

    function scheduleMeasure() {
      if (disposed) return;
      if (frame !== null && typeof window.cancelAnimationFrame === "function") {
        window.cancelAnimationFrame(frame);
      }
      if (timer !== null) window.clearTimeout(timer);
      if (typeof window.requestAnimationFrame === "function") {
        frame = window.requestAnimationFrame(() => {
          frame = null;
          runMeasure();
        });
      } else {
        timer = window.setTimeout(() => {
          timer = null;
          runMeasure();
        }, 0);
      }
    }

    scheduleMeasure();
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(scheduleMeasure);
    if (observer) observer.observe(root);
    if (!observer) window.addEventListener("resize", scheduleMeasure);
    window.addEventListener("orientationchange", scheduleMeasure);
    const fonts = document.fonts;
    if (fonts) {
      void fonts.ready.then(scheduleMeasure);
      if (typeof fonts.addEventListener === "function") {
        fonts.addEventListener("loadingdone", scheduleMeasure);
      }
    }

    return () => {
      disposed = true;
      if (frame !== null && typeof window.cancelAnimationFrame === "function") {
        window.cancelAnimationFrame(frame);
      }
      if (timer !== null) window.clearTimeout(timer);
      if (observer) observer.disconnect();
      if (!observer) window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("orientationchange", scheduleMeasure);
      if (fonts && typeof fonts.removeEventListener === "function") {
        fonts.removeEventListener("loadingdone", scheduleMeasure);
      }
    };
  }, [className, content, direction, expandText, remeasureKey, safeRows, styleMeasurementKey]);

  useEffect(() => {
    if (!measured || lastEllipsedRef.current === ellipsed) return;
    lastEllipsedRef.current = ellipsed;
    if (onEllipsisChange) onEllipsisChange(ellipsed);
  }, [ellipsed, measured, onEllipsisChange]);

  const displayEllipsed = measured ? ellipsed : Boolean(measurement && measurement.ellipsed);
  const showAction = displayEllipsed && (expanded ? Boolean(collapseText) : Boolean(expandText));
  const visualContent = expanded ? content : collapsedContent;
  const classes = className ? `${ellipsisRoot} ${className}` : ellipsisRoot;

  return (
    <div
      {...props}
      ref={setRootRef}
      className={classes}
      style={resolvedStyle}
      data-meu-component="ellipsis"
      data-direction={direction}
      data-state={
        expanded ? "expanded" : !measured ? "pending" : ellipsed ? "collapsed" : "complete"
      }
    >
      <VisuallyHidden>{content}</VisuallyHidden>
      <span
        className={`${visualText}${!measured && !expanded ? ` ${pendingClamp}` : ""}`}
        aria-hidden="true"
      >
        {visualContent}
      </span>
      {showAction ? (
        <button
          type="button"
          className={action}
          data-meu-ellipsis-action=""
          aria-expanded={expanded}
          aria-label={expanded ? collapseAriaLabel : expandAriaLabel}
          ref={setActionRef}
          onClick={(event) => {
            const nextExpanded = !expanded;
            if (!controlled) setUncontrolledExpanded(nextExpanded);
            if (onExpandedChange) onExpandedChange(nextExpanded, event);
          }}
        >
          {expanded ? collapseText : expandText}
        </button>
      ) : null}
      <div ref={measureRef} className={measure} aria-hidden="true">
        <span ref={measureTextRef} />
        {expandText ? (
          <span ref={measureActionRef} className={measureAction}>
            {expandText}
          </span>
        ) : null}
      </div>
    </div>
  );
}
