"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

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

export function Ellipsis({
  className,
  collapseText = "收起",
  content,
  defaultExpanded = false,
  direction = "end",
  expanded: expandedProp,
  expandText = "展开",
  onEllipsisChange,
  onExpandedChange,
  ref,
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

  useEffect(() => {
    const root = rootRef.current;
    const mirror = measureRef.current;
    const mirrorText = measureTextRef.current;
    const mirrorAction = measureActionRef.current;
    if (!root || !mirror || !mirrorText) return;

    let frame = 0;
    let disposed = false;
    function runMeasure() {
      if (!root || !mirror || !mirrorText) return;
      const width = root.clientWidth;
      if (width <= 0) return;
      mirror.style.width = `${width}px`;
      const computed = window.getComputedStyle(root);
      const parsedLineHeight = Number.parseFloat(computed.lineHeight);
      const fontSize = Number.parseFloat(computed.fontSize) || 16;
      const lineHeight = Number.isFinite(parsedLineHeight) ? parsedLineHeight : fontSize * 1.5;
      const maxHeight = lineHeight * safeRows + 0.5;
      if (mirrorAction) mirrorAction.style.display = "none";
      mirrorText.textContent = content || "\u00a0";
      const needsEllipsis = mirror.offsetHeight > maxHeight;

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

      if (mirrorAction) mirrorAction.style.display = "inline-flex";
      const chars = Array.from(content);
      let low = 0;
      let high = chars.length;
      while (low < high) {
        const middle = Math.ceil((low + high) / 2);
        mirrorText.textContent = buildCandidate(chars, middle, direction);
        if (mirror.offsetHeight <= maxHeight) low = middle;
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
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(runMeasure);
    }

    scheduleMeasure();
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(scheduleMeasure);
    if (observer) observer.observe(root);
    if (!observer) window.addEventListener("resize", scheduleMeasure);
    if (document.fonts) void document.fonts.ready.then(scheduleMeasure);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      if (observer) observer.disconnect();
      if (!observer) window.removeEventListener("resize", scheduleMeasure);
    };
  }, [content, direction, expandText, safeRows]);

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
      ref={(node) => {
        rootRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
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
          aria-expanded={expanded}
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
