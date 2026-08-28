"use client";

import {
  meuIconCheck,
  meuIconChevronLeft,
  meuIconPlus,
  meuIconSearch,
  meuIconX
} from "@meu/icons-core";
import { createElement, forwardRef } from "react";
import type { SVGProps } from "react";

import type { MeuIconNode } from "@meu/icons-core";

/**
 * Props shared by the generic and named Meu SVG icon components.
 *
 * @public
 */
export type MeuIconProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  /** Platform-neutral SVG geometry from `@meu/icons-core`. */
  icon: MeuIconNode;
  /** Stable kebab-case Meu icon ID written to `data-meu-icon`. */
  name: string;
  /**
   * SVG width and height. Numbers are CSS pixels.
   *
   * @defaultValue 24
   */
  size?: number | string;
  /**
   * Stroke width in the shared 24 × 24 coordinate system.
   *
   * @defaultValue 2
   */
  strokeWidth?: number;
  /** Accessible image name and optional native SVG tooltip. Omit for decorative icons. */
  title?: string;
};

/**
 * Renders curated Meu SVG geometry using `currentColor` and a 24 × 24 viewBox.
 * The icon is decorative by default; provide `title`, `aria-label`, or `aria-labelledby`
 * only when the icon itself conveys information that adjacent text does not.
 *
 * @public
 */
export const MeuIcon = forwardRef<SVGSVGElement, MeuIconProps>(function MeuIcon(
  {
    "aria-hidden": ariaHidden,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    focusable,
    icon,
    name,
    role,
    size = 24,
    strokeWidth = 2,
    title,
    ...rest
  },
  ref
) {
  const hasTitle = typeof title === "string" && title.trim().length > 0;
  const explicitlyHidden = ariaHidden === true || ariaHidden === "true";
  const labelled = !explicitlyHidden && Boolean(hasTitle || ariaLabel || ariaLabelledBy);
  const resolvedAriaHidden = ariaHidden !== undefined ? ariaHidden : labelled ? undefined : true;
  const resolvedAriaLabel =
    ariaLabel !== undefined ? ariaLabel : hasTitle && !ariaLabelledBy ? title : undefined;
  const resolvedFocusable = focusable !== undefined ? focusable : "false";
  const resolvedRole = role !== undefined ? role : labelled ? "img" : undefined;

  return (
    <svg
      {...rest}
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={resolvedAriaHidden}
      aria-label={resolvedAriaLabel}
      aria-labelledby={ariaLabelledBy}
      focusable={resolvedFocusable}
      role={resolvedRole}
      data-meu-icon={name}
    >
      {hasTitle ? <title>{title}</title> : null}
      {icon.map(([tag, attributes], index) =>
        createElement(tag, Object.assign({ key: `${name}-${index}` }, attributes))
      )}
    </svg>
  );
});

function createNamedIcon(displayName: string, name: string, icon: MeuIconNode) {
  const NamedMeuIcon = forwardRef<SVGSVGElement, Omit<MeuIconProps, "icon" | "name">>(
    function NamedMeuIcon(props, ref) {
      return <MeuIcon {...props} ref={ref} name={name} icon={icon} />;
    }
  );
  NamedMeuIcon.displayName = displayName;
  return NamedMeuIcon;
}

/**
 * Directional left chevron. The consuming navigation component owns RTL mirroring.
 *
 * @public
 */
export const MeuIconChevronLeft = createNamedIcon(
  "MeuIconChevronLeft",
  "chevron-left",
  meuIconChevronLeft
);
/**
 * Confirmation or completion mark.
 *
 * @public
 */
export const MeuIconCheck = createNamedIcon("MeuIconCheck", "check", meuIconCheck);
/**
 * Add or create mark.
 *
 * @public
 */
export const MeuIconPlus = createNamedIcon("MeuIconPlus", "plus", meuIconPlus);
/**
 * Search mark.
 *
 * @public
 */
export const MeuIconSearch = createNamedIcon("MeuIconSearch", "search", meuIconSearch);
/**
 * Close, clear, or failure mark; its accessible meaning comes from the owning control.
 *
 * @public
 */
export const MeuIconX = createNamedIcon("MeuIconX", "x", meuIconX);
