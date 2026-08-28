import type { HTMLAttributes } from "react";

import { visuallyHidden } from "./VisuallyHidden.css";

/**
 * Properties accepted by {@link VisuallyHidden}.
 *
 * @public
 */
export type VisuallyHiddenProps = HTMLAttributes<HTMLSpanElement>;

/**
 * Keeps content in the accessibility tree while clipping it visually.
 * The component deliberately renders a `span` and never applies
 * `aria-hidden`, `hidden`, or `display: none`.
 *
 * @public
 */
export function VisuallyHidden({ className, ...props }: VisuallyHiddenProps) {
  const classes = className ? `${visuallyHidden} ${className}` : visuallyHidden;
  return <span {...props} className={classes} />;
}
