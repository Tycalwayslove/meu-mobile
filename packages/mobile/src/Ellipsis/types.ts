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
  /** Label for revealing the complete text. Falsy content hides that action. */
  expandText?: ReactNode;
  /** Called after client measurement changes whether truncation is necessary. */
  onEllipsisChange?: (ellipsed: boolean) => void;
  /** Called after an expand/collapse action computes the next state. */
  onExpandedChange?: (expanded: boolean, event: MouseEvent<HTMLButtonElement>) => void;
  /** Ref to the root element that contains both visual and assistive text. */
  ref?: Ref<HTMLDivElement>;
  /** Maximum visual line count while collapsed. Non-finite or values below one normalize to one. */
  rows?: number;
};
