import type { HTMLAttributes, ReactElement, ReactNode, Ref, RefObject } from "react";

import type { OverlayContainer } from "../overlayTypes";

export type PopoverPlacement =
  | "top"
  | "top-start"
  | "top-end"
  | "right"
  | "right-start"
  | "right-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end";

export type PopoverTrigger = "click" | "manual";

export type PopoverOpenChangeReason = "trigger" | "escape" | "outside" | "focus-out";

export type PopoverOpenChangeDetails = { reason: PopoverOpenChangeReason };

export type PopoverTriggerElement = ReactElement<{
  disabled?: boolean;
  id?: string;
  ref?: Ref<HTMLElement>;
}>;

type PopoverAccessibleName =
  | { "aria-label": string; "aria-labelledby"?: never }
  | { "aria-label"?: never; "aria-labelledby": string };

type PopoverBaseProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "aria-label" | "aria-labelledby" | "children" | "content" | "dangerouslySetInnerHTML" | "role"
> & {
  arrow?: boolean;
  autoFocus?: boolean;
  children: PopoverTriggerElement;
  closeOnEscape?: boolean;
  closeOnFocusOut?: boolean;
  closeOnOutsideClick?: boolean;
  container?: OverlayContainer;
  content: ReactNode;
  defaultOpen?: boolean;
  forceMount?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  offset?: number;
  onOpenChange?: (open: boolean, details: PopoverOpenChangeDetails) => void;
  open?: boolean;
  placement?: PopoverPlacement;
  ref?: Ref<HTMLDivElement>;
  restoreFocus?: boolean;
  trigger?: PopoverTrigger;
  viewportPadding?: number;
};

export type PopoverProps = PopoverBaseProps & PopoverAccessibleName;
