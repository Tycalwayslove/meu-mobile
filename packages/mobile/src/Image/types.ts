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
 * CSS object-position value applied to an image.
 *
 * @public
 */
export type ImagePosition = NonNullable<CSSProperties["objectPosition"]>;
/**
 * Current source lifecycle state of an image.
 *
 * @public
 */
export type ImageState = "loading" | "loaded" | "error";

/**
 * Native image attributes that are not already controlled by {@link ImageProps}.
 *
 * @public
 */
export type ImageNativeProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  | "alt"
  | "aria-hidden"
  | "aria-label"
  | "aria-labelledby"
  | "children"
  | "crossOrigin"
  | "dangerouslySetInnerHTML"
  | "decoding"
  | "draggable"
  | "fetchPriority"
  | "height"
  | "loading"
  | "onError"
  | "onLoad"
  | "ref"
  | "referrerPolicy"
  | "role"
  | "sizes"
  | "src"
  | "srcSet"
  | "width"
>;

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
  /** CSS aspect-ratio reserved by the root before image bytes arrive. */
  aspectRatio?: CSSProperties["aspectRatio"];
  /** Native image CORS mode, applied to the underlying `img`. */
  crossOrigin?: ImgHTMLAttributes<HTMLImageElement>["crossOrigin"];
  /** Browser decoding hint for the underlying `img`. @defaultValue "async" */
  decoding?: ImgHTMLAttributes<HTMLImageElement>["decoding"];
  /** Whether the underlying image participates in native drag-and-drop. @defaultValue false */
  draggable?: boolean;
  /** Content shown when the source is absent or fails to load; defaults to a decorative image glyph. */
  fallback?: ReactNode;
  /** One alternate URL requested after the primary source fails, or immediately when the primary source is absent. */
  fallbackSrc?: string;
  /** Native request-priority hint for the underlying `img`. */
  fetchPriority?: ImgHTMLAttributes<HTMLImageElement>["fetchPriority"];
  /** CSS `object-fit` applied to the underlying image. @defaultValue "cover" */
  fit?: ImageFit;
  /** Root height; numbers become non-negative pixel lengths. */
  height?: number | string;
  /** Ref to the underlying `img`; it is `null` while no valid source is rendered. */
  imageRef?: Ref<HTMLImageElement>;
  /** Additional non-conflicting native attributes for the underlying `img`; className and style are merged. */
  imageProps?: ImageNativeProps;
  /** Native intrinsic image height. Use with `intrinsicWidth` to reserve the source ratio. */
  intrinsicHeight?: number;
  /** Native intrinsic image width. Use with `intrinsicHeight` to reserve the source ratio. */
  intrinsicWidth?: number;
  /** Native loading strategy for the underlying image. @defaultValue "eager" */
  loading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
  /** Called when React observes a native error event, including primary and fallback requests. */
  onError?: ReactEventHandler<HTMLImageElement>;
  /** Called when React observes a native load event for the current primary or fallback image. */
  onLoad?: ReactEventHandler<HTMLImageElement>;
  /** Content overlaid while the source loads; defaults to a decorative image glyph. */
  placeholder?: ReactNode;
  /** CSS `object-position` applied to the underlying image. @defaultValue "50% 50%" */
  position?: ImagePosition;
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
