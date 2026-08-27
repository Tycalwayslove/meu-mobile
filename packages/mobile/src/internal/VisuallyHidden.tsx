import type { HTMLAttributes } from "react";

import { visuallyHidden } from "./VisuallyHidden.css";

export function VisuallyHidden({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span {...props} className={className ? `${visuallyHidden} ${className}` : visuallyHidden} />
  );
}
