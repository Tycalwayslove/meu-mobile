import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from "react";

/**
 * Surface treatment applied to a card.
 *
 * @public
 */
export type CardVariant = "outlined" | "filled" | "elevated";
/**
 * Preset inner spacing for a card.
 *
 * @public
 */
export type CardPadding = "none" | "small" | "medium" | "large";
export type CardFooterLayout = "content" | "actions";

/**
 * Props accepted by {@link Card}.
 *
 * @public
 */
export type CardProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "onClick" | "title"> & {
  /** Main non-interactive card content. Nullish, boolean, empty-array, and empty-fragment content does not create a body region. */
  children?: ReactNode;
  /** Supporting title text. Nullish, boolean, empty-array, and empty-fragment content does not create a header region. */
  description?: ReactNode;
  /** Compact metadata or a separate action aligned with the heading. */
  extra?: ReactNode;
  /** Footer content or an action group. Interactive controls remain independent descendants. */
  footer?: ReactNode;
  /** Preserves arbitrary footer content by default; opt into wrapping end-aligned action layout. @defaultValue "content" */
  footerLayout?: CardFooterLayout;
  /** Leading icon, avatar, or thumbnail for the header. */
  leading?: ReactNode;
  /** Full-width media rendered before the header. */
  media?: ReactNode;
  /** Optional CSS aspect ratio reserved by the media wrapper. Older WebViews require sized media content. */
  mediaAspectRatio?: CSSProperties["aspectRatio"];
  /** Section padding preset. @defaultValue "medium" */
  padding?: CardPadding;
  /** Ref to the non-interactive root div. */
  ref?: Ref<HTMLDivElement>;
  /** Card heading content. Use a native heading element when it defines a document section. */
  title?: ReactNode;
  /** Surface treatment. @defaultValue "outlined" */
  variant?: CardVariant;
};
