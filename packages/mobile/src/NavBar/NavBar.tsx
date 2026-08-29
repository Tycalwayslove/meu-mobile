"use client";

import { MeuIconChevronLeft } from "@meu/icons-react";

import { useMeuConfig } from "../ConfigProvider";
import {
  back,
  backIcon as backIconStyle,
  backLabel as backLabelStyle,
  leftContent,
  leftSide,
  rightSide,
  root,
  side,
  title as titleStyle
} from "./NavBar.css";
import type { NavBarProps } from "./types";

/**
 * Renders a route-agnostic mobile page header with optional back navigation.
 *
 * @public
 */
export function NavBar({
  backAriaLabel,
  backHref,
  backIcon,
  backLabel,
  bordered = true,
  className,
  left,
  onBack,
  ref,
  right,
  safeArea = false,
  title,
  ...props
}: NavBarProps) {
  const { locale } = useMeuConfig();
  const resolvedBackLabel = backAriaLabel || (locale === "en-US" ? "Back" : "返回");
  const resolvedBackIcon =
    backIcon !== undefined ? backIcon : <MeuIconChevronLeft size={22} strokeWidth={2} />;
  const showBack = Boolean(backHref) || Boolean(onBack);
  const classes = root({ bordered, safeArea });

  const backContent = (
    <>
      <span className={backIconStyle} aria-hidden="true">
        {resolvedBackIcon}
      </span>
      {backLabel !== undefined && backLabel !== null ? (
        <span className={backLabelStyle}>{backLabel}</span>
      ) : null}
    </>
  );

  return (
    <header
      {...props}
      ref={ref}
      className={className ? `${classes} ${className}` : classes}
      data-meu-component="nav-bar"
      data-bordered={bordered ? "true" : "false"}
      data-safe-area={safeArea ? "true" : "false"}
    >
      <div className={`${side} ${leftSide}`}>
        {showBack ? (
          backHref ? (
            <a className={back} href={backHref} aria-label={resolvedBackLabel} onClick={onBack}>
              {backContent}
            </a>
          ) : (
            <button className={back} type="button" aria-label={resolvedBackLabel} onClick={onBack}>
              {backContent}
            </button>
          )
        ) : null}
        {left !== undefined && left !== null ? <div className={leftContent}>{left}</div> : null}
      </div>
      <div className={titleStyle}>{title}</div>
      <div className={`${side} ${rightSide}`}>{right}</div>
    </header>
  );
}
