import type { HTMLAttributes, MouseEvent, ReactNode, Ref } from "react";

/**
 * Surface treatment applied to a disclosure group.
 *
 * @public
 */
export type CollapseVariant = "plain" | "card";
/**
 * Static or state-aware trailing indicator for a disclosure trigger.
 *
 * @public
 */
export type CollapseArrow = ReactNode | ((expanded: boolean) => ReactNode);

/**
 * One disclosure item. `value` must be unique and stable within the group.
 *
 * @public
 */
export type CollapseItem = {
  /** Persistently mounted panel content. */
  content: ReactNode;
  /** Prevents toggling with native disabled button semantics. */
  disabled?: boolean;
  /** Non-interactive trailing metadata inside the trigger. */
  extra?: ReactNode;
  /** Trigger label. Do not place interactive descendants here. */
  title: ReactNode;
  /** Stable item identity used by controlled and uncontrolled value arrays. */
  value: string;
};

/**
 * Props for a disclosure group or single-open accordion.
 *
 * @public
 */
export type CollapseProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "defaultValue" | "onChange"
> & {
  /** When true, normalization and user actions retain at most one expanded item. */
  accordion?: boolean;
  /** Decorative trailing indicator or render function. */
  arrow?: CollapseArrow;
  /** Initial expanded values for uncontrolled usage. */
  defaultValue?: readonly string[];
  /** Disclosure items. Values must be unique. */
  items: readonly CollapseItem[];
  /** Called after an enabled trigger computes its next value. Controlled state remains caller-owned. */
  onChange?: (value: string[], event: MouseEvent<HTMLButtonElement>) => void;
  /** Ref to the disclosure-group root element. */
  ref?: Ref<HTMLDivElement>;
  /** Controlled expanded values. Unknown and duplicate values are ignored. */
  value?: readonly string[];
  /** Surface treatment for the group. @defaultValue "plain" */
  variant?: CollapseVariant;
};
