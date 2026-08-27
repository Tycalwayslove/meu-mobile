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
  alt: string;
  fallback?: ReactNode;
  fit?: AvatarFit;
  imageRef?: Ref<HTMLImageElement>;
  loading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
  onError?: ReactEventHandler<HTMLImageElement>;
  onLoad?: ReactEventHandler<HTMLImageElement>;
  ref?: Ref<HTMLSpanElement>;
  shape?: AvatarShape;
  size?: AvatarSize;
  src?: string;
};
