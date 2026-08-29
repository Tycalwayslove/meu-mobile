import type {
  ButtonHTMLAttributes,
  HTMLAttributeAnchorTarget,
  HTMLAttributes,
  MouseEventHandler,
  ReactNode,
  Ref
} from "react";

/**
 * Element rendered by a Cell according to its navigation and interaction props.
 *
 * @public
 */
export type CellRef = HTMLAnchorElement | HTMLButtonElement | HTMLDivElement;

/**
 * Props for a semantic information row. The rendered root depends on `href` and interaction props.
 *
 * @public
 */
export type CellProps = Omit<
  HTMLAttributes<CellRef>,
  "children" | "dangerouslySetInnerHTML" | "onClick" | "prefix" | "title"
> & {
  /** Trailing disclosure graphic. `false` hides it; omitted uses the Meu chevron for interactive rows. */
  arrow?: ReactNode;
  /** Renders a native button even when no `onClick` is supplied. */
  clickable?: boolean;
  /** Secondary text rendered below the title. */
  description?: ReactNode;
  /** Disables native button interaction or removes an anchor from navigation and the tab order. */
  disabled?: boolean;
  /** Native anchor download hint; used only when `href` renders the Cell as a link. */
  download?: boolean | string;
  /** Short trailing value or status. Do not place interactive controls in this slot. */
  extra?: ReactNode;
  /** Non-empty navigation target; causes Cell to render a native anchor. */
  href?: string;
  /** Marks the row busy, shows an end-aligned progress indicator, and suppresses activation. */
  loading?: boolean;
  /** Accessible status announced while loading. Defaults to the nearest Meu locale; an empty string disables the internal live region. */
  loadingLabel?: string;
  /** Activates an action Cell and receives its rendered anchor or button; disabled/loading Cells suppress it. */
  onClick?: MouseEventHandler<CellRef>;
  /** Leading decorative or semantic content. Do not nest controls when the row is interactive. */
  prefix?: ReactNode;
  /** Ref to the rendered anchor, button, or static `div`, depending on `href` and interaction props. */
  ref?: Ref<CellRef>;
  /** Native anchor relationship metadata; used only when `href` renders the Cell as a link. */
  rel?: string;
  /** Trailing display content before the disclosure arrow. */
  suffix?: ReactNode;
  /** Native anchor browsing-context target; used only when `href` renders the Cell as a link. */
  target?: HTMLAttributeAnchorTarget;
  /** Main accessible row content. */
  title: ReactNode;
  /** Native button type for action cells. Defaults to `button`. */
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
};

/**
 * Surface treatment applied to a list group.
 *
 * @public
 */
export type ListMode = "plain" | "card";
/**
 * Divider treatment between direct Cell children.
 *
 * @public
 */
export type ListDivider = "inset" | "full" | "none";

/**
 * Props for a semantic group of Cell rows.
 *
 * @public
 */
export type ListProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "dangerouslySetInnerHTML" | "title"
> & {
  /** Cell rows or other content rendered inside the element with `role="list"`. */
  children?: ReactNode;
  /** Divider treatment between direct Cell children. */
  divider?: ListDivider;
  /** Optional non-label help text after the list body. */
  footer?: ReactNode;
  /** Visible group label; used as the list accessible name unless ARIA naming is supplied. */
  header?: ReactNode;
  /** Full-width plain surface or inset bordered card. */
  mode?: ListMode;
  /** Ref to the outer group element; the nested body carries `role="list"`. */
  ref?: Ref<HTMLDivElement>;
};
