import type { HTMLAttributes, KeyboardEvent, MouseEvent, ReactNode, Ref } from "react";

/**
 * Keyboard activation behavior for SideNav tabs.
 *
 * @public
 */
export type SideNavActivationMode = "automatic" | "manual";

/**
 * One side-navigation destination. Keys must be unique and stable.
 *
 * @public
 */
export type SideNavItem = {
  /** Optional short status/count next to the label. */
  badge?: ReactNode;
  /** Accessible replacement for a visually abbreviated badge. */
  badgeLabel?: string;
  /** When any item supplies content, the component uses the vertical tabs pattern. */
  content?: ReactNode;
  /** Removes the item from keyboard navigation and selection. */
  disabled?: boolean;
  /** Stable selection value and DOM identity; it must be unique within `items`. */
  key: string;
  /** Visible navigation label and accessible tab name. */
  label: ReactNode;
};

/**
 * Props for route-agnostic vertical tabs or a side navigation rail.
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
  onChange?: (
    key: string,
    event: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>
  ) => void;
  /** Ref to the root side-navigation element. */
  ref?: Ref<HTMLDivElement>;
  /** Controlled active key. `null`, unknown and disabled keys select no item. */
  value?: string | null;
};
