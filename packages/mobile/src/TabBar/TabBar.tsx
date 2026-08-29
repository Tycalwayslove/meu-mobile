"use client";

import { useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

import { Badge } from "../Badge";
import { useMeuConfig } from "../ConfigProvider";
import { SafeArea } from "../SafeArea";
import {
  icon as iconStyle,
  item as itemStyle,
  items as itemsStyle,
  label,
  root
} from "./TabBar.css";
import type { TabBarItem, TabBarProps } from "./types";

/**
 * Renders primary mobile destinations as accessible links or buttons.
 *
 * @public
 */
export function TabBar({
  "aria-label": ariaLabel,
  className,
  defaultValue,
  items,
  onChange,
  ref,
  safeArea = false,
  value,
  ...props
}: TabBarProps) {
  const { locale } = useMeuConfig();
  const controlled = value !== undefined;
  const firstEnabled = items.find((item) => !item.disabled);
  const validDefault = items.some((item) => !item.disabled && item.key === defaultValue);
  const [uncontrolledValue, setUncontrolledValue] = useState<string | null>(() => {
    if (validDefault && defaultValue !== undefined) return defaultValue;
    return firstEnabled ? firstEnabled.key : null;
  });
  const requestedValue = controlled ? value : uncontrolledValue;
  const activeItem = items.find((item) => item.key === requestedValue);
  const normalizedValue =
    activeItem && !activeItem.disabled ? requestedValue : firstEnabled ? firstEnabled.key : null;
  const currentValue = controlled
    ? activeItem && !activeItem.disabled
      ? requestedValue
      : null
    : normalizedValue;
  if (!controlled && uncontrolledValue !== normalizedValue) {
    setUncontrolledValue(normalizedValue);
  }
  const resolvedLabel = ariaLabel || (locale === "en-US" ? "Primary navigation" : "主导航");
  const classes = className ? `${root} ${className}` : root;

  function publish(
    candidate: TabBarItem,
    event: ReactMouseEvent<HTMLAnchorElement | HTMLButtonElement>
  ) {
    if (candidate.disabled) {
      event.preventDefault();
      return;
    }
    if (candidate.onClick) {
      candidate.onClick(event);
      if (event.defaultPrevented) return;
    }
    if (candidate.key !== currentValue) {
      if (!controlled) setUncontrolledValue(candidate.key);
      if (onChange) onChange(candidate.key, event);
    }
  }

  return (
    <nav
      {...props}
      ref={ref}
      className={classes}
      aria-label={resolvedLabel}
      data-meu-component="tab-bar"
      data-safe-area={safeArea ? "true" : "false"}
    >
      <div className={itemsStyle}>
        {items.map((candidate) => {
          const active = candidate.key === currentValue;
          const classesForItem = itemStyle({ active, disabled: Boolean(candidate.disabled) });
          const resolvedIcon =
            typeof candidate.icon === "function" ? candidate.icon(active) : candidate.icon;
          const content = (
            <>
              {candidate.badge !== undefined && candidate.badge !== null ? (
                <Badge
                  content={candidate.badge}
                  {...(candidate.badgeLabel ? { label: candidate.badgeLabel } : {})}
                  bordered
                >
                  <span className={iconStyle} aria-hidden="true">
                    {resolvedIcon}
                  </span>
                </Badge>
              ) : (
                <span className={iconStyle} aria-hidden="true">
                  {resolvedIcon}
                </span>
              )}
              <span className={label}>{candidate.label}</span>
            </>
          );

          return candidate.href && !candidate.disabled ? (
            <a
              className={classesForItem}
              href={candidate.href}
              aria-label={candidate.ariaLabel}
              aria-current={active ? "page" : undefined}
              onClick={(event) => publish(candidate, event)}
              key={candidate.key}
            >
              {content}
            </a>
          ) : (
            <button
              className={classesForItem}
              type="button"
              disabled={candidate.disabled}
              aria-label={candidate.ariaLabel}
              aria-current={active ? "page" : undefined}
              onClick={(event) => publish(candidate, event)}
              key={candidate.key}
            >
              {content}
            </button>
          );
        })}
      </div>
      {safeArea ? <SafeArea position="bottom" /> : null}
    </nav>
  );
}
