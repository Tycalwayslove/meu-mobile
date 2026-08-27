import type {
  ButtonHTMLAttributes,
  HTMLAttributeAnchorTarget,
  HTMLAttributes,
  MouseEventHandler,
  ReactNode,
  Ref
} from "react";

export type CellRef = HTMLAnchorElement | HTMLButtonElement | HTMLDivElement;

export type CellProps = Omit<
  HTMLAttributes<CellRef>,
  "children" | "dangerouslySetInnerHTML" | "onClick" | "prefix" | "title"
> & {
  arrow?: ReactNode;
  clickable?: boolean;
  description?: ReactNode;
  disabled?: boolean;
  download?: boolean | string;
  extra?: ReactNode;
  href?: string;
  onClick?: MouseEventHandler<CellRef>;
  prefix?: ReactNode;
  ref?: Ref<CellRef>;
  rel?: string;
  suffix?: ReactNode;
  target?: HTMLAttributeAnchorTarget;
  title: ReactNode;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
};

export type ListMode = "plain" | "card";
export type ListDivider = "inset" | "full" | "none";

export type ListProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "dangerouslySetInnerHTML" | "title"
> & {
  children?: ReactNode;
  divider?: ListDivider;
  footer?: ReactNode;
  header?: ReactNode;
  mode?: ListMode;
  ref?: Ref<HTMLDivElement>;
};
