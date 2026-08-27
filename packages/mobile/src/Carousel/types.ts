import type {
  FocusEvent as ReactFocusEvent,
  HTMLAttributes,
  Key,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  Ref
} from "react";

import type { PaginationDotsVariant } from "../PaginationDots";

export type CarouselIndexChangeReason = "autoplay" | "drag" | "next" | "previous";

export type CarouselIndexChangeDetails = {
  reason: CarouselIndexChangeReason;
};

export type CarouselItem = {
  ariaLabel?: string;
  content: ReactNode;
  key: Key;
};

export type CarouselProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "defaultValue" | "onChange" | "onFocusCapture" | "onMouseEnter" | "onMouseLeave"
> & {
  allowDrag?: boolean;
  autoplay?: boolean;
  autoplayInterval?: number;
  defaultIndex?: number;
  disabled?: boolean;
  gap?: number;
  index?: number;
  indicator?: false | ((count: number, activeIndex: number) => ReactNode);
  indicatorVariant?: PaginationDotsVariant;
  items: readonly CarouselItem[];
  loop?: boolean;
  nextLabel?: string;
  onFocusCapture?: (event: ReactFocusEvent<HTMLDivElement>) => void;
  onIndexChange?: (index: number, details: CarouselIndexChangeDetails) => void;
  onMouseEnter?: (event: ReactMouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (event: ReactMouseEvent<HTMLDivElement>) => void;
  pauseLabel?: string;
  playLabel?: string;
  previousLabel?: string;
  ref?: Ref<HTMLDivElement>;
};
