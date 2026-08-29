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
  /** Replaces the generated initials when the image is loading, missing, or fails. */
  fallback?: ReactNode;
  /** CSS object-fit behavior for the underlying image. @defaultValue "cover" */
  fit?: AvatarFit;
  /** Explicit short initials used before the fallback derived from `alt`. */
  initials?: string;
  /** Ref to the underlying image while a source is loading or loaded. */
  imageRef?: Ref<HTMLImageElement>;
  /** Native image loading strategy. @defaultValue "eager" */
  loading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
  /** Runs after the underlying image fails. The initials fallback remains visible. */
  onError?: ReactEventHandler<HTMLImageElement>;
  /** Runs after the underlying image loads successfully. */
  onLoad?: ReactEventHandler<HTMLImageElement>;
  /** Ref to the stable avatar root. */
  ref?: Ref<HTMLSpanElement>;
  /** Avatar clipping shape. @defaultValue "circle" */
  shape?: AvatarShape;
  /** Preset CSS size or a positive finite pixel size. @defaultValue "medium" */
  size?: AvatarSize;
  /** Image source. Empty and whitespace-only sources render the fallback without a request. */
  src?: string;
};
