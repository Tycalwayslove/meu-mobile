"use client";

import { MeuIconChevronLeft } from "@meu/icons-react";
import { useId, useState } from "react";

import {
  arrow as arrowStyle,
  content,
  extra as extraStyle,
  item as itemStyle,
  panel,
  panelInner,
  root,
  title as titleStyle,
  trigger
} from "./Collapse.css";
import type { CollapseItem, CollapseProps } from "./types";

function normalizeValue(
  source: readonly string[] | undefined,
  items: readonly CollapseItem[],
  accordion: boolean
) {
  const allowed = new Set(items.map((item) => item.value));
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of source || []) {
    if (!allowed.has(value) || seen.has(value)) continue;
    seen.add(value);
    result.push(value);
    if (accordion) break;
  }

  return result;
}

function sameValue(left: readonly string[], right: readonly string[]) {
  return left.length === right.length && left.every((entry, index) => entry === right[index]);
}

export function Collapse({
  accordion = false,
  arrow,
  className,
  defaultValue,
  items,
  onChange,
  ref,
  role = "group",
  value,
  variant = "plain",
  ...props
}: CollapseProps) {
  const baseId = useId();
  const controlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(() =>
    normalizeValue(defaultValue, items, accordion)
  );
  const normalizedInternalValue = normalizeValue(internalValue, items, accordion);
  if (!controlled && !sameValue(internalValue, normalizedInternalValue)) {
    setInternalValue(normalizedInternalValue);
  }
  const activeValue = controlled
    ? normalizeValue(value, items, accordion)
    : normalizedInternalValue;
  const classes = root({ variant });

  return (
    <div
      {...props}
      ref={ref}
      role={role}
      className={className ? `${classes} ${className}` : classes}
      data-meu-component="collapse"
      data-variant={variant}
    >
      {items.map((item, index) => {
        const expanded = activeValue.includes(item.value);
        const triggerId = `${baseId}-trigger-${index}`;
        const panelId = `${baseId}-panel-${index}`;
        const arrowNode = typeof arrow === "function" ? arrow(expanded) : arrow;

        return (
          <div
            className={itemStyle}
            key={item.value}
            data-meu-collapse-item={item.value}
            data-state={item.disabled ? "disabled" : expanded ? "expanded" : "collapsed"}
          >
            <button
              id={triggerId}
              className={trigger({ expanded })}
              type="button"
              disabled={item.disabled}
              aria-controls={panelId}
              aria-expanded={expanded}
              onClick={(event) => {
                const nextValue = accordion
                  ? expanded
                    ? []
                    : [item.value]
                  : expanded
                    ? activeValue.filter((entry) => entry !== item.value)
                    : [...activeValue, item.value];

                if (!controlled) setInternalValue(nextValue);
                if (onChange) onChange(nextValue, event);
              }}
            >
              <span className={titleStyle}>{item.title}</span>
              {item.extra !== undefined && item.extra !== null ? (
                <span className={extraStyle}>{item.extra}</span>
              ) : null}
              <span className={arrowStyle({ expanded })} aria-hidden="true">
                {arrowNode || <MeuIconChevronLeft size={18} strokeWidth={2} />}
              </span>
            </button>
            <div
              id={panelId}
              className={panel({ expanded })}
              role="region"
              aria-hidden={!expanded}
              aria-labelledby={triggerId}
              inert={!expanded}
            >
              <div className={panelInner}>
                <div className={content}>{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
