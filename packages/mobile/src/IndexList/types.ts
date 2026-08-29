import type {
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
  ReactNode,
  Ref,
  TouchEvent
} from "react";

/**
 * A stable, addressable section rendered by {@link IndexList}.
 *
 * @public
 */
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

/**
 * Origin of an active-section change.
 *
 * @public
 */
export type IndexListChangeSource = "imperative" | "index" | "scroll";

/**
 * Details reported with an active-section change.
 *
 * @public
 */
export type IndexListChangeDetails = {
  /** Original input event when the change came from the index rail. */
  event?:
    | MouseEvent<HTMLButtonElement>
    | KeyboardEvent<HTMLButtonElement>
    | PointerEvent<HTMLElement>
    | TouchEvent<HTMLElement>;
  /** Whether the rail, owned scroll viewport, or imperative handle caused the change. */
  source: IndexListChangeSource;
};

/**
 * Options for {@link IndexListRef.scrollTo}.
 *
 * @public
 */
export type IndexListScrollOptions = {
  /** Native scroll behavior; defaults to `auto`. */
  behavior?: ScrollBehavior;
  /** Moves keyboard focus to the matching rail button when true. */
  focusIndex?: boolean;
};

/**
 * Imperative handle exposed by {@link IndexList}.
 *
 * @public
 */
export type IndexListRef = {
  /** Scrolls to a section and returns false when the key is not currently present. */
  scrollTo: (key: string, options?: IndexListScrollOptions) => boolean;
};

/**
 * Props for {@link IndexList}.
 *
 * @public
 */
export type IndexListProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "onChange"> & {
  /** Controlled active section key. `null` or an unknown key falls back to the first section. */
  activeKey?: string | null;
  /** Initial active section for uncontrolled usage; unknown keys fall back to the first section. */
  defaultActiveKey?: string;
  /** Accessible name for the index navigation rail. */
  indexAriaLabel?: string;
  /** Called when scrolling, rail interaction, or the imperative handle requests a new active key. */
  onIndexChange?: (key: string, details: IndexListChangeDetails) => void;
  /** Imperative scrolling handle. */
  ref?: Ref<IndexListRef>;
  /** Stable ordered sections. The first occurrence wins when a key is duplicated. */
  sections: readonly IndexListSection[];
  /** Keeps the current section heading at the top of the owned viewport. */
  sticky?: boolean;
};
