import type {
  CSSProperties,
  HTMLAttributes,
  ImgHTMLAttributes,
  ReactEventHandler,
  ReactNode,
  Ref
} from "react";

/**
 * Preset or pixel size for an avatar.
 *
 * @public
 */
export type AvatarSize = "small" | "medium" | "large" | number;
/**
 * Outline used to clip avatar content.
 *
 * @public
 */
export type AvatarShape = "circle" | "rounded" | "square";
/**
 * CSS object-fit mode applied to an avatar image.
 *
 * @public
 */
export type AvatarFit = NonNullable<CSSProperties["objectFit"]>;

/**
 * Props accepted by {@link Avatar}.
 *
 * @public
 */
export type AvatarProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  "children" | "dangerouslySetInnerHTML" | "onError" | "onLoad"
> & {
  /** Accessible alternative for the person's identity. Use an empty string only for decorative avatars. */
  alt: string;
  /** Native image CORS mode, applied to the underlying `img`. */
  crossOrigin?: ImgHTMLAttributes<HTMLImageElement>["crossOrigin"];
  /** Browser decoding hint for the underlying `img`. @defaultValue "async" */
  decoding?: ImgHTMLAttributes<HTMLImageElement>["decoding"];
  /** Whether the underlying image participates in native drag-and-drop. @defaultValue false */
  draggable?: boolean;
  /** Replaces the generated initials when the image is loading, missing, or fails. */
  fallback?: ReactNode;
  /** Alternate image URL requested after the primary source fails, before showing the content fallback. */
  fallbackSrc?: string;
  /** Native request-priority hint for the underlying `img`. */
  fetchPriority?: ImgHTMLAttributes<HTMLImageElement>["fetchPriority"];
  /** CSS object-fit behavior for the underlying image. @defaultValue "cover" */
  fit?: AvatarFit;
  /** Explicit short initials used before the fallback derived from `alt`. */
  initials?: string;
  /** Ref to the underlying image while a source is loading or loaded. */
  imageRef?: Ref<HTMLImageElement>;
  /** Native image loading strategy. @defaultValue "eager" */
  loading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
  /** CSS `object-position` used to choose the visible focal point. @defaultValue "50% 50%" */
  objectPosition?: CSSProperties["objectPosition"];
  /** Runs when React observes a native image error, including `fallbackSrc` when provided. */
  onError?: ReactEventHandler<HTMLImageElement>;
  /** Runs when React observes the underlying image's native load event. */
  onLoad?: ReactEventHandler<HTMLImageElement>;
  /** Ref to the stable avatar root. */
  ref?: Ref<HTMLSpanElement>;
  /** Native referrer policy for the underlying image request. */
  referrerPolicy?: ImgHTMLAttributes<HTMLImageElement>["referrerPolicy"];
  /** Avatar clipping shape. @defaultValue "circle" */
  shape?: AvatarShape;
  /** Native responsive-size hint used with `srcSet`. */
  sizes?: string;
  /** Preset CSS size or a positive finite pixel size. @defaultValue "medium" */
  size?: AvatarSize;
  /** Image source. Empty and whitespace-only sources render the fallback without a request. */
  src?: string;
  /** Native responsive image candidate list; it can provide the source without `src`. */
  srcSet?: string;
};
