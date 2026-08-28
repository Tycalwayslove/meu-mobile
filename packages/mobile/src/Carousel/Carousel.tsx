"use client";

import { MeuIconChevronLeft } from "@meu/icons-react";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, Ref } from "react";

import { useMeuConfig } from "../ConfigProvider";
import { PaginationDots } from "../PaginationDots";
import {
  controls,
  indicator as indicatorClass,
  nextButton,
  nextIcon,
  previousButton,
  root,
  rotationButton,
  slide,
  track,
  viewport
} from "./Carousel.css";
import type { CarouselIndexChangeReason, CarouselProps } from "./types";

type CarouselStyle = CSSProperties & { "--meu-carousel-gap"?: string };

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

function normalizeIndex(value: number | undefined, count: number) {
  if (count <= 0) return 0;
  if (value === undefined || !Number.isFinite(value)) return 0;
  return Math.min(Math.max(Math.trunc(value), 0), count - 1);
}

function normalizeInterval(value: number) {
  return Number.isFinite(value) ? Math.max(1000, value) : 5000;
}

function normalizeGap(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

const focusableSelector = [
  "a[href]",
  "button",
  "input",
  "select",
  "textarea",
  "[tabindex]",
  "[contenteditable=true]"
].join(",");

function updateFocusableDescendants(slideNode: HTMLElement, active: boolean) {
  const descendants = slideNode.querySelectorAll<HTMLElement>(focusableSelector);
  descendants.forEach((element) => {
    const stored = element.getAttribute("data-meu-carousel-tabindex");
    if (active) {
      if (stored === null) return;
      if (stored === "") element.removeAttribute("tabindex");
      else element.setAttribute("tabindex", stored);
      element.removeAttribute("data-meu-carousel-tabindex");
      return;
    }
    if (stored !== null) return;
    element.setAttribute("data-meu-carousel-tabindex", element.getAttribute("tabindex") || "");
    element.setAttribute("tabindex", "-1");
  });
}

export function Carousel({
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  allowDrag = true,
  autoplay = false,
  autoplayInterval = 5000,
  className,
  defaultIndex = 0,
  disabled = false,
  gap = 0,
  index,
  indicator,
  indicatorVariant = "dot",
  items,
  loop = false,
  nextLabel,
  onFocusCapture,
  onIndexChange,
  onMouseEnter,
  onMouseLeave,
  pauseLabel,
  playLabel,
  previousLabel,
  ref,
  role = "group",
  style,
  ...props
}: CarouselProps) {
  const { dir, locale } = useMeuConfig();
  const count = items.length;
  const controlled = index !== undefined;
  const safeDefaultIndex = normalizeIndex(defaultIndex, count);
  const [uncontrolledIndex, setUncontrolledIndex] = useState(safeDefaultIndex);
  const requestedIndex = controlled ? index : uncontrolledIndex;
  const currentIndex = normalizeIndex(requestedIndex, count);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [reducedMotionOverride, setReducedMotionOverride] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const changeReasonRef = useRef<CarouselIndexChangeReason | null>(null);
  const suppressSelectionRef = useRef(false);
  const controlledIndexRef = useRef(currentIndex);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragThreshold: 10,
    duration: reducedMotion ? 0 : 25,
    direction: dir,
    loop: loop && count > 1,
    skipSnaps: false,
    startIndex: currentIndex,
    watchDrag: allowDrag && !disabled
  });

  const labels =
    locale === "en-US"
      ? {
          carousel: "Featured content",
          next: "Next slide",
          pause: "Pause slide rotation",
          play: "Start slide rotation",
          previous: "Previous slide",
          slide: (position: number) => `${position} of ${count}`,
          slideRole: "slide"
        }
      : {
          carousel: "推荐内容",
          next: "下一张",
          pause: "暂停轮播",
          play: "播放轮播",
          previous: "上一张",
          slide: (position: number) => `第 ${position} 张，共 ${count} 张`,
          slideRole: "幻灯片"
        };
  const resolvedInterval = normalizeInterval(autoplayInterval);
  const resolvedStyle = {
    ...style,
    "--meu-carousel-gap": `${normalizeGap(gap)}px`
  } as CarouselStyle;
  const rotationRequested = autoplay && !userPaused && (!reducedMotion || reducedMotionOverride);
  const rotating = rotationRequested && !disabled && !hovered && pageVisible && count > 1;

  useEffect(() => {
    controlledIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return undefined;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", update);
      return () => query.removeEventListener("change", update);
    }
    query.addListener(update);
    return () => query.removeListener(update);
  }, []);

  useEffect(() => {
    const update = () => setPageVisible(document.visibilityState !== "hidden");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  const handleSelection = useCallback(() => {
    if (!emblaApi || count <= 0) return;
    const nextIndex = normalizeIndex(emblaApi.selectedScrollSnap(), count);
    if (suppressSelectionRef.current) {
      suppressSelectionRef.current = false;
      return;
    }
    const reason = changeReasonRef.current || "drag";
    changeReasonRef.current = null;
    if (!controlled) setUncontrolledIndex(nextIndex);
    if (nextIndex !== currentIndex && onIndexChange) onIndexChange(nextIndex, { reason });
    if (controlled && nextIndex !== controlledIndexRef.current) {
      window.requestAnimationFrame(() => {
        if (!emblaApi || emblaApi.selectedScrollSnap() === controlledIndexRef.current) return;
        suppressSelectionRef.current = true;
        emblaApi.scrollTo(controlledIndexRef.current, true);
      });
    }
  }, [controlled, count, currentIndex, emblaApi, onIndexChange]);

  useEffect(() => {
    if (!emblaApi) return undefined;
    const pointerDown = () => {
      changeReasonRef.current = "drag";
      if (autoplay) setUserPaused(true);
    };
    emblaApi.on("select", handleSelection);
    emblaApi.on("pointerDown", pointerDown);
    emblaApi.on("reInit", handleSelection);
    return () => {
      emblaApi.off("select", handleSelection);
      emblaApi.off("pointerDown", pointerDown);
      emblaApi.off("reInit", handleSelection);
    };
  }, [autoplay, emblaApi, handleSelection]);

  useEffect(() => {
    if (!emblaApi || count <= 0 || emblaApi.selectedScrollSnap() === currentIndex) return;
    suppressSelectionRef.current = true;
    emblaApi.scrollTo(currentIndex, reducedMotion);
  }, [count, currentIndex, emblaApi, reducedMotion]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return undefined;
    const update = () => {
      node.querySelectorAll<HTMLElement>("[data-meu-carousel-slide]").forEach((slideNode) => {
        const active = slideNode.getAttribute("data-active") === "true";
        updateFocusableDescendants(slideNode, active);
      });
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(node, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [currentIndex, items]);

  useEffect(() => {
    if (!rotating || !emblaApi) return undefined;
    const timer = window.setTimeout(() => {
      if (!loop && currentIndex >= count - 1) {
        setUserPaused(true);
        return;
      }
      changeReasonRef.current = "autoplay";
      emblaApi.scrollNext(reducedMotion);
    }, resolvedInterval);
    return () => window.clearTimeout(timer);
  }, [count, currentIndex, emblaApi, loop, reducedMotion, resolvedInterval, rotating]);

  const move = (reason: "next" | "previous") => {
    if (!emblaApi || disabled || count <= 1) return;
    if (autoplay) setUserPaused(true);
    changeReasonRef.current = reason;
    if (reason === "next") emblaApi.scrollNext(reducedMotion);
    else emblaApi.scrollPrev(reducedMotion);
  };

  const toggleRotation = () => {
    if (disabled || !autoplay) return;
    if (rotationRequested) {
      setUserPaused(true);
      return;
    }
    setReducedMotionOverride(true);
    setUserPaused(false);
  };

  const previousDisabled = disabled || count <= 1 || (!loop && currentIndex <= 0);
  const nextDisabled = disabled || count <= 1 || (!loop && currentIndex >= count - 1);
  const indicatorContent =
    indicator === false ? null : typeof indicator === "function" ? (
      indicator(count, currentIndex)
    ) : (
      <PaginationDots activeIndex={currentIndex} count={count} variant={indicatorVariant} />
    );

  return (
    <div
      {...props}
      ref={(node) => {
        rootRef.current = node;
        assignRef(ref, node);
      }}
      className={className ? `${root} ${className}` : root}
      style={resolvedStyle}
      role={role}
      aria-label={ariaLabel || (!ariaLabelledby ? labels.carousel : undefined)}
      aria-labelledby={ariaLabel ? undefined : ariaLabelledby}
      aria-roledescription={locale === "en-US" ? "carousel" : "轮播"}
      data-autoplay={autoplay ? "true" : "false"}
      data-disabled={disabled ? "true" : "false"}
      data-drag-enabled={allowDrag && !disabled ? "true" : "false"}
      data-index={currentIndex}
      data-loop={loop ? "true" : "false"}
      data-meu-component="carousel"
      data-rotating={rotating ? "true" : "false"}
      onFocusCapture={(event) => {
        if (autoplay) setUserPaused(true);
        if (onFocusCapture) onFocusCapture(event);
      }}
      onMouseEnter={(event) => {
        setHovered(true);
        if (onMouseEnter) onMouseEnter(event);
      }}
      onMouseLeave={(event) => {
        setHovered(false);
        if (onMouseLeave) onMouseLeave(event);
      }}
    >
      <div className={controls} data-meu-carousel-controls>
        {autoplay ? (
          <button
            className={rotationButton}
            type="button"
            aria-label={rotationRequested ? pauseLabel || labels.pause : playLabel || labels.play}
            disabled={disabled || count <= 1}
            onClick={toggleRotation}
          >
            <span aria-hidden="true">{rotationRequested ? "Ⅱ" : "▶"}</span>
          </button>
        ) : null}
        <button
          className={previousButton}
          type="button"
          aria-label={previousLabel || labels.previous}
          disabled={previousDisabled}
          onClick={() => move("previous")}
        >
          <span className={dir === "rtl" ? nextIcon : undefined} aria-hidden="true">
            <MeuIconChevronLeft size={22} strokeWidth={2} />
          </span>
        </button>
        <button
          className={nextButton}
          type="button"
          aria-label={nextLabel || labels.next}
          disabled={nextDisabled}
          onClick={() => move("next")}
        >
          <span className={dir === "rtl" ? undefined : nextIcon} aria-hidden="true">
            <MeuIconChevronLeft size={22} strokeWidth={2} />
          </span>
        </button>
      </div>
      <div className={viewport} ref={emblaRef} data-meu-carousel-viewport>
        <div
          className={track}
          aria-atomic="false"
          aria-live={rotating ? "off" : "polite"}
          data-meu-carousel-track
        >
          {items.map((item, itemIndex) => {
            const active = itemIndex === currentIndex;
            return (
              <div
                className={slide}
                role="group"
                aria-hidden={active ? undefined : "true"}
                aria-label={item.ariaLabel || labels.slide(itemIndex + 1)}
                aria-roledescription={labels.slideRole}
                data-active={active ? "true" : "false"}
                data-meu-carousel-slide
                key={item.key}
              >
                {item.content}
              </div>
            );
          })}
        </div>
      </div>
      {indicatorContent ? <div className={indicatorClass}>{indicatorContent}</div> : null}
    </div>
  );
}
