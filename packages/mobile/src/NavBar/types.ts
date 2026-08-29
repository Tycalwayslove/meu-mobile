import type { ComponentProps, MouseEventHandler, ReactNode, Ref } from "react";

/**
 * Layout mode applied to the page header.
 *
 * @public
 */
export type NavBarPosition = "static" | "sticky";

/**
 * Props for a route-agnostic mobile page header.
 *
 * @public
 */
export type NavBarProps = Omit<ComponentProps<"header">, "children" | "dir" | "title"> & {
  /** Accessible name of the back link/button. Defaults to the configured locale. */
  backAriaLabel?: string;
  /**
   * Prevents back navigation. Buttons use native disabled; anchors keep their DOM identity and
   * link role but remove `href`, leave the tab order, and expose `aria-disabled`.
   *
   * @defaultValue `false`
   */
  backDisabled?: boolean;
  /**
   * Native navigation target. A non-empty value always renders an anchor; unavailable state removes
   * the live `href` until enabled. `onBack` may cancel navigation for a framework router.
   */
  backHref?: string;
  /** Decorative back icon. The default chevron mirrors in RTL. */
  backIcon?: ReactNode;
  /** Optional visible label next to the back icon. */
  backLabel?: ReactNode;
  /**
   * Marks an in-flight back action, exposes `aria-busy`, shows a static-capable progress mark,
   * and prevents repeat activation.
   *
   * @defaultValue `false`
   */
  backLoading?: boolean;
  /** Whether the bottom separator is visible. @defaultValue `true` */
  bordered?: boolean;
  /** Native direction. Explicit `ltr`/`rtl` also controls the back icon; `auto` leaves icon direction to ConfigProvider. */
  dir?: ComponentProps<"header">["dir"];
  /** Additional leading controls after the optional back control. */
  left?: ReactNode;
  /**
   * Observes an enabled back activation. It may call `preventDefault()` when `backHref` is present;
   * disabled and loading activations never invoke it.
   */
  onBack?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  /** Controls normal-flow or CSS sticky positioning without installing a scroll listener. @defaultValue `"static"` */
  position?: NavBarPosition;
  ref?: Ref<HTMLElement>;
  /** Additional trailing controls. */
  right?: ReactNode;
  /**
   * Adds top and horizontal device safe-area insets. Positioning remains controlled by `position`.
   *
   * @defaultValue `false`
   */
  safeArea?: boolean;
  /**
   * Controlled scroll presentation state. It restores the separator when `bordered` is false and
   * exposes a stable data attribute; the caller remains responsible for observing scroll.
   *
   * @defaultValue `false`
   */
  scrolled?: boolean;
  /** Centered visual title. Pass an h1–h6 when page heading semantics are required. */
  title?: ReactNode;
};
