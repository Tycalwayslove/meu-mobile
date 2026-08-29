import type { HTMLAttributes, ReactEventHandler, ReactNode, Ref, SVGProps } from "react";

/**
 * Typography applied to text-based watermark marks.
 *
 * @public
 */
export type WatermarkFont = {
  /** SVG text fill. @defaultValue "var(--meu-color-muted)" */
  color?: string;
  /** SVG text font stack. @defaultValue "var(--meu-font-ui)" */
  fontFamily?: string;
  /** Text size in CSS pixels, clamped to 1–2048. @defaultValue 14 */
  fontSize?: number;
  /** SVG font style. @defaultValue "normal" */
  fontStyle?: "normal" | "italic" | "oblique";
  /** SVG font weight. @defaultValue 600 */
  fontWeight?: "normal" | "lighter" | "bold" | "bolder" | number;
  /** Multiline baseline spacing in CSS pixels, clamped to 1–2048. */
  lineHeight?: number;
};

/**
 * Props for a repeated, optionally tamper-resistant watermark overlay.
 *
 * @public
 */
export type WatermarkProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "content" | "onError"
> & {
  /** Content beneath the non-interactive watermark overlay. */
  children?: ReactNode;
  /** Text lines used when no usable image is present; newline characters also split lines. */
  content?: string | ReadonlyArray<string>;
  /** CORS mode forwarded to the SVG image element. */
  crossOrigin?: SVGProps<SVGImageElement>["crossOrigin"];
  /** Typography for text watermarks. */
  font?: WatermarkFont;
  /** Horizontal and vertical spacing between marks, clamped to 0–2048 pixels. @defaultValue [96, 96] */
  gap?: readonly [number, number];
  /** Source mark height in CSS pixels, clamped to 1–2048. @defaultValue 64 */
  height?: number;
  /** Image URL rendered instead of text until the image fails to load. */
  image?: string;
  /** Horizontal and vertical pattern origin; each axis defaults to half its gap. */
  offset?: readonly [number, number];
  /** Called when the SVG image fails; the component then falls back to `content`. */
  onImageError?: ReactEventHandler<SVGImageElement>;
  /** Called after tamper protection restores a removed or mutated overlay. */
  onRemove?: () => void;
  /** Overlay opacity, clamped to 0–1. @defaultValue 0.16 */
  opacity?: number;
  /** Ref to the content container. */
  ref?: Ref<HTMLDivElement>;
  /** Clockwise mark rotation in degrees. @defaultValue -22 */
  rotate?: number;
  /** Restores client-side attempts to remove or mutate the watermark with MutationObserver. @defaultValue true */
  tamperProtection?: boolean;
  /** Source mark width in CSS pixels, clamped to 1–2048. @defaultValue 120 */
  width?: number;
  /** Overlay stacking level; non-finite values fall back to 9. @defaultValue 9 */
  zIndex?: number;
};
