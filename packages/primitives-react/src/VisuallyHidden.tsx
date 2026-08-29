import { forwardRef } from "react";
import type { HTMLAttributes } from "react";

import { visuallyHidden, visuallyHiddenFocusable } from "./VisuallyHidden.css";

/**
 * Properties accepted by {@link VisuallyHidden}.
 *
 * @public
 */
export type VisuallyHiddenProps = HTMLAttributes<HTMLSpanElement> & {
  /**
   * Reveals the wrapper while it or one of its descendants has focus.
   * This does not create a tab stop; provide `tabIndex` or an interactive child.
   *
   * @defaultValue `false`
   */
  focusable?: boolean;
};

/**
 * Keeps content in the accessibility tree while clipping it visually.
 * The component deliberately renders a `span` and never applies
 * `aria-hidden`, `hidden`, or `display: none`.
 *
 * @public
 */
export const VisuallyHidden = forwardRef<HTMLSpanElement, VisuallyHiddenProps>(
  function VisuallyHidden({ className, focusable = false, ...props }, ref) {
    const hiddenClass = focusable ? visuallyHiddenFocusable : visuallyHidden;
    const classes = className ? `${hiddenClass} ${className}` : hiddenClass;
    return <span {...props} ref={ref} className={classes} />;
  }
);
