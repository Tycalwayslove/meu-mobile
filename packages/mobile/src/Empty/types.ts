import type { HTMLAttributes, ReactNode, Ref } from "react";

/** Props for an empty-state explanation and optional recovery actions. @public */
export type EmptyProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "dangerouslySetInnerHTML" | "title"
> & {
  /** Primary next step. The component does not perform navigation or retry behavior. */
  action?: ReactNode;
  /** Supporting explanation, constraints, or next-step guidance. */
  description: ReactNode;
  /** Decorative illustration; pass `null` to omit it. */
  illustration?: ReactNode;
  /** Machine-readable empty-state reason. This component is not an error boundary. @defaultValue "no-data" */
  reason?: "no-data" | "no-results" | "not-configured";
  /** Root element ref. */
  ref?: Ref<HTMLDivElement>;
  /** Lower-emphasis alternative action, rendered after `action`. */
  secondaryAction?: ReactNode;
  /** Concise reason shown as the empty-state heading. */
  title: ReactNode;
};
