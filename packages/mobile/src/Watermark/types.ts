import type { HTMLAttributes, ReactEventHandler, ReactNode, Ref, SVGProps } from "react";

export type WatermarkFont = {
  color?: string;
  fontFamily?: string;
  fontSize?: number;
  fontStyle?: "normal" | "italic" | "oblique";
  fontWeight?: "normal" | "lighter" | "bold" | "bolder" | number;
  lineHeight?: number;
};

export type WatermarkProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "content" | "onError"
> & {
  children?: ReactNode;
  content?: string | ReadonlyArray<string>;
  crossOrigin?: SVGProps<SVGImageElement>["crossOrigin"];
  font?: WatermarkFont;
  gap?: readonly [number, number];
  height?: number;
  image?: string;
  offset?: readonly [number, number];
  onImageError?: ReactEventHandler<SVGImageElement>;
  onRemove?: () => void;
  opacity?: number;
  ref?: Ref<HTMLDivElement>;
  rotate?: number;
  tamperProtection?: boolean;
  width?: number;
  zIndex?: number;
};
