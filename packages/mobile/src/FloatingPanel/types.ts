import type { HTMLAttributes, ReactNode, Ref } from "react";

export type FloatingPanelPlacement = "bottom" | "top";

export type FloatingPanelHeightChangeReason = "drag" | "handle" | "keyboard" | "imperative";

export type FloatingPanelHeightChangeDetails = {
  index: number;
  reason: FloatingPanelHeightChangeReason;
};

export type FloatingPanelSetHeightOptions = {
  immediate?: boolean;
};

export type FloatingPanelRef = {
  nativeElement: HTMLDivElement | null;
  setHeight: (height: number, options?: FloatingPanelSetHeightOptions) => void;
};

export type FloatingPanelProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "defaultValue" | "onChange"
> & {
  anchors: ReadonlyArray<number>;
  children: ReactNode;
  defaultHeight?: number;
  disabled?: boolean;
  dragFromContent?: boolean;
  handleLabel?: string;
  height?: number;
  inertiaFactor?: number;
  onHeightChange?: (height: number, details: FloatingPanelHeightChangeDetails) => void;
  placement?: FloatingPanelPlacement;
  ref?: Ref<FloatingPanelRef>;
  safeArea?: boolean;
};
