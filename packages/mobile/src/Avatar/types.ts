import type {
  CSSProperties,
  HTMLAttributes,
  ImgHTMLAttributes,
  ReactEventHandler,
  ReactNode,
  Ref
} from "react";

export type AvatarSize = "small" | "medium" | "large" | number;
export type AvatarShape = "circle" | "rounded" | "square";
export type AvatarFit = NonNullable<CSSProperties["objectFit"]>;

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
