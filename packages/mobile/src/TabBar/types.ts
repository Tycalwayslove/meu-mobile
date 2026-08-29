import type {
  ComponentProps,
  MouseEvent as ReactMouseEvent,
  MouseEventHandler,
  ReactNode,
  Ref
} from "react";

/**
 * One primary destination in a TabBar.
 *
 * @public
 */
export type TabBarItem = {
  /** Overrides the link or button accessible name when the visual label is insufficient. */
  ariaLabel?: string;
  /** Optional compact count or status rendered over the icon. */
  badge?: ReactNode;
  /** Accessible meaning for the badge, for example "3 unread orders". */
  badgeLabel?: string;
  /**
   * Prevents activation and excludes the item from sequential focus. Buttons use native
   * `disabled`; links retain their anchor/link identity, omit the live `href`, and expose
   * `aria-disabled`.
   * @defaultValue false
   */
  disabled?: boolean;
  /**
   * Uses a native anchor when this is a non-empty URL. Disabled links keep the anchor and explicit
   * link role without a live `href`. Omit it for a router-controlled button; an empty string also
   * renders a button.
   */
  href?: string;
  /** Decorative icon or render function that receives whether this destination is current. */
  icon: ReactNode | ((active: boolean) => ReactNode);
  /** Stable selection and React identity. Keys must be unique; the first duplicate wins. */
  key: string;
  /** Visible navigation label. Avoid nested interactive content. */
  label: ReactNode;
  /**
   * Called before a selection request. `preventDefault()` cancels both `onChange` and native
   * link navigation. Disabled items do not call this handler.
   */
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
};

/**
 * Props for primary mobile destination navigation.
 *
 * @public
 */
export type TabBarProps = Omit<ComponentProps<"nav">, "children" | "onChange"> & {
  /** Initial uncontrolled key. Invalid or disabled keys fall back to the first enabled item. */
  defaultValue?: string;
  /**
   * Ordered primary destinations. Two to five items are recommended. Keys must stay stable;
   * the first duplicate is retained.
   */
  items: readonly TabBarItem[];
  /** Called after a different enabled destination is requested. Controlled state stays caller-owned. */
  onChange?: (key: string, event: ReactMouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
  /** React 19 ref to the root `nav` landmark. */
  ref?: Ref<HTMLElement>;
  /**
   * Consumes bottom and physical inline viewport safe-area insets. The component does not
   * become fixed and the page must still reserve its layout space.
   * @defaultValue false
   */
  safeArea?: boolean;
  /** Controlled current key. `null`, unknown, and disabled keys mark no destination current. */
  value?: string | null;
};
