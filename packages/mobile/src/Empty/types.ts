import type { HTMLAttributes, ReactNode, Ref } from "react";

export type EmptyProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "dangerouslySetInnerHTML" | "title"
> & {
  action: ReactNode;
  description: ReactNode;
  illustration?: ReactNode;
  ref?: Ref<HTMLDivElement>;
  title: ReactNode;
};
