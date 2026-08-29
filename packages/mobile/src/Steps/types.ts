import type { ComponentProps, MouseEvent, ReactNode, Ref } from "react";

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
 * Visual treatment for the step indicator.
 *
 * @public
 */
export type StepsIndicator = "number" | "dot";

/**
 * Density of the step indicator and labels.
 *
 * @public
 */
export type StepsSize = "medium" | "small";

/**
 * Content and optional status override for one step.
 *
 * @public
 */
export type StepItem = {
  /** Replaces the title portion of the optional button name; the localized status prefix remains. */
  ariaLabel?: string;
  /** Supporting detail rendered below the title. */
  description?: ReactNode;
  /** Prevents activation when the Steps component is interactive. */
  disabled?: boolean;
  /** Replaces the derived indicator. Must not contain focusable or interactive descendants. */
  icon?: ReactNode;
  /** Stable React identity. Provide this when items can be reordered. */
  key?: string | number;
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
export type StepsProps = Omit<ComponentProps<"ol">, "children" | "onChange" | "role"> & {
  /** Zero-based current step used to derive finish/process/wait. @defaultValue 0 */
  current?: number;
  /** Layout direction. @defaultValue "horizontal" */
  direction?: StepsDirection;
  /** Indicator treatment. Custom item icons take precedence. @defaultValue "number" */
  indicator?: StepsIndicator;
  /** Ordered progress steps. */
  items: readonly StepItem[];
  /**
   * Enables native step buttons and runs after an enabled, non-current step is activated.
   * Keyboard activation is reported as a React mouse event with `detail === 0`.
   */
  onChange?: (index: number, event: MouseEvent<HTMLButtonElement>) => void;
  ref?: Ref<HTMLOListElement>;
  /** Visual density. @defaultValue "medium" */
  size?: StepsSize;
};
