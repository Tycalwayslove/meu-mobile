import type { HTMLAttributes, KeyboardEvent, MouseEvent, ReactNode, Ref } from "react";

export type SideNavActivationMode = "automatic" | "manual";

/** One side-navigation destination. Keys must be unique and stable. */
export type SideNavItem = {
  /** Optional short status/count next to the label. */
  badge?: ReactNode;
  /** Accessible replacement for a visually abbreviated badge. */
  badgeLabel?: string;
  /** When any item supplies content, the component uses the vertical tabs pattern. */
  content?: ReactNode;
  /** Removes the item from keyboard navigation and selection. */
  disabled?: boolean;
  key: string;
  label: ReactNode;
};

/** Props for route-agnostic vertical tabs or a side navigation rail. */
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
  items: readonly SideNavItem[];
  /** Called after an enabled item computes a new key. Controlled state remains caller-owned. */
  onChange?: (
    key: string,
    event: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>
  ) => void;
  ref?: Ref<HTMLDivElement>;
  /** Controlled active key. `null`, unknown and disabled keys select no item. */
  value?: string | null;
};
