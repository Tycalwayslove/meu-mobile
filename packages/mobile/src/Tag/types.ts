import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  MouseEventHandler,
  ReactNode,
  Ref
} from "react";

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
type TagVisualProps = {
  /** Short visible label. Long text is visually truncated but remains available to assistive technology. */
  children: ReactNode;
  /** Accessible name for the independent close button. Plain-text children are included in the localized default. */
  closeAriaLabel?: string;
  /** Disables filter activation and close actions. Static labels only receive an unavailable visual state. @defaultValue false */
  disabled?: boolean;
  /** Uses fully rounded chip corners. @defaultValue false */
  rounded?: boolean;
  /** Controlled selected state for filter mode, exposed through `aria-pressed`. Ignored without `onClick`. */
  selected?: boolean;
  /** Visual size. Interactive and close targets remain at least 44px. @defaultValue "medium" */
  size?: TagSize;
  /** Semantic visual tone. Meaning must also be present in text. @defaultValue "neutral" */
  tone?: TagTone;
  /** Surface treatment. @defaultValue "soft" */
  variant?: TagVariant;
};

type TagSpanRootAttributes = Omit<
  HTMLAttributes<HTMLSpanElement>,
  "children" | "dangerouslySetInnerHTML" | "onClick"
>;

type TagButtonRootAttributes = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "dangerouslySetInnerHTML" | "disabled" | "onClick" | "type"
>;

/** Props for a non-interactive label. @public */
export type TagStaticProps = TagSpanRootAttributes &
  TagVisualProps & {
    onClick?: undefined;
    onClose?: undefined;
    /** Ref to the actual Tag root element. */
    ref?: Ref<HTMLSpanElement>;
  };

/** Props for a native filter button. @public */
export type TagFilterProps = TagButtonRootAttributes &
  TagVisualProps & {
    /** Activates filter mode using a native `type="button"` button. */
    onClick: MouseEventHandler<HTMLButtonElement>;
    onClose?: undefined;
    /** Ref to the actual Tag root element. */
    ref?: Ref<HTMLButtonElement>;
  };

/** Props for a closable label or filter with a span group root and an independent close button. @public */
export type TagClosableProps = TagSpanRootAttributes &
  TagVisualProps & {
    /** Optionally activates the primary filter button. */
    onClick?: MouseEventHandler<HTMLButtonElement>;
    /** Adds an independent native close button. */
    onClose: MouseEventHandler<HTMLButtonElement>;
    /** Ref to the actual Tag root element. */
    ref?: Ref<HTMLSpanElement>;
  };

/**
 * Props for a label, filter, or closable chip. Native button attributes are available only in filter-only mode;
 * closable mode applies root attributes to its span group.
 *
 * @public
 */
export type TagProps = TagStaticProps | TagFilterProps | TagClosableProps;
