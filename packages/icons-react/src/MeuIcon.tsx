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

export type MeuIconProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  icon: MeuIconNode;
  name: string;
  size?: number | string;
  strokeWidth?: number;
  title?: string;
};

export const MeuIcon = forwardRef<SVGSVGElement, MeuIconProps>(function MeuIcon(
  { icon, name, size = 24, strokeWidth = 2, title, ...rest },
  ref
) {
  const labelled = typeof title === "string" && title.length > 0;

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
      aria-hidden={labelled ? undefined : true}
      aria-label={labelled ? title : undefined}
      role={labelled ? "img" : undefined}
      data-meu-icon={name}
    >
      {labelled ? <title>{title}</title> : null}
      {icon.map(([tag, attributes], index) =>
        createElement(tag, Object.assign({ key: `${name}-${index}` }, attributes))
      )}
    </svg>
  );
});

function createNamedIcon(name: string, icon: MeuIconNode) {
  return forwardRef<SVGSVGElement, Omit<MeuIconProps, "icon" | "name">>(function NamedMeuIcon(
    props,
    ref
  ) {
    return <MeuIcon {...props} ref={ref} name={name} icon={icon} />;
  });
}

export const MeuIconChevronLeft = createNamedIcon("chevron-left", meuIconChevronLeft);
export const MeuIconCheck = createNamedIcon("check", meuIconCheck);
export const MeuIconPlus = createNamedIcon("plus", meuIconPlus);
export const MeuIconSearch = createNamedIcon("search", meuIconSearch);
export const MeuIconX = createNamedIcon("x", meuIconX);
