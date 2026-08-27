import type { HTMLAttributes, MouseEvent, ReactNode, Ref } from "react";

export type EllipsisDirection = "start" | "end" | "middle";

export type EllipsisProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "dangerouslySetInnerHTML"
> & {
  collapseText?: ReactNode;
  content: string;
  defaultExpanded?: boolean;
  direction?: EllipsisDirection;
  expanded?: boolean;
  expandText?: ReactNode;
  onEllipsisChange?: (ellipsed: boolean) => void;
  onExpandedChange?: (expanded: boolean, event: MouseEvent<HTMLButtonElement>) => void;
  ref?: Ref<HTMLDivElement>;
  rows?: number;
};
