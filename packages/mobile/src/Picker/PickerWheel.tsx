"use client";

import { useEffect, useId, useRef } from "react";
import type { KeyboardEvent, ReactNode, UIEvent } from "react";

import { column as columnStyle, emptyOption, option as optionStyle } from "./Picker.css";
import type { PickerColumn, PickerOption, PickerSelectReason, PickerValue } from "./types";

const itemHeight = 48;
const typeaheadTimeout = 700;

function optionText<TValue extends PickerValue>(option: PickerOption<TValue>) {
  if (option.textValue) return option.textValue;
  if (typeof option.label === "string" || typeof option.label === "number") {
    return String(option.label);
  }
  return String(option.value);
}

function selectedIndex<TValue extends PickerValue>(
  column: PickerColumn<TValue>,
  value: TValue | null
) {
  if (value === null) return -1;
  return column.findIndex((option) => !option.disabled && option.value === value);
}

function nextEnabledIndex<TValue extends PickerValue>(
  column: PickerColumn<TValue>,
  fromIndex: number,
  direction: -1 | 1
) {
  let index = fromIndex + direction;
  while (index >= 0 && index < column.length) {
    if (!column[index]!.disabled) return index;
    index += direction;
  }
  return fromIndex;
}

function edgeEnabledIndex<TValue extends PickerValue>(
  column: PickerColumn<TValue>,
  direction: -1 | 1
) {
  let index = direction === 1 ? 0 : column.length - 1;
  while (index >= 0 && index < column.length) {
    if (!column[index]!.disabled) return index;
    index += direction;
  }
  return -1;
}

function advanceEnabledIndex<TValue extends PickerValue>(
  column: PickerColumn<TValue>,
  fromIndex: number,
  direction: -1 | 1,
  steps: number
) {
  let index = fromIndex;
  for (let step = 0; step < steps; step += 1) {
    const next = nextEnabledIndex(column, index, direction);
    if (next === index) break;
    index = next;
  }
  return index;
}

function nearestEnabledIndex<TValue extends PickerValue>(
  column: PickerColumn<TValue>,
  requestedIndex: number
) {
  if (column.length === 0) return -1;
  const safeIndex = Math.min(Math.max(requestedIndex, 0), column.length - 1);
  if (!column[safeIndex]!.disabled) return safeIndex;
  for (let distance = 1; distance < column.length; distance += 1) {
    const after = safeIndex + distance;
    if (after < column.length && !column[after]!.disabled) return after;
    const before = safeIndex - distance;
    if (before >= 0 && !column[before]!.disabled) return before;
  }
  return -1;
}

type PickerWheelProps<TValue extends PickerValue> = {
  column: PickerColumn<TValue>;
  columnIndex: number;
  label: string;
  onSelect: (value: TValue, reason: PickerSelectReason) => void;
  renderOption?:
    | ((
        option: PickerOption<TValue>,
        details: { columnIndex: number; selected: boolean }
      ) => ReactNode)
    | undefined;
  value: TValue | null;
};

export function PickerWheel<TValue extends PickerValue>({
  column,
  columnIndex,
  label,
  onSelect,
  renderOption,
  value
}: PickerWheelProps<TValue>) {
  const generatedId = useId();
  const wheelRef = useRef<HTMLUListElement>(null);
  const scrollTimerRef = useRef(0);
  const suppressScrollRef = useRef(false);
  const typeaheadRef = useRef("");
  const typeaheadTimerRef = useRef(0);
  const selectedValueRef = useRef<TValue | null>(value);
  const activeIndex = selectedIndex(column, value);
  const activeId = activeIndex >= 0 ? `${generatedId}-option-${activeIndex}` : undefined;

  useEffect(() => {
    const wheel = wheelRef.current;
    if (!wheel || activeIndex < 0) return;
    const targetTop = activeIndex * itemHeight;
    if (Math.abs(wheel.scrollTop - targetTop) < 1) return;
    suppressScrollRef.current = true;
    wheel.scrollTop = targetTop;
    const frame = window.requestAnimationFrame(() => {
      suppressScrollRef.current = false;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeIndex]);

  useEffect(() => {
    selectedValueRef.current = value;
  }, [value]);

  useEffect(
    () => () => {
      window.clearTimeout(scrollTimerRef.current);
      window.clearTimeout(typeaheadTimerRef.current);
    },
    []
  );

  const commitIndex = (index: number, reason: PickerSelectReason) => {
    const nextOption = column[index];
    if (!nextOption || nextOption.disabled || nextOption.value === selectedValueRef.current) return;
    selectedValueRef.current = nextOption.value;
    onSelect(nextOption.value, reason);
  };

  const scrollToIndex = (index: number) => {
    const wheel = wheelRef.current;
    if (wheel) wheel.scrollTop = index * itemHeight;
  };

  const focusWheel = () => {
    const wheel = wheelRef.current;
    if (!wheel) return;
    try {
      wheel.focus({ preventScroll: true });
    } catch {
      wheel.focus();
    }
  };

  const handleScroll = (event: UIEvent<HTMLUListElement>) => {
    if (suppressScrollRef.current) return;
    const wheel = event.currentTarget;
    window.clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = window.setTimeout(() => {
      const requestedIndex = Math.round(wheel.scrollTop / itemHeight);
      const nextIndex = nearestEnabledIndex(column, requestedIndex);
      if (nextIndex < 0) return;
      if (nextIndex !== requestedIndex) scrollToIndex(nextIndex);
      commitIndex(nextIndex, "scroll");
    }, 80);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    let nextIndex = activeIndex;
    if (event.key === "ArrowDown") {
      nextIndex = nextEnabledIndex(column, activeIndex, 1);
    } else if (event.key === "ArrowUp") {
      nextIndex = nextEnabledIndex(column, activeIndex, -1);
    } else if (event.key === "Home") {
      nextIndex = edgeEnabledIndex(column, 1);
    } else if (event.key === "End") {
      nextIndex = edgeEnabledIndex(column, -1);
    } else if (event.key === "PageDown") {
      nextIndex = advanceEnabledIndex(column, activeIndex, 1, 5);
    } else if (event.key === "PageUp") {
      nextIndex = advanceEnabledIndex(column, activeIndex, -1, 5);
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      typeaheadRef.current += event.key.toLocaleLowerCase();
      window.clearTimeout(typeaheadTimerRef.current);
      typeaheadTimerRef.current = window.setTimeout(() => {
        typeaheadRef.current = "";
      }, typeaheadTimeout);
      const search = typeaheadRef.current;
      const start = activeIndex < 0 ? 0 : activeIndex + 1;
      const ordered = [...column.slice(start), ...column.slice(0, start)];
      const matched = ordered.find(
        (candidate) =>
          !candidate.disabled && optionText(candidate).toLocaleLowerCase().startsWith(search)
      );
      nextIndex = matched ? column.indexOf(matched) : activeIndex;
    } else {
      return;
    }
    event.preventDefault();
    if (nextIndex >= 0 && nextIndex !== activeIndex) {
      scrollToIndex(nextIndex);
      commitIndex(nextIndex, "keyboard");
    }
  };

  return (
    <ul
      ref={wheelRef}
      className={columnStyle}
      role="listbox"
      tabIndex={activeIndex < 0 ? -1 : 0}
      aria-activedescendant={activeId}
      aria-disabled={activeIndex < 0 || undefined}
      aria-label={label}
      aria-orientation="vertical"
      data-column-index={columnIndex}
      onKeyDown={handleKeyDown}
      onScroll={handleScroll}
    >
      {column.length === 0 ? (
        <li className={emptyOption} aria-hidden="true">
          —
        </li>
      ) : (
        column.map((candidate, index) => {
          const selected = index === activeIndex;
          return (
            <li
              className={optionStyle}
              id={`${generatedId}-option-${index}`}
              key={`${typeof candidate.value}-${String(candidate.value)}-${index}`}
              role="option"
              aria-disabled={candidate.disabled || undefined}
              aria-label={optionText(candidate)}
              aria-selected={selected}
              onClick={() => {
                if (candidate.disabled) return;
                focusWheel();
                scrollToIndex(index);
                commitIndex(index, "pointer");
              }}
              onKeyDown={(event) => {
                if (candidate.disabled || (event.key !== "Enter" && event.key !== " ")) return;
                event.preventDefault();
                scrollToIndex(index);
                commitIndex(index, "keyboard");
              }}
            >
              {renderOption ? renderOption(candidate, { columnIndex, selected }) : candidate.label}
            </li>
          );
        })
      )}
    </ul>
  );
}
