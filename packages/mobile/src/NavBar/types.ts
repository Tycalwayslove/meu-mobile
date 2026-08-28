import type { ComponentProps, MouseEventHandler, ReactNode, Ref } from "react";

/** Props for a route-agnostic mobile page header. */
export type NavBarProps = Omit<ComponentProps<"header">, "children" | "title"> & {
  /** Accessible name of the back link/button. Defaults to the configured locale. */
  backAriaLabel?: string;
  /** Native navigation target. When present, the back control is an anchor. */
  backHref?: string;
  /** Decorative back icon. The default chevron mirrors in RTL. */
  backIcon?: ReactNode;
  /** Optional visible label next to the back icon. */
  backLabel?: ReactNode;
  /** Whether the bottom separator is visible. */
  bordered?: boolean;
  /** Additional leading controls after the optional back control. */
  left?: ReactNode;
  /** Back handler. It may call `preventDefault()` when `backHref` is present. */
  onBack?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  ref?: Ref<HTMLElement>;
  /** Additional trailing controls. */
  right?: ReactNode;
  /** Adds `safe-area-inset-top` padding while keeping the component in document flow. */
  safeArea?: boolean;
  /** Centered visual title. Pass an h1–h6 when page heading semantics are required. */
  title?: ReactNode;
};
