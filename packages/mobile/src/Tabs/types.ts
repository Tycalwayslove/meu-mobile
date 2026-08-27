import type {
  ComponentProps,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  Ref
} from "react";

export type TabsActivationMode = "automatic" | "manual";

export type TabsItem = {
  badge?: ReactNode;
  content?: ReactNode;
  disabled?: boolean;
  key: string;
  label: ReactNode;
};

export type TabsProps = Omit<ComponentProps<"div">, "children" | "defaultValue" | "onChange"> & {
  activationMode?: TabsActivationMode;
  defaultValue?: string;
  destroyInactive?: boolean;
  items: readonly TabsItem[];
  onChange?: (
    key: string,
    event: ReactMouseEvent<HTMLButtonElement> | ReactKeyboardEvent<HTMLButtonElement>
  ) => void;
  ref?: Ref<HTMLDivElement>;
  stretch?: boolean;
  value?: string | null;
};
