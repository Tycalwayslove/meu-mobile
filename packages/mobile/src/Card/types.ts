import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from "react";

export type CardVariant = "outlined" | "filled" | "elevated";
export type CardPadding = "none" | "small" | "medium" | "large";
export type CardFooterLayout = "content" | "actions";

export type CardProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "onClick" | "title"> & {
  /** Main non-interactive card content. */
  children?: ReactNode;
  /** Supporting title text. */
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
