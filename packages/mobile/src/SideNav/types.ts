import type {
  AnchorHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  Ref
} from "react";

/**
 * Keyboard activation behavior for SideNav tabs.
 *
 * @public
 */
export type SideNavActivationMode = "automatic" | "manual";

/** Native user event that requested a SideNav selection change. @public */
export type SideNavChangeEvent =
  MouseEvent<HTMLAnchorElement | HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>;

/**
 * One side-navigation destination. Keys must be unique and stable.
 *
 * @public
 */
export type SideNavItem = {
  /** Accessible name when the visible label is not plain descriptive text. */
  ariaLabel?: string;
  /** Optional short status/count next to the label. */
  badge?: ReactNode;
  /** Accessible replacement for a visually abbreviated badge. */
  badgeLabel?: string;
  /** When any item supplies content, the component uses the vertical tabs pattern. */
  content?: ReactNode;
  /** Removes the item from keyboard navigation and selection. */
  disabled?: boolean;
  /** Native destination used by navigation mode. Omit it to render an action button. */
  href?: string;
  /** Stable selection value and DOM identity; it must be unique within `items`. */
  key: string;
  /** Visible navigation label and accessible tab name. */
  label: ReactNode;
  /** Native link relationship used only when `href` is present in navigation mode. */
  rel?: string;
  /** Native link browsing context used only when `href` is present in navigation mode. */
  target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
};

/**
 * Props for accessible vertical tabs or a native side-navigation rail.
 *
 * @public
 */
export type SideNavProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "defaultValue" | "onChange"
> & {
  /** Automatic activates on focus movement; manual requires Enter/Space. */
  activationMode?: SideNavActivationMode;
  /** Initial key for uncontrolled usage. Invalid values fall back to the first enabled item. */
  defaultValue?: string;
  /** Unmounts inactive tab panels and their local state. */
  destroyInactive?: boolean;
  /** Ordered destinations rendered as tabs; item keys must remain stable between renders. */
  items: readonly SideNavItem[];
  /** Called after an enabled item computes a new key. Controlled state remains caller-owned. */
  onChange?: (key: string, event: SideNavChangeEvent) => void;
  /** Ref to the root side-navigation element. */
  ref?: Ref<HTMLDivElement>;
  /** Keeps the rail within its nearest scrolling ancestor and bounds long item lists. */
  sticky?: boolean;
  /** Logical block-start offset for a sticky rail. */
  stickyOffset?: CSSProperties["insetBlockStart"];
  /** Controlled active key. `null`, unknown and disabled keys select no item. */
  value?: string | null;
};
