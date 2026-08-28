import type {
  ComponentProps,
  MouseEvent as ReactMouseEvent,
  MouseEventHandler,
  ReactNode,
  Ref
} from "react";

export type TabBarItem = {
  /** Overrides the link/button accessible name when the visual label is insufficient. */
  ariaLabel?: string;
  /** Optional badge content. */
  badge?: ReactNode;
  /** Accessible badge description, for example "3 unread orders". */
  badgeLabel?: string;
  /** Disables button items; href items fall back to disabled button semantics. */
  disabled?: boolean;
  /** Uses native link navigation when present and enabled. */
  href?: string;
  /** Decorative icon or active-aware icon renderer. */
  icon: ReactNode | ((active: boolean) => ReactNode);
  /** Stable route identity. */
  key: string;
  /** Visible navigation label. */
  label: ReactNode;
  /** Item click callback called before selection; `preventDefault()` cancels selection and link navigation. */
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
};

export type TabBarProps = Omit<ComponentProps<"nav">, "children" | "onChange"> & {
  /** Initial uncontrolled route key. */
  defaultValue?: string;
  /** Two to five primary destinations are recommended. */
  items: readonly TabBarItem[];
  /** Called after a new enabled route is requested. */
  onChange?: (key: string, event: ReactMouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
  ref?: Ref<HTMLElement>;
  /** Appends the shared bottom safe-area primitive. @defaultValue false */
  safeArea?: boolean;
  /** Controlled current route. `null` marks no route current. */
  value?: string | null;
};
