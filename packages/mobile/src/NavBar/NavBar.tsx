"use client";

import { MeuIconChevronLeft } from "@meu/icons-react";
import type { MouseEvent as ReactMouseEvent } from "react";

import { useMeuConfig } from "../ConfigProvider";
import {
  back,
  backIcon as backIconStyle,
  backLabel as backLabelStyle,
  backSpinner,
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
  backDisabled = false,
  backHref,
  backIcon,
  backLabel,
  backLoading = false,
  bordered = true,
  className,
  dir,
  left,
  onBack,
  position = "static",
  ref,
  right,
  safeArea = false,
  scrolled = false,
  title,
  ...props
}: NavBarProps) {
  const { dir: configuredDir, locale, motion } = useMeuConfig();
  const resolvedDir = dir === "ltr" || dir === "rtl" ? dir : configuredDir;
  const resolvedBackLabel = backAriaLabel || (locale === "en-US" ? "Back" : "返回");
  const resolvedBackIcon =
    backIcon !== undefined ? backIcon : <MeuIconChevronLeft size={22} strokeWidth={2} />;
  const showBack = Boolean(backHref) || Boolean(onBack);
  const backUnavailable = backDisabled || backLoading;
  const backState = backLoading ? "loading" : backDisabled ? "disabled" : "default";
  const classes = root({ bordered, position, safeArea, scrolled });
  const backClasses = back({ disabled: backUnavailable });

  function handleBack(event: ReactMouseEvent<HTMLAnchorElement | HTMLButtonElement>) {
    if (backUnavailable) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (onBack) onBack(event);
  }

  const backContent = (
    <>
      <span className={backIconStyle({ direction: resolvedDir })} aria-hidden="true">
        {backLoading ? <span className={backSpinner({ motion })} /> : resolvedBackIcon}
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
      dir={dir}
      data-meu-component="nav-bar"
      data-back-state={showBack ? backState : "hidden"}
      data-bordered={bordered ? "true" : "false"}
      data-position={position}
      data-safe-area={safeArea ? "true" : "false"}
      data-scrolled={scrolled ? "true" : "false"}
    >
      <div className={`${side} ${leftSide}`}>
        {showBack ? (
          backHref ? (
            // eslint-disable-next-line jsx-a11y/anchor-is-valid -- Unavailable links intentionally keep anchor identity while SSR omits href.
            <a
              className={backClasses}
              href={backUnavailable ? undefined : backHref}
              role={backUnavailable ? "link" : undefined}
              aria-busy={backLoading || undefined}
              aria-disabled={backUnavailable || undefined}
              aria-label={resolvedBackLabel}
              data-state={backState}
              onClick={handleBack}
              tabIndex={backUnavailable ? -1 : undefined}
            >
              {backContent}
            </a>
          ) : (
            <button
              className={backClasses}
              type="button"
              disabled={backUnavailable}
              aria-busy={backLoading || undefined}
              aria-label={resolvedBackLabel}
              data-state={backState}
              onClick={handleBack}
            >
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
