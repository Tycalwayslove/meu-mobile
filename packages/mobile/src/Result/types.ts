import type { HTMLAttributes, ReactNode, Ref } from "react";

/** Semantic result state. `waiting` remains as a compatibility alias for `pending`. @public */
export type ResultStatus = "success" | "error" | "info" | "warning" | "pending" | "waiting";

/** Props for a terminal or pending operation outcome. @public */
export type ResultProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "dangerouslySetInnerHTML" | "title"
> & {
  /** Recovery or continuation controls. The component never owns routing or retry logic. */
  actions?: ReactNode;
  /** Supporting outcome details. */
  description?: ReactNode;
  /** Heading level used for the result title. @defaultValue 2 */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Decorative status icon; pass `null` to omit it. */
  icon?: ReactNode;
  /** Root element ref. */
  ref?: Ref<HTMLDivElement>;
  /** Outcome state. Prefer `pending` over the legacy `waiting` alias. @defaultValue "info" */
  status?: ResultStatus;
  /** Concise outcome heading used as the accessible name. */
  title: ReactNode;
};
