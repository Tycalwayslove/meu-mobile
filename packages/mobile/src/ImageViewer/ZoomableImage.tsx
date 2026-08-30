"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  TouchEvent as ReactTouchEvent
} from "react";

import { Image } from "../Image";
import { errorAnnouncement, image, media, slideStage, stateMessage } from "./ImageViewer.css";
import type { ImageViewerItem, ImageViewerScaleChangeReason } from "./types";

type Transform = { scale: number; x: number; y: number };
type PanGesture = {
  mode: "pan";
  captureTarget: HTMLDivElement | null;
  moved: boolean;
  pointerId: number | null;
  source: "mouse" | "touch";
  startOffsetX: number;
  startOffsetY: number;
  startX: number;
  startY: number;
};
type PinchGesture = {
  mode: "pinch";
  startDistance: number;
  startScale: number;
};
type Gesture = PanGesture | PinchGesture;

export type ZoomableImageRef = {
  reset: (reason?: ImageViewerScaleChangeReason) => void;
  zoomIn: () => void;
  zoomOut: () => void;
};

type ZoomableImageProps = {
  active: boolean;
  doubleTapZoom: number;
  errorText: string;
  item: ImageViewerItem;
  maxZoom: number;
  onScaleChange: (scale: number, reason: ImageViewerScaleChangeReason) => void;
  zoom: boolean;
};

type MediaStyle = CSSProperties & {
  "--meu-image-viewer-scale": number;
  "--meu-image-viewer-x": string;
  "--meu-image-viewer-y": string;
};

const initialTransform: Transform = { scale: 1, x: 0, y: 0 };

function distance(first: React.Touch, second: React.Touch) {
  return Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
}

function releaseMouseCapture(gesture: Gesture | null) {
  if (
    !gesture ||
    gesture.mode !== "pan" ||
    gesture.source !== "mouse" ||
    gesture.pointerId === null ||
    !gesture.captureTarget
  ) {
    return;
  }
  try {
    if (
      typeof gesture.captureTarget.hasPointerCapture === "function" &&
      typeof gesture.captureTarget.releasePointerCapture === "function" &&
      gesture.captureTarget.hasPointerCapture(gesture.pointerId)
    ) {
      gesture.captureTarget.releasePointerCapture(gesture.pointerId);
    }
  } catch {
    return;
  }
}

export const ZoomableImage = forwardRef<ZoomableImageRef, ZoomableImageProps>(
  function ZoomableImage(
    { active, doubleTapZoom, errorText, item, maxZoom, onScaleChange, zoom },
    ref
  ) {
    const stageRef = useRef<HTMLDivElement>(null);
    const transformRef = useRef<Transform>(initialTransform);
    const gestureRef = useRef<Gesture | null>(null);
    const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);
    const [transform, setTransform] = useState(initialTransform);
    const [interacting, setInteracting] = useState(false);
    const [failed, setFailed] = useState(false);

    function clamp(next: Transform) {
      const stage = stageRef.current;
      if (next.scale <= 1 || !stage) return initialTransform;
      const normalizedScale = Math.min(maxZoom, Math.max(1, next.scale));
      const maxX = (stage.clientWidth * (normalizedScale - 1)) / 2;
      const maxY = (stage.clientHeight * (normalizedScale - 1)) / 2;
      return {
        scale: normalizedScale,
        x: Math.min(maxX, Math.max(-maxX, next.x)),
        y: Math.min(maxY, Math.max(-maxY, next.y))
      };
    }

    function publish(next: Transform, reason?: ImageViewerScaleChangeReason) {
      const normalized = clamp(next);
      const scaleChanged = normalized.scale !== transformRef.current.scale;
      transformRef.current = normalized;
      setTransform(normalized);
      if (active && reason && scaleChanged) onScaleChange(normalized.scale, reason);
    }

    function setScale(scale: number, reason: ImageViewerScaleChangeReason) {
      if (!zoom) return;
      publish({ ...transformRef.current, scale }, reason);
    }

    function clearGesture({ releaseCapture = false } = {}) {
      const gesture = gestureRef.current;
      gestureRef.current = null;
      setInteracting(false);
      if (releaseCapture) releaseMouseCapture(gesture);
      return gesture;
    }

    function reset(reason: ImageViewerScaleChangeReason = "reset") {
      clearGesture({ releaseCapture: true });
      publish(initialTransform, reason);
    }

    function toggleDoubleTap() {
      if (!zoom) return;
      setScale(transformRef.current.scale > 1 ? 1 : doubleTapZoom, "double-tap");
    }

    useImperativeHandle(ref, () => ({
      reset,
      zoomIn: () => setScale(transformRef.current.scale + 0.5, "zoom-in"),
      zoomOut: () => setScale(transformRef.current.scale - 0.5, "zoom-out")
    }));

    function startPan(
      clientX: number,
      clientY: number,
      source: PanGesture["source"] = "touch",
      pointerId: number | null = null,
      captureTarget: HTMLDivElement | null = null
    ) {
      gestureRef.current = {
        mode: "pan",
        captureTarget,
        moved: false,
        pointerId,
        source,
        startOffsetX: transformRef.current.x,
        startOffsetY: transformRef.current.y,
        startX: clientX,
        startY: clientY
      };
      setInteracting(true);
    }

    function movePan(clientX: number, clientY: number, pointerId: number | null = null) {
      const gesture = gestureRef.current;
      if (!gesture || gesture.mode !== "pan") return;
      if (gesture.source === "mouse" && gesture.pointerId !== pointerId) return;
      const deltaX = clientX - gesture.startX;
      const deltaY = clientY - gesture.startY;
      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) gesture.moved = true;
      publish({
        ...transformRef.current,
        x: gesture.startOffsetX + deltaX,
        y: gesture.startOffsetY + deltaY
      });
    }

    function finishGesture(releaseCapture = false) {
      if (!gestureRef.current && !interacting) return;
      clearGesture({ releaseCapture });
      publish(transformRef.current);
    }

    useEffect(() => {
      const cancelGesture = () => {
        const gesture = gestureRef.current;
        gestureRef.current = null;
        setInteracting(false);
        releaseMouseCapture(gesture);
      };
      window.addEventListener("blur", cancelGesture);
      return () => {
        window.removeEventListener("blur", cancelGesture);
        const gesture = gestureRef.current;
        gestureRef.current = null;
        releaseMouseCapture(gesture);
      };
    }, []);

    function handleTouchStart(event: ReactTouchEvent<HTMLDivElement>) {
      if (!zoom) return;
      if (event.touches.length >= 2) {
        gestureRef.current = {
          mode: "pinch",
          startDistance: Math.max(1, distance(event.touches[0]!, event.touches[1]!)),
          startScale: transformRef.current.scale
        };
        setInteracting(true);
      } else if (event.touches.length === 1 && transformRef.current.scale > 1) {
        const touch = event.touches[0]!;
        startPan(touch.clientX, touch.clientY);
      }
    }

    function handleTouchMove(event: ReactTouchEvent<HTMLDivElement>) {
      const gesture = gestureRef.current;
      if (!zoom || !gesture) return;
      if (gesture.mode === "pinch" && event.touches.length >= 2) {
        event.preventDefault();
        const nextDistance = distance(event.touches[0]!, event.touches[1]!);
        setScale(gesture.startScale * (nextDistance / gesture.startDistance), "pinch");
      } else if (gesture.mode === "pan" && event.touches.length === 1) {
        event.preventDefault();
        const touch = event.touches[0]!;
        movePan(touch.clientX, touch.clientY);
      }
    }

    function handleTouchEnd(event: ReactTouchEvent<HTMLDivElement>) {
      const gesture = gestureRef.current;
      if (event.touches.length === 1 && transformRef.current.scale > 1) {
        const touch = event.touches[0]!;
        startPan(touch.clientX, touch.clientY);
        return;
      }
      if (event.touches.length > 0) return;
      const moved = gesture && gesture.mode === "pan" ? gesture.moved : gesture !== null;
      finishGesture();
      if (moved || event.changedTouches.length === 0) return;
      const touch = event.changedTouches[0]!;
      const previous = lastTapRef.current;
      const now = Date.now();
      if (
        previous &&
        now - previous.time <= 320 &&
        Math.hypot(touch.clientX - previous.x, touch.clientY - previous.y) <= 32
      ) {
        lastTapRef.current = null;
        toggleDoubleTap();
      } else {
        lastTapRef.current = { time: now, x: touch.clientX, y: touch.clientY };
      }
    }

    function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
      if (
        event.pointerType !== "mouse" ||
        event.button !== 0 ||
        transformRef.current.scale <= 1 ||
        gestureRef.current
      ) {
        return;
      }
      try {
        if (!event.currentTarget.setPointerCapture) return;
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        return;
      }
      startPan(event.clientX, event.clientY, "mouse", event.pointerId, event.currentTarget);
    }

    function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
      if (event.pointerType !== "mouse") return;
      movePan(event.clientX, event.clientY, event.pointerId);
    }

    function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
      const gesture = gestureRef.current;
      if (
        event.pointerType !== "mouse" ||
        !gesture ||
        gesture.mode !== "pan" ||
        gesture.source !== "mouse" ||
        gesture.pointerId !== event.pointerId
      ) {
        return;
      }
      finishGesture(true);
    }

    function handleLostPointerCapture(event: ReactPointerEvent<HTMLDivElement>) {
      const gesture = gestureRef.current;
      if (
        !gesture ||
        gesture.mode !== "pan" ||
        gesture.source !== "mouse" ||
        gesture.pointerId !== event.pointerId
      ) {
        return;
      }
      finishGesture();
    }

    function handleTouchCancel() {
      lastTapRef.current = null;
      finishGesture();
    }

    const mediaStyle: MediaStyle = {
      "--meu-image-viewer-scale": transform.scale,
      "--meu-image-viewer-x": `${transform.x}px`,
      "--meu-image-viewer-y": `${transform.y}px`
    };

    return (
      <div
        ref={stageRef}
        className={slideStage}
        data-meu-image-viewer-stage
        onDoubleClick={toggleDoubleTap}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onLostPointerCapture={handleLostPointerCapture}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      >
        <div
          className={media}
          style={mediaStyle}
          data-interacting={interacting ? "true" : "false"}
          data-meu-image-viewer-media
          data-scale={transform.scale}
        >
          <Image
            className={image}
            src={item.src}
            alt={item.alt}
            {...(item.srcSet === undefined ? {} : { srcSet: item.srcSet })}
            {...(item.sizes === undefined ? {} : { sizes: item.sizes })}
            {...(item.crossOrigin === undefined ? {} : { crossOrigin: item.crossOrigin })}
            {...(item.referrerPolicy === undefined ? {} : { referrerPolicy: item.referrerPolicy })}
            draggable={false}
            fit="contain"
            width="100%"
            height="100%"
            fallback={<span className={stateMessage}>{errorText}</span>}
            onLoad={() => setFailed(false)}
            onError={() => {
              setFailed(true);
              lastTapRef.current = null;
              reset();
            }}
          />
          {failed ? (
            <span className={errorAnnouncement} role="status" aria-live="polite" aria-atomic="true">
              {item.alt ? `${item.alt}：${errorText}` : errorText}
            </span>
          ) : null}
        </div>
      </div>
    );
  }
);
