"use client";

import type { CSSProperties } from "react";

import { Image } from "../Image";
import { avatarFallback, avatarImage, avatarRoot } from "./Avatar.css";
import type { AvatarProps } from "./types";

type AvatarStyle = CSSProperties & {
  "--meu-avatar-object-position"?: CSSProperties["objectPosition"];
  "--meu-avatar-size"?: string;
};

function deriveInitial(alt: string) {
  const characters = Array.from(alt.trim());
  const firstCharacter = characters[0];
  return firstCharacter ? firstCharacter.toUpperCase() : null;
}

/**
 * Renders an image, initials, or fallback avatar within a fixed shape.
 *
 * @public
 */
export function Avatar({
  alt,
  className,
  crossOrigin,
  decoding = "async",
  draggable = false,
  fallback,
  fallbackSrc,
  fetchPriority,
  fit = "cover",
  imageRef,
  initials,
  loading = "eager",
  objectPosition = "50% 50%",
  onError,
  onLoad,
  ref,
  referrerPolicy,
  shape = "circle",
  sizes,
  size = "medium",
  src,
  srcSet,
  style,
  ...props
}: AvatarProps) {
  const customSize = typeof size === "number";
  const safeSize = customSize && Number.isFinite(size) ? Math.max(1, size) : 44;
  const resolvedStyle: AvatarStyle = {
    ...style,
    "--meu-avatar-object-position": objectPosition,
    ...(customSize ? { "--meu-avatar-size": `${safeSize}px` } : {})
  };
  const fallbackContent =
    fallback !== undefined
      ? fallback
      : initials !== undefined
        ? initials.trim()
        : deriveInitial(alt);
  const fallbackNode = (
    <span className={avatarFallback} data-meu-avatar-fallback="">
      {fallbackContent}
    </span>
  );
  const classes = avatarRoot({ shape, size: customSize ? "custom" : size });

  return (
    <span
      {...props}
      ref={ref}
      className={className ? `${classes} ${className}` : classes}
      style={resolvedStyle}
      data-meu-component="avatar"
      data-shape={shape}
      data-size={customSize ? safeSize : size}
    >
      <Image
        className={avatarImage}
        alt={alt}
        width="100%"
        height="100%"
        decoding={decoding}
        draggable={draggable}
        fit={fit}
        position="var(--meu-avatar-object-position, 50% 50%)"
        radius="none"
        loading={loading}
        placeholder={fallbackNode}
        fallback={fallbackNode}
        {...(crossOrigin !== undefined ? { crossOrigin } : {})}
        {...(fallbackSrc !== undefined ? { fallbackSrc } : {})}
        {...(fetchPriority !== undefined ? { fetchPriority } : {})}
        {...(referrerPolicy !== undefined ? { referrerPolicy } : {})}
        {...(sizes !== undefined ? { sizes } : {})}
        {...(srcSet !== undefined ? { srcSet } : {})}
        {...(imageRef ? { imageRef } : {})}
        {...(onLoad ? { onLoad } : {})}
        {...(onError ? { onError } : {})}
        {...(src !== undefined ? { src } : {})}
      />
    </span>
  );
}
