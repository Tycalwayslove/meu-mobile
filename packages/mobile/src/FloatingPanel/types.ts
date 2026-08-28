import type { HTMLAttributes, ReactNode, Ref } from "react";

/** Physical edge where the modeless panel is attached. @public */
export type FloatingPanelPlacement = "bottom" | "top";

/** Source that requested an anchor change. @public */
export type FloatingPanelHeightChangeReason = "drag" | "handle" | "keyboard" | "imperative";

/** Metadata emitted with a height request. @public */
export type FloatingPanelHeightChangeDetails = {
  /** Index in the normalized, ascending anchor list. */
  index: number;
  /** Interaction that requested the change. */
  reason: FloatingPanelHeightChangeReason;
};

/** Options accepted by {@link FloatingPanelRef.setHeight}. @public */
export type FloatingPanelSetHeightOptions = {
  /** Skips the next transform transition. @defaultValue false */
  immediate?: boolean;
};

/** Imperative FloatingPanel handle. @public */
export type FloatingPanelRef = {
  /** Current root element, or null before mount and after unmount. */
  nativeElement: HTMLDivElement | null;
  /** Requests the normalized anchor nearest to `height`. */
  setHeight: (height: number, options?: FloatingPanelSetHeightOptions) => void;
};

/** Props for a persistent, modeless, anchored floating panel. @public */
export type FloatingPanelProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "defaultValue" | "onChange"
> & {
  /** Positive pixel heights. Values are sorted, deduplicated and clamped to the visual viewport. */
  anchors: ReadonlyArray<number>;
  /** Scrollable panel content. */
  children: ReactNode;
  /** Initial requested height for uncontrolled use. */
  defaultHeight?: number;
  /** Disables drag, click, keyboard and imperative height changes. @defaultValue false */
  disabled?: boolean;
  /** Allows non-interactive content to expand the panel before the highest anchor. @defaultValue true */
  dragFromContent?: boolean;
  /** Accessible name for the native drag-handle button. */
  handleLabel?: string;
  /** Authoritative requested height for controlled use. */
  height?: number;
  /** Milliseconds used for bounded release-velocity projection. @defaultValue 50 */
  inertiaFactor?: number;
  /** Called when an interaction requests a different normalized anchor. */
  onHeightChange?: (height: number, details: FloatingPanelHeightChangeDetails) => void;
  /** Physical viewport edge used by the panel. @defaultValue "bottom" */
  placement?: FloatingPanelPlacement;
  /** Imperative panel handle. */
  ref?: Ref<FloatingPanelRef>;
  /** Adds the matching CSS environment safe-area inset. @defaultValue true */
  safeArea?: boolean;
};
