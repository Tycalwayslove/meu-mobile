import type {
  ComponentProps,
  MouseEvent as ReactMouseEvent,
  MouseEventHandler,
  ReactNode,
  Ref
} from "react";

export type TabBarItem = {
  badge?: ReactNode;
  disabled?: boolean;
  href?: string;
  icon: ReactNode | ((active: boolean) => ReactNode);
  key: string;
  label: ReactNode;
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
};

export type TabBarProps = Omit<ComponentProps<"nav">, "children" | "onChange"> & {
  defaultValue?: string;
  items: readonly TabBarItem[];
  onChange?: (key: string, event: ReactMouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
  ref?: Ref<HTMLElement>;
  safeArea?: boolean;
  value?: string | null;
};
