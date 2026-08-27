import type { ComponentProps, MouseEventHandler, ReactNode, Ref } from "react";

export type NavBarProps = Omit<ComponentProps<"header">, "children" | "title"> & {
  backAriaLabel?: string;
  backHref?: string;
  backIcon?: ReactNode;
  backLabel?: ReactNode;
  bordered?: boolean;
  left?: ReactNode;
  onBack?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  ref?: Ref<HTMLElement>;
  right?: ReactNode;
  title?: ReactNode;
};
