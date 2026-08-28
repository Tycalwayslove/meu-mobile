import type {
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
  ReactNode,
  Ref
} from "react";

/** A stable, addressable section rendered by {@link IndexList}. */
export type IndexListSection = {
  /** Accessible name for the index button when the stable key is not user-facing. */
  ariaLabel?: string;
  /** Compact visual content rendered in the index rail. */
  brief?: ReactNode;
  /** Caller-owned section content. */
  content: ReactNode;
  /** Stable and unique section identity used by rendering and imperative scrolling. */
  key: string;
  /** Visible section heading; defaults to `key`. */
  title?: ReactNode;
};

/** Origin of an active-section change. */
export type IndexListChangeSource = "index" | "scroll";

/** Details reported with an active-section change. */
export type IndexListChangeDetails = {
  /** Original input event when the change came from the index rail. */
  event?:
    MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement> | PointerEvent<HTMLElement>;
  /** Whether the rail or owned scroll viewport caused the change. */
  source: IndexListChangeSource;
};

/** Options for {@link IndexListRef.scrollTo}. */
export type IndexListScrollOptions = {
  /** Native scroll behavior; defaults to `auto`. */
  behavior?: ScrollBehavior;
  /** Moves keyboard focus to the matching rail button when true. */
  focusIndex?: boolean;
};

/** Imperative handle exposed by {@link IndexList}. */
export type IndexListRef = {
  /** Scrolls to a section and returns false when the key is not currently present. */
  scrollTo: (key: string, options?: IndexListScrollOptions) => boolean;
};

/** Props for {@link IndexList}. */
export type IndexListProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "onChange"> & {
  /** Accessible name for the index navigation rail. */
  indexAriaLabel?: string;
  /** Called when the active section changes through scrolling or index interaction. */
  onIndexChange?: (key: string, details: IndexListChangeDetails) => void;
  /** Imperative scrolling handle. */
  ref?: Ref<IndexListRef>;
  /** Stable ordered sections. Keys must be unique. */
  sections: readonly IndexListSection[];
  /** Keeps the current section heading at the top of the owned viewport. */
  sticky?: boolean;
};
