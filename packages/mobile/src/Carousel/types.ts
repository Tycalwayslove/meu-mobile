import type {
  FocusEvent as ReactFocusEvent,
  HTMLAttributes,
  Key,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  Ref
} from "react";

import type { PaginationDotsVariant } from "../PaginationDots";

/**
 * Interaction or timer that selected a carousel slide.
 *
 * @public
 */
export type CarouselIndexChangeReason = "autoplay" | "drag" | "next" | "previous";

/**
 * Details reported with an active-slide request.
 *
 * @public
 */
export type CarouselIndexChangeDetails = {
  /** Interaction or timer that selected the new slide. */
  reason: CarouselIndexChangeReason;
};

/**
 * One stable slide rendered by {@link Carousel}.
 *
 * @public
 */
export type CarouselItem = {
  /** Accessible name for the slide; defaults to a localized position such as “2 of 5”. */
  ariaLabel?: string;
  /** Content rendered inside the slide. */
  content: ReactNode;
  /** Stable React identity for the slide. */
  key: Key;
};

/**
 * Props accepted by {@link Carousel}.
 *
 * @public
 */
export type CarouselProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "defaultValue" | "onChange" | "onFocusCapture" | "onMouseEnter" | "onMouseLeave"
> & {
  /** Enables pointer dragging between slides. @defaultValue true */
  allowDrag?: boolean;
  /** Advances slides on a timer; rotation pauses for interaction, hidden pages, and reduced-motion preference. @defaultValue false */
  autoplay?: boolean;
  /** Delay in milliseconds between automatic advances; finite values are clamped to at least 1000 ms. @defaultValue 5000 */
  autoplayInterval?: number;
  /** Initial slide index when `index` is uncontrolled; clamped to the available items. @defaultValue 0 */
  defaultIndex?: number;
  /** Stops dragging, controls, and automatic rotation. @defaultValue false */
  disabled?: boolean;
  /** Gap between slides in pixels; finite values are clamped to zero or greater. @defaultValue 0 */
  gap?: number;
  /** Controlled active slide index; pair with `onIndexChange` to accept navigation requests. */
  index?: number;
  /** Custom indicator renderer, or `false` to hide the default pagination dots. */
  indicator?: false | ((count: number, activeIndex: number) => ReactNode);
  /** Visual style of the default pagination dots. @defaultValue "dot" */
  indicatorVariant?: PaginationDotsVariant;
  /** Ordered slides displayed by the carousel. */
  items: readonly CarouselItem[];
  /** Wraps navigation from the last slide to the first when more than one slide exists. @defaultValue false */
  loop?: boolean;
  /** Accessible label for the next-slide button. Defaults to localized text. */
  nextLabel?: string;
  /** Receives focus events after the carousel pauses autoplay for focus within its subtree. */
  onFocusCapture?: (event: ReactFocusEvent<HTMLDivElement>) => void;
  /** Called when drag, controls, or autoplay requests a different active index. */
  onIndexChange?: (index: number, details: CarouselIndexChangeDetails) => void;
  /** Receives mouse-enter events after autoplay is paused while the pointer is over the carousel. */
  onMouseEnter?: (event: ReactMouseEvent<HTMLDivElement>) => void;
  /** Receives mouse-leave events after pointer-hover autoplay suspension is cleared. */
  onMouseLeave?: (event: ReactMouseEvent<HTMLDivElement>) => void;
  /** Accessible label for the autoplay pause button. Defaults to localized text. */
  pauseLabel?: string;
  /** Accessible label for the autoplay resume button. Defaults to localized text. */
  playLabel?: string;
  /** Accessible label for the previous-slide button. Defaults to localized text. */
  previousLabel?: string;
  /** Ref to the carousel root element. */
  ref?: Ref<HTMLDivElement>;
};
