import type { HTMLAttributes, ReactNode, Ref } from "react";

export type ResultStatus = "success" | "error" | "info" | "warning" | "waiting";

export type ResultProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "dangerouslySetInnerHTML" | "title"
> & {
  actions?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  ref?: Ref<HTMLDivElement>;
  status?: ResultStatus;
  title: ReactNode;
};
