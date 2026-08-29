import type { HTMLAttributes, MouseEventHandler, ReactNode, Ref } from "react";

/**
 * Semantic visual tone for Tag.
 *
 * @public
 */
export type TagTone = "neutral" | "accent" | "success" | "warning" | "danger";
/**
 * Surface treatment for Tag.
 *
 * @public
 */
export type TagVariant = "solid" | "soft" | "outline";
/**
 * Visual and touch-target size for Tag.
 *
 * @public
 */
export type TagSize = "small" | "medium" | "large";
/**
 * Native root element exposed by Tag's active rendering mode.
 *
 * @public
 */
export type TagRef = HTMLSpanElement | HTMLButtonElement;

/**
 * Props for a label, filter, or closable chip.
 *
 * @public
 */
export type TagProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  "children" | "dangerouslySetInnerHTML" | "onClick"
> & {
  /** Short visible label. Long text is visually truncated but remains available to assistive technology. */
  children: ReactNode;
  /** Accessible name for the independent close button. Plain-text children are included in the localized default. */
  closeAriaLabel?: string;
  /** Disables filter activation and close actions. @defaultValue false */
  disabled?: boolean;
  /** Activates filter mode using a native button. */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** Adds an independent native close button. */
  onClose?: MouseEventHandler<HTMLButtonElement>;
  /** Ref to the rendered root: the group span when closable, otherwise the primary span or filter button. */
  ref?: Ref<TagRef>;
  /** Uses fully rounded chip corners. @defaultValue false */
  rounded?: boolean;
  /** Controlled selected state for filter mode, exposed through `aria-pressed`. */
  selected?: boolean;
  /** Visual size. Interactive and close targets remain at least 44px. @defaultValue "medium" */
  size?: TagSize;
  /** Semantic visual tone. Meaning must also be present in text. @defaultValue "neutral" */
  tone?: TagTone;
  /** Surface treatment. @defaultValue "soft" */
  variant?: TagVariant;
};
