import type { HTMLAttributes, MouseEvent, ReactNode, Ref } from "react";

export type CollapseVariant = "plain" | "card";
export type CollapseArrow = ReactNode | ((expanded: boolean) => ReactNode);

export type CollapseItem = {
  content: ReactNode;
  disabled?: boolean;
  extra?: ReactNode;
  title: ReactNode;
  value: string;
};

export type CollapseProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "defaultValue" | "onChange"
> & {
  accordion?: boolean;
  arrow?: CollapseArrow;
  defaultValue?: readonly string[];
  items: readonly CollapseItem[];
  onChange?: (value: string[], event: MouseEvent<HTMLButtonElement>) => void;
  ref?: Ref<HTMLDivElement>;
  value?: readonly string[];
  variant?: CollapseVariant;
};
