import type { ComponentProps, ReactNode, Ref } from "react";

/**
 * Semantic lifecycle state for one step.
 *
 * @public
 */
export type StepStatus = "wait" | "process" | "finish" | "error";
/**
 * Layout direction for Steps.
 *
 * @public
 */
export type StepsDirection = "horizontal" | "vertical";

/**
 * Content and optional status override for one step.
 *
 * @public
 */
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

/**
 * Props for an ordered process indicator.
 *
 * @public
 */
export type StepsProps = Omit<ComponentProps<"ol">, "children"> & {
  /** Zero-based current step used to derive finish/process/wait. @defaultValue 0 */
  current?: number;
  /** Layout direction. @defaultValue "horizontal" */
  direction?: StepsDirection;
  /** Ordered, read-only progress steps. */
  items: readonly StepItem[];
  ref?: Ref<HTMLOListElement>;
};
