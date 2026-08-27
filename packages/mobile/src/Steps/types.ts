import type { ComponentProps, ReactNode, Ref } from "react";

export type StepStatus = "wait" | "process" | "finish" | "error";
export type StepsDirection = "horizontal" | "vertical";

export type StepItem = {
  description?: ReactNode;
  icon?: ReactNode;
  status?: StepStatus;
  title: ReactNode;
};

export type StepsProps = Omit<ComponentProps<"ol">, "children"> & {
  current?: number;
  direction?: StepsDirection;
  items: readonly StepItem[];
  ref?: Ref<HTMLOListElement>;
};
