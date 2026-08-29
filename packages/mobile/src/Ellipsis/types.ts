import type { HTMLAttributes, MouseEvent, ReactNode, Ref } from "react";

/**
 * Portion of text preserved by visual truncation.
 *
 * @public
 */
export type EllipsisDirection = "start" | "end" | "middle";

/**
 * Props for measured, accessible multi-line text truncation.
 *
 * @public
 */
export type EllipsisProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "dangerouslySetInnerHTML"
> & {
  /** Ref to the currently rendered expand/collapse button, or null when no action is needed. */
  actionRef?: Ref<HTMLButtonElement>;
  /** Accessible name used by the collapse button when its visible content is not descriptive. */
  collapseAriaLabel?: string;
  /** Label for returning to the collapsed view. Falsy content hides that action. */
  collapseText?: ReactNode;
  /** Complete plain text. It remains available to assistive technology while visually truncated. */
  content: string;
  /** Initial expansion state when uncontrolled. */
  defaultExpanded?: boolean;
  /** Which portion of the text remains visible when truncated. */
  direction?: EllipsisDirection;
  /** Controlled expansion state. */
  expanded?: boolean;
  /** Accessible name used by the expand button when its visible content is not descriptive. */
  expandAriaLabel?: string;
  /** Label for revealing the complete text. Falsy content hides that action. */
  expandText?: ReactNode;
  /** Called after client measurement changes whether truncation is necessary. */
  onEllipsisChange?: (ellipsed: boolean) => void;
  /** Called after an expand/collapse action computes the next state. */
  onExpandedChange?: (expanded: boolean, event: MouseEvent<HTMLButtonElement>) => void;
  /** Ref to the root element that contains both visual and assistive text. */
  ref?: Ref<HTMLDivElement>;
  /** Changes to this value force a new measurement after ancestor typography changes. */
  remeasureKey?: string | number;
  /** Maximum visual line count while collapsed. Non-finite or values below one normalize to one. */
  rows?: number;
};
