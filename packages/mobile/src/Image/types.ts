import type {
  CSSProperties,
  HTMLAttributes,
  ImgHTMLAttributes,
  ReactEventHandler,
  ReactNode,
  Ref
} from "react";

/**
 * Corner treatment applied to an image frame.
 *
 * @public
 */
export type ImageRadius = "none" | "control" | "surface" | "round";
/**
 * CSS object-fit mode applied to an image.
 *
 * @public
 */
export type ImageFit = NonNullable<CSSProperties["objectFit"]>;
/**
 * Current source lifecycle state of an image.
 *
 * @public
 */
export type ImageState = "loading" | "loaded" | "error";

/**
 * Props for a stateful image with loading and failure content.
 *
 * @public
 */
export type ImageProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "dangerouslySetInnerHTML" | "onError" | "onLoad"
> & {
  /** Text alternative for the image and, on failure, the fallback graphic; use an empty string for decorative images. */
  alt: string;
  /** Native image CORS mode, applied to the underlying `img`. */
  crossOrigin?: ImgHTMLAttributes<HTMLImageElement>["crossOrigin"];
  /** Browser decoding hint for the underlying `img`. @defaultValue "async" */
  decoding?: ImgHTMLAttributes<HTMLImageElement>["decoding"];
  /** Whether the underlying image participates in native drag-and-drop. @defaultValue false */
  draggable?: boolean;
  /** Content shown when the source is absent or fails to load; defaults to a decorative image glyph. */
  fallback?: ReactNode;
  /** CSS `object-fit` applied to the underlying image. @defaultValue "cover" */
  fit?: ImageFit;
  /** Root height; numbers become non-negative pixel lengths. */
  height?: number | string;
  /** Ref to the underlying `img`; it is `null` while no valid source is rendered. */
  imageRef?: Ref<HTMLImageElement>;
  /** Native loading strategy for the underlying image. @defaultValue "eager" */
  loading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
  /** Called after the underlying image enters the error state. */
  onError?: ReactEventHandler<HTMLImageElement>;
  /** Called after the underlying image loads successfully. */
  onLoad?: ReactEventHandler<HTMLImageElement>;
  /** Content overlaid while the source loads; defaults to a decorative image glyph. */
  placeholder?: ReactNode;
  /** Corner treatment for the root and clipped image. @defaultValue "none" */
  radius?: ImageRadius;
  /** Ref to the stateful wrapper element. */
  ref?: Ref<HTMLDivElement>;
  /** Native referrer policy for the underlying image request. */
  referrerPolicy?: ImgHTMLAttributes<HTMLImageElement>["referrerPolicy"];
  /** Native responsive-size hint used with `srcSet`. */
  sizes?: string;
  /** Image URL; blank strings are treated as absent. */
  src?: string;
  /** Native responsive source candidate list; it can provide the source without `src`. */
  srcSet?: string;
  /** Root width; numbers become non-negative pixel lengths. */
  width?: number | string;
};
