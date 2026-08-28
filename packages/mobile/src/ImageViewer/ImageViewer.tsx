"use client";

import { MeuIconX } from "@meu/icons-react";
import { Portal, useBodyScrollLock, useFocusTrap } from "@meu/primitives-react";
import { useEffect, useImperativeHandle, useRef, useState } from "react";

import { Carousel } from "../Carousel";
import { useMeuConfig } from "../ConfigProvider";
import { useControllableOpen } from "../internal/useControllableOpen";
import { useOverlayPresence } from "../internal/useOverlayPresence";
import { Mask } from "../Mask";
import {
  closeButton,
  counter,
  dialog,
  empty,
  footer,
  gallery,
  layer,
  scaleValue,
  zoomButton,
  zoomControls
} from "./ImageViewer.css";
import type {
  ImageViewerIndexChangeReason,
  ImageViewerProps,
  ImageViewerScaleChangeReason
} from "./types";
import { ZoomableImage } from "./ZoomableImage";
import type { ZoomableImageRef } from "./ZoomableImage";

function normalizeIndex(value: number | undefined, count: number) {
  if (count <= 0 || value === undefined || !Number.isFinite(value)) return 0;
  return Math.min(Math.max(Math.trunc(value), 0), count - 1);
}

function normalizeMaxZoom(value: number) {
  if (!Number.isFinite(value)) return 3;
  return Math.max(1, value);
}

function normalizeDoubleTapZoom(value: number, maxZoom: number) {
  if (!Number.isFinite(value)) return Math.min(2, maxZoom);
  return Math.min(maxZoom, Math.max(1, value));
}

export function ImageViewer({
  "aria-label": ariaLabel,
  className,
  closeLabel,
  closeOnEscape = true,
  container,
  controls = "full",
  defaultIndex = 0,
  defaultOpen = false,
  doubleTapZoom = 2,
  emptyContent,
  forceMount = false,
  images,
  index,
  lockScroll = true,
  loop = false,
  maxZoom = 3,
  nextLabel,
  onIndexChange,
  onOpenChange,
  onScaleChange,
  open,
  previousLabel,
  ref,
  renderFooter,
  resetZoomLabel,
  restoreFocus = true,
  returnFocusRef,
  showCounter = true,
  zoom = true,
  zoomInLabel,
  zoomOutLabel,
  ...props
}: ImageViewerProps) {
  const config = useMeuConfig();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const zoomRefs = useRef<Array<ZoomableImageRef | null>>([]);
  const controlledIndex = index !== undefined;
  const [uncontrolledIndex, setUncontrolledIndex] = useState(() =>
    normalizeIndex(defaultIndex, images.length)
  );
  const currentIndex = normalizeIndex(controlledIndex ? index : uncontrolledIndex, images.length);
  const [scale, setScale] = useState(1);
  const [resolvedOpen, requestOpenChange] = useControllableOpen({
    defaultOpen,
    onOpenChange,
    open
  });
  const { hidden, shouldRender, visualState } = useOverlayPresence(resolvedOpen, forceMount);
  const resolvedMaxZoom = normalizeMaxZoom(maxZoom);
  const resolvedDoubleTapZoom = normalizeDoubleTapZoom(doubleTapZoom, resolvedMaxZoom);
  const portalContainer = container === undefined ? config.portalContainer : container;
  const currentItem = images[currentIndex];
  const labels =
    config.locale === "en-US"
      ? {
          close: "Close image viewer",
          counter: (position: number, count: number) => `${position} of ${count}`,
          dialog: "Image viewer",
          empty: "No images to preview",
          error: "Image failed to load",
          next: "Next image",
          previous: "Previous image",
          reset: "Reset zoom",
          slide: (position: number, count: number) => `Image ${position} of ${count}`,
          zoomIn: "Zoom in",
          zoomOut: "Zoom out"
        }
      : {
          close: "关闭图片预览",
          counter: (position: number, count: number) => `${position} / ${count}`,
          dialog: "图片预览",
          empty: "暂无可预览图片",
          error: "图片加载失败",
          next: "下一张图片",
          previous: "上一张图片",
          reset: "重置缩放",
          slide: (position: number, count: number) => `第 ${position} 张图片，共 ${count} 张`,
          zoomIn: "放大图片",
          zoomOut: "缩小图片"
        };

  function resetCurrentZoom(reason: ImageViewerScaleChangeReason = "reset") {
    const handle = zoomRefs.current[currentIndex];
    if (handle) handle.reset(reason);
    else setScale(1);
  }

  function requestIndex(nextIndex: number, reason: ImageViewerIndexChangeReason) {
    if (images.length <= 0) return;
    let normalized = nextIndex;
    if (loop) normalized = ((nextIndex % images.length) + images.length) % images.length;
    else normalized = normalizeIndex(nextIndex, images.length);
    if (normalized === currentIndex) return;
    resetCurrentZoom();
    if (!controlledIndex) setUncontrolledIndex(normalized);
    if (onIndexChange) onIndexChange(normalized, { reason });
  }

  function previous(reason: ImageViewerIndexChangeReason = "previous") {
    requestIndex(currentIndex - 1, reason);
  }

  function next(reason: ImageViewerIndexChangeReason = "next") {
    requestIndex(currentIndex + 1, reason);
  }

  useBodyScrollLock(resolvedOpen && lockScroll);
  useFocusTrap({
    active: resolvedOpen,
    containerRef: dialogRef,
    initialFocusRef: closeRef,
    onEscape: closeOnEscape ? () => requestOpenChange(false, { reason: "escape" }) : undefined,
    restoreFocus,
    returnFocusRef
  });

  useImperativeHandle(ref, () => ({
    goTo: (nextIndex) => requestIndex(nextIndex, "imperative"),
    get nativeElement() {
      return dialogRef.current;
    },
    next: () => next("imperative"),
    previous: () => previous("imperative"),
    resetZoom: () => resetCurrentZoom()
  }));

  useEffect(() => {
    if (controlledIndex) return;
    const normalized = normalizeIndex(uncontrolledIndex, images.length);
    if (normalized !== uncontrolledIndex) setUncontrolledIndex(normalized);
  }, [controlledIndex, images.length, uncontrolledIndex]);

  useEffect(() => {
    if (resolvedOpen) return;
    zoomRefs.current.forEach((handle) => {
      if (handle) handle.reset();
    });
    setScale(1);
  }, [resolvedOpen]);

  const carouselItems = images.map((item, itemIndex) => ({
    ariaLabel: item.alt || labels.slide(itemIndex + 1, images.length),
    content: (
      <ZoomableImage
        key={`${item.key === undefined ? item.src : String(item.key)}-${itemIndex === currentIndex ? "active" : "inactive"}`}
        ref={(handle) => {
          zoomRefs.current[itemIndex] = handle;
        }}
        active={itemIndex === currentIndex}
        doubleTapZoom={resolvedDoubleTapZoom}
        errorText={labels.error}
        item={item}
        maxZoom={resolvedMaxZoom}
        zoom={zoom}
        onScaleChange={(nextScale, reason) => {
          if (itemIndex !== currentIndex) return;
          setScale(nextScale);
          if (onScaleChange) onScaleChange(nextScale, { index: itemIndex, reason });
        }}
      />
    ),
    key: item.key === undefined ? `${item.src}-${itemIndex}` : item.key
  }));

  useEffect(() => {
    if (!resolvedOpen) return undefined;
    const node = dialogRef.current;
    if (!node) return undefined;
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        if (config.dir === "rtl") next();
        else previous();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        if (config.dir === "rtl") previous();
        else next();
      } else if ((event.key === "+" || event.key === "=") && zoom) {
        event.preventDefault();
        const handle = zoomRefs.current[currentIndex];
        if (handle) handle.zoomIn();
      } else if (event.key === "-" && zoom) {
        event.preventDefault();
        const handle = zoomRefs.current[currentIndex];
        if (handle) handle.zoomOut();
      } else if (event.key === "0" && zoom) {
        event.preventDefault();
        resetCurrentZoom();
      }
    };
    node.addEventListener("keydown", handleKeyDown);
    return () => node.removeEventListener("keydown", handleKeyDown);
  });

  if (!shouldRender) return null;

  const footerContent =
    currentItem && renderFooter ? renderFooter(currentItem, currentIndex) : null;

  return (
    <Portal container={portalContainer}>
      <div
        className={layer({ state: visualState })}
        dir={config.dir}
        hidden={hidden}
        aria-hidden={resolvedOpen ? undefined : "true"}
        data-meu-overlay-layer="image-viewer"
        data-meu-theme={config.theme}
        data-state={visualState}
      >
        <Mask
          container={null}
          forceMount
          lockScroll={false}
          open={resolvedOpen}
          opacity="thick"
          style={{ position: "absolute", zIndex: 0 }}
        />
        <div
          {...props}
          ref={(node) => {
            dialogRef.current = node;
          }}
          className={className ? `${dialog} ${className}` : dialog}
          role="dialog"
          aria-label={ariaLabel || labels.dialog}
          aria-modal="true"
          tabIndex={-1}
          data-controls={controls}
          data-index={currentIndex}
          data-meu-component="image-viewer"
          data-open={resolvedOpen ? "true" : "false"}
          data-scale={scale}
        >
          <button
            ref={closeRef}
            className={closeButton}
            type="button"
            aria-label={closeLabel || labels.close}
            onClick={() => requestOpenChange(false, { reason: "close-button" })}
          >
            <MeuIconX size={22} aria-hidden="true" />
          </button>
          {showCounter && images.length > 0 ? (
            <div className={counter} aria-live="polite" aria-atomic="true">
              {labels.counter(currentIndex + 1, images.length)}
            </div>
          ) : null}
          {images.length > 0 ? (
            <Carousel
              className={gallery}
              aria-label={ariaLabel || labels.dialog}
              allowDrag={scale <= 1}
              index={currentIndex}
              indicator={false}
              items={carouselItems}
              loop={loop}
              previousLabel={previousLabel || labels.previous}
              nextLabel={nextLabel || labels.next}
              onIndexChange={(nextIndex, details) => {
                requestIndex(
                  nextIndex,
                  details.reason === "previous"
                    ? "previous"
                    : details.reason === "next"
                      ? "next"
                      : "drag"
                );
              }}
            />
          ) : (
            <div className={empty}>{emptyContent === undefined ? labels.empty : emptyContent}</div>
          )}
          {zoom && controls === "full" && images.length > 0 ? (
            <div
              className={zoomControls}
              aria-label={config.locale === "en-US" ? "Zoom controls" : "缩放控制"}
              role="group"
            >
              <button
                className={zoomButton}
                type="button"
                aria-label={zoomOutLabel || labels.zoomOut}
                disabled={scale <= 1}
                onClick={() => {
                  const handle = zoomRefs.current[currentIndex];
                  if (handle) handle.zoomOut();
                }}
              >
                <span aria-hidden="true">−</span>
              </button>
              <button
                className={`${zoomButton} ${scaleValue}`}
                type="button"
                aria-label={resetZoomLabel || labels.reset}
                disabled={scale <= 1}
                onClick={() => resetCurrentZoom()}
              >
                {Math.round(scale * 100)}%
              </button>
              <button
                className={zoomButton}
                type="button"
                aria-label={zoomInLabel || labels.zoomIn}
                disabled={scale >= resolvedMaxZoom}
                onClick={() => {
                  const handle = zoomRefs.current[currentIndex];
                  if (handle) handle.zoomIn();
                }}
              >
                <span aria-hidden="true">+</span>
              </button>
            </div>
          ) : null}
          {footerContent ? <div className={footer}>{footerContent}</div> : null}
        </div>
      </div>
    </Portal>
  );
}
