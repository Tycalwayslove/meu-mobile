import type { ComponentProps, ReactNode, Ref } from "react";

export type StepStatus = "wait" | "process" | "finish" | "error";
export type StepsDirection = "horizontal" | "vertical";

export type StepItem = {
  /** Supporting detail rendered below the title. */
  description?: ReactNode;
  /** Replaces the derived number/check/error indicator. */
  icon?: ReactNode;
  /** Overrides status derived from `current`. */
  status?: StepStatus;
  /** Required visible step title. */
  title: ReactNode;
};

export type StepsProps = Omit<ComponentProps<"ol">, "children"> & {
  /** Zero-based current step used to derive finish/process/wait. @defaultValue 0 */
  current?: number;
  /** Layout direction. @defaultValue "horizontal" */
  direction?: StepsDirection;
  /** Ordered, read-only progress steps. */
  items: readonly StepItem[];
  ref?: Ref<HTMLOListElement>;
};
