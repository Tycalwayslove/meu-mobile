import { forwardRef } from "react";

import { safeArea } from "./SafeArea.css";
import type { SafeAreaProps } from "./types";

export const SafeArea = forwardRef<HTMLDivElement, SafeAreaProps>(function SafeArea(
  { "aria-hidden": ariaHidden = true, className, position = "bottom", ...props },
  ref
) {
  const classes = safeArea({ position });
  return (
    <div
      {...props}
      ref={ref}
      aria-hidden={ariaHidden}
      className={className ? `${classes} ${className}` : classes}
      data-meu-component="safe-area"
      data-position={position}
    />
  );
});
