import type {
  ButtonHTMLAttributes,
  HTMLAttributeAnchorTarget,
  HTMLAttributes,
  MouseEventHandler,
  ReactNode,
  Ref
} from "react";

export type CellRef = HTMLAnchorElement | HTMLButtonElement | HTMLDivElement;

/** Props for a semantic information row. The rendered root depends on `href` and interaction props. */
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
  download?: boolean | string;
  /** Short trailing value or status. Do not place interactive controls in this slot. */
  extra?: ReactNode;
  /** Non-empty navigation target; causes Cell to render a native anchor. */
  href?: string;
  onClick?: MouseEventHandler<CellRef>;
  /** Leading decorative or semantic content. Do not nest controls when the row is interactive. */
  prefix?: ReactNode;
  ref?: Ref<CellRef>;
  rel?: string;
  /** Trailing display content before the disclosure arrow. */
  suffix?: ReactNode;
  target?: HTMLAttributeAnchorTarget;
  /** Main accessible row content. */
  title: ReactNode;
  /** Native button type for action cells. Defaults to `button`. */
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
};

export type ListMode = "plain" | "card";
export type ListDivider = "inset" | "full" | "none";

/** Props for a semantic group of Cell rows. */
export type ListProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "dangerouslySetInnerHTML" | "title"
> & {
  children?: ReactNode;
  /** Divider treatment between direct Cell children. */
  divider?: ListDivider;
  /** Optional non-label help text after the list body. */
  footer?: ReactNode;
  /** Visible group label; used as the list accessible name unless ARIA naming is supplied. */
  header?: ReactNode;
  /** Full-width plain surface or inset bordered card. */
  mode?: ListMode;
  ref?: Ref<HTMLDivElement>;
};
