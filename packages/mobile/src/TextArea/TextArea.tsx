"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState
} from "react";
import type { ChangeEvent, CSSProperties, ForwardedRef } from "react";

import { useFieldContext } from "../Field/FieldContext";
import { counter, root, textarea } from "./TextArea.css";
import type { TextAreaAutoSize, TextAreaProps } from "./types";

function assignRef<T>(ref: ForwardedRef<T>, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

function normalizeValue(value: TextAreaProps["value"]): string {
  if (value === undefined || value === null) return "";
  if (Array.isArray(value)) return value.join(",");
  return String(value);
}

function getRows(autoSize: TextAreaAutoSize, key: "maxRows" | "minRows"): number | undefined {
  if (typeof autoSize !== "object") return undefined;
  const rows = autoSize[key];
  return typeof rows === "number" && rows > 0 ? rows : undefined;
}

function mergeDescriptionIds(...values: Array<string | undefined>): string | undefined {
  const ids: string[] = [];
  values.forEach((value) => {
    if (!value) return;
    value.split(/\s+/).forEach((id) => {
      if (id && ids.indexOf(id) === -1) ids.push(id);
    });
  });
  return ids.length > 0 ? ids.join(" ") : undefined;
}

function resizeTextArea(element: HTMLTextAreaElement, autoSize: TextAreaAutoSize) {
  if (!autoSize) return;

  const previousScrollTop = element.scrollTop;
  element.style.height = "auto";
  const computed = window.getComputedStyle(element);
  const lineHeight = Number.parseFloat(computed.lineHeight) || 24;
  const padding =
    (Number.parseFloat(computed.paddingTop) || 0) +
    (Number.parseFloat(computed.paddingBottom) || 0);
  const border =
    (Number.parseFloat(computed.borderTopWidth) || 0) +
    (Number.parseFloat(computed.borderBottomWidth) || 0);
  const minRows = getRows(autoSize, "minRows");
  const maxRows = getRows(autoSize, "maxRows");
  const constrainedMaxRows = maxRows && minRows ? Math.max(maxRows, minRows) : maxRows;
  const naturalHeight = element.scrollHeight + border;
  const minHeight = minRows ? minRows * lineHeight + padding + border : 0;
  const maxHeight = constrainedMaxRows
    ? constrainedMaxRows * lineHeight + padding + border
    : Number.POSITIVE_INFINITY;
  const nextHeight = Math.min(Math.max(naturalHeight, minHeight), maxHeight);

  element.style.height = `${nextHeight}px`;
  element.style.overflowY = naturalHeight > maxHeight ? "auto" : "hidden";
  element.scrollTop = previousScrollTop;
}

function restoreAuthoredSize(element: HTMLTextAreaElement, style: CSSProperties | undefined) {
  const height = style ? style.height : undefined;
  const overflowY = style ? style.overflowY : undefined;
  element.style.height = typeof height === "number" ? `${height}px` : height || "";
  element.style.overflowY = typeof overflowY === "string" ? overflowY : "";
}

/**
 * Native multiline text input with Field integration, optional UTF-16 counting, and bounded
 * content-driven height.
 *
 * @public
 */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  {
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    autoSize = false,
    className,
    defaultValue,
    dir,
    disabled = false,
    form,
    id,
    maxLength,
    onChange,
    readOnly = false,
    rows,
    showCount = false,
    size = "medium",
    status = "default",
    style,
    value,
    ...props
  },
  forwardedRef
) {
  const fieldContext = useFieldContext();
  const countId = `meu-text-area-count-${useId()}`;
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const autoSizeRef = useRef(autoSize);
  const wasAutoSizeRef = useRef(false);
  const resizeFrameRef = useRef<number | null>(null);
  const resizeTimerRef = useRef<number | null>(null);
  const resetTimerRef = useRef<number | null>(null);
  const [uncontrolledValue, setUncontrolledValue] = useState(() => normalizeValue(defaultValue));
  const controlled = value !== undefined;
  const displayedValue = controlled ? normalizeValue(value) : uncontrolledValue;
  const resolvedId = id || (fieldContext ? fieldContext.controlId : undefined);
  const fieldDescribedBy = fieldContext ? fieldContext.describedBy : undefined;
  const describedBy = mergeDescriptionIds(
    ariaDescribedBy,
    fieldDescribedBy,
    showCount ? countId : undefined
  );
  const callerInvalid =
    ariaInvalid === true ||
    ariaInvalid === "true" ||
    ariaInvalid === "grammar" ||
    ariaInvalid === "spelling";
  const contextualInvalid = status === "error" || Boolean(fieldContext && fieldContext.invalid);
  const invalid = callerInvalid || contextualInvalid;
  const resolvedAriaInvalid = contextualInvalid
    ? true
    : ariaInvalid === "grammar" || ariaInvalid === "spelling"
      ? ariaInvalid
      : callerInvalid
        ? true
        : ariaInvalid === false || ariaInvalid === "false"
          ? ariaInvalid
          : undefined;
  const classes = textarea({
    autoSize: Boolean(autoSize),
    size,
    status: invalid ? "error" : status
  });
  const minRows = getRows(autoSize, "minRows");

  const cancelScheduledResize = useCallback(() => {
    if (resizeFrameRef.current !== null && typeof window.cancelAnimationFrame === "function") {
      window.cancelAnimationFrame(resizeFrameRef.current);
    }
    if (resizeTimerRef.current !== null) window.clearTimeout(resizeTimerRef.current);
    resizeFrameRef.current = null;
    resizeTimerRef.current = null;
  }, []);

  const resizeNow = useCallback(() => {
    const element = textAreaRef.current;
    if (element) resizeTextArea(element, autoSizeRef.current);
  }, []);

  const scheduleResize = useCallback(() => {
    cancelScheduledResize();
    if (typeof window.requestAnimationFrame === "function") {
      resizeFrameRef.current = window.requestAnimationFrame(() => {
        resizeFrameRef.current = null;
        resizeNow();
      });
      return;
    }
    resizeTimerRef.current = window.setTimeout(() => {
      resizeTimerRef.current = null;
      resizeNow();
    }, 0);
  }, [cancelScheduledResize, resizeNow]);

  useLayoutEffect(() => {
    const element = textAreaRef.current;
    const wasAutoSize = wasAutoSizeRef.current;
    autoSizeRef.current = autoSize;
    wasAutoSizeRef.current = Boolean(autoSize);
    if (autoSize) resizeNow();
    else if (wasAutoSize && element) restoreAuthoredSize(element, style);
  }, [autoSize, displayedValue, resizeNow, style]);

  useEffect(() => {
    const element = textAreaRef.current;
    if (!element || !autoSize) return undefined;

    let active = true;
    let observedWidth = element.getBoundingClientRect().width;
    const handleOrientationChange = () => scheduleResize();
    const handleViewportResize = () => scheduleResize();
    let observer: ResizeObserver | null = null;

    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        const nextWidth = entry ? entry.contentRect.width : element.getBoundingClientRect().width;
        if (Math.abs(nextWidth - observedWidth) < 0.5) return;
        observedWidth = nextWidth;
        scheduleResize();
      });
      observer.observe(element);
    } else {
      window.addEventListener("resize", handleViewportResize);
    }
    window.addEventListener("orientationchange", handleOrientationChange);

    const fonts = document.fonts;
    const handleFontsChanged = () => scheduleResize();
    if (fonts) {
      void fonts.ready.then(() => {
        if (active) scheduleResize();
      });
      if (typeof fonts.addEventListener === "function") {
        fonts.addEventListener("loadingdone", handleFontsChanged);
      }
    }

    return () => {
      active = false;
      if (observer) observer.disconnect();
      else window.removeEventListener("resize", handleViewportResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
      if (fonts && typeof fonts.removeEventListener === "function") {
        fonts.removeEventListener("loadingdone", handleFontsChanged);
      }
      cancelScheduledResize();
    };
  }, [autoSize, cancelScheduledResize, scheduleResize]);

  useEffect(() => {
    const element = textAreaRef.current;
    const ownerDocument = element ? element.ownerDocument : null;
    if (!element || !ownerDocument) return undefined;
    const timerWindow = ownerDocument.defaultView || window;

    const handleReset = (event: Event) => {
      const currentElement = textAreaRef.current;
      if (!currentElement || event.target !== currentElement.form) return;
      if (resetTimerRef.current !== null) timerWindow.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = timerWindow.setTimeout(() => {
        resetTimerRef.current = null;
        const resetElement = textAreaRef.current;
        if (!resetElement || event.defaultPrevented) return;
        if (controlled) resetElement.value = normalizeValue(value);
        else setUncontrolledValue(resetElement.value);
        if (autoSizeRef.current) resizeTextArea(resetElement, autoSizeRef.current);
      }, 0);
    };

    ownerDocument.addEventListener("reset", handleReset);
    return () => {
      ownerDocument.removeEventListener("reset", handleReset);
      if (resetTimerRef.current !== null) timerWindow.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    };
  }, [controlled, form, value]);

  useEffect(
    () => () => {
      cancelScheduledResize();
      if (resetTimerRef.current !== null) window.clearTimeout(resetTimerRef.current);
    },
    [cancelScheduledResize]
  );

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const nextValue = event.target.value;
    if (!controlled) setUncontrolledValue(nextValue);
    if (autoSize) resizeTextArea(event.target, autoSize);
    if (controlled && autoSize) scheduleResize();
    if (onChange) onChange(event);
  }

  return (
    <span className={root} dir={dir}>
      <textarea
        {...props}
        ref={(element) => {
          textAreaRef.current = element;
          assignRef(forwardedRef, element);
        }}
        id={resolvedId}
        className={className ? `${classes} ${className}` : classes}
        defaultValue={controlled ? undefined : defaultValue}
        dir={dir}
        disabled={disabled}
        form={form}
        maxLength={maxLength}
        onChange={handleChange}
        readOnly={readOnly}
        rows={rows || minRows || 3}
        style={style}
        value={controlled ? value : undefined}
        aria-describedby={describedBy}
        aria-invalid={resolvedAriaInvalid}
        data-auto-size={autoSize ? "true" : "false"}
        data-meu-component="text-area"
        data-size={size}
        data-state={disabled ? "disabled" : readOnly ? "readonly" : invalid ? "error" : "default"}
      />
      {showCount ? (
        <span id={countId} className={counter} dir="ltr" data-meu-slot="count">
          {displayedValue.length}
          {typeof maxLength === "number" ? ` / ${maxLength}` : null}
        </span>
      ) : null}
    </span>
  );
});
