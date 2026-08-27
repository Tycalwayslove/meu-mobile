import type {
  CSSProperties,
  HTMLAttributes,
  ImgHTMLAttributes,
  ReactEventHandler,
  ReactNode,
  Ref
} from "react";

export type ImageRadius = "none" | "control" | "surface" | "round";
export type ImageFit = NonNullable<CSSProperties["objectFit"]>;
export type ImageState = "loading" | "loaded" | "error";

export type ImageProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "dangerouslySetInnerHTML" | "onError" | "onLoad"
> & {
  alt: string;
  crossOrigin?: ImgHTMLAttributes<HTMLImageElement>["crossOrigin"];
  decoding?: ImgHTMLAttributes<HTMLImageElement>["decoding"];
  draggable?: boolean;
  fallback?: ReactNode;
  fit?: ImageFit;
  height?: number | string;
  imageRef?: Ref<HTMLImageElement>;
  loading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
  onError?: ReactEventHandler<HTMLImageElement>;
  onLoad?: ReactEventHandler<HTMLImageElement>;
  placeholder?: ReactNode;
  radius?: ImageRadius;
  ref?: Ref<HTMLDivElement>;
  referrerPolicy?: ImgHTMLAttributes<HTMLImageElement>["referrerPolicy"];
  sizes?: string;
  src?: string;
  srcSet?: string;
  width?: number | string;
};
