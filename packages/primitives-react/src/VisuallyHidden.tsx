import type { HTMLAttributes } from "react";

import { visuallyHidden } from "./VisuallyHidden.css";

export type VisuallyHiddenProps = HTMLAttributes<HTMLSpanElement>;

export function VisuallyHidden({ className, ...props }: VisuallyHiddenProps) {
  const classes = className ? `${visuallyHidden} ${className}` : visuallyHidden;
  return <span {...props} className={classes} />;
}
