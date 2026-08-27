"use client";

import type { CSSProperties } from "react";

import { Image } from "../Image";
import { avatarFallback, avatarImage, avatarRoot } from "./Avatar.css";
import type { AvatarProps } from "./types";

type AvatarStyle = CSSProperties & { "--meu-avatar-size"?: string };

function deriveInitial(alt: string) {
  const characters = Array.from(alt.trim());
  const firstCharacter = characters[0];
  return firstCharacter ? firstCharacter.toLocaleUpperCase() : null;
}

export function Avatar({
  alt,
  className,
  fallback,
  fit = "cover",
  imageRef,
  loading = "eager",
  onError,
  onLoad,
  ref,
  shape = "circle",
  size = "medium",
  src,
  style,
  ...props
}: AvatarProps) {
  const customSize = typeof size === "number";
  const safeSize = customSize && Number.isFinite(size) ? Math.max(1, size) : 44;
  const resolvedStyle: AvatarStyle = customSize
    ? { ...style, "--meu-avatar-size": `${safeSize}px` }
    : style || {};
  const fallbackContent = fallback !== undefined ? fallback : deriveInitial(alt);
  const fallbackNode = <span className={avatarFallback}>{fallbackContent}</span>;
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
        fit={fit}
        radius="none"
        loading={loading}
        placeholder={fallbackNode}
        fallback={fallbackNode}
        {...(imageRef ? { imageRef } : {})}
        {...(onLoad ? { onLoad } : {})}
        {...(onError ? { onError } : {})}
        {...(src !== undefined ? { src } : {})}
      />
    </span>
  );
}
