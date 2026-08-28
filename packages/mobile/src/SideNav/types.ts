import type { HTMLAttributes, KeyboardEvent, MouseEvent, ReactNode, Ref } from "react";

export type SideNavActivationMode = "automatic" | "manual";

export type SideNavItem = {
  badge?: ReactNode;
  content?: ReactNode;
  disabled?: boolean;
  key: string;
  label: ReactNode;
};

export type SideNavProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "defaultValue" | "onChange"
> & {
  activationMode?: SideNavActivationMode;
  defaultValue?: string;
  destroyInactive?: boolean;
  items: readonly SideNavItem[];
  onChange?: (
    key: string,
    event: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>
  ) => void;
  ref?: Ref<HTMLDivElement>;
  value?: string | null;
};
