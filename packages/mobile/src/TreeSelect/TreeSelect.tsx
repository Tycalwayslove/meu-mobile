"use client";

import { MeuIconCheck, MeuIconChevronLeft } from "@meu/icons-react";
import { VisuallyHidden } from "@meu/primitives-react";
import { defaultRangeExtractor, useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, MouseEvent } from "react";

import { Button } from "../Button";
import { useMeuConfig } from "../ConfigProvider";
import { useControllableOpen } from "../internal/useControllableOpen";
import { Popup } from "../Popup";
import { SearchField } from "../SearchField";
import {
  cancelButton,
  chevron,
  confirmButton,
  description,
  empty,
  expandTarget,
  header,
  headerButton,
  label,
  loading as loadingStyle,
  popupPanel,
  root,
  row,
  search,
  selection,
  sizer,
  title as titleStyle,
  tree,
  virtualRow
} from "./TreeSelect.css";
import {
  collectTreeSelectOptions,
  flattenTreeSelectOptions,
  normalizeTreeSelectValue
} from "./treeModel";
import type { FlatTreeSelectOption } from "./treeModel";
import type {
  TreeSelectInteractionReason,
  TreeSelectOpenChangeReason,
  TreeSelectOption,
  TreeSelectProps,
  TreeSelectValue
} from "./types";

const DEFAULT_HEIGHT = 320;
const DEFAULT_OVERSCAN = 5;
const ROW_HEIGHT = 52;

type TreeStyle = CSSProperties & { "--meu-tree-level": number };

type ValueState<TValue extends TreeSelectValue> = {
  committed: TValue[];
  draft: TValue[];
  maxCount: number;
  multiple: boolean;
  open: boolean;
  options: ReadonlyArray<TreeSelectOption<TValue>>;
  selectionMode: "any" | "leaf";
  valueSnapshot: ReadonlyArray<TValue> | undefined;
};

function sameValues<TValue extends TreeSelectValue>(
  left: ReadonlyArray<TValue>,
  right: ReadonlyArray<TValue>
) {
  return left.length === right.length && left.every((item, index) => item === right[index]);
}

function finiteInteger(
  value: number | undefined,
  fallback: number,
  minimum: number,
  maximum: number
) {
  if (value === undefined || !Number.isFinite(value)) return fallback;
  return Math.min(maximum, Math.max(minimum, Math.trunc(value)));
}

export function TreeSelect<TValue extends TreeSelectValue = TreeSelectValue>({
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  allowClear = true,
  cancelText,
  className,
  clearSearchOnClose = true,
  closeOnEscape = true,
  closeOnMaskClick = true,
  confirmText,
  container,
  defaultExpandedValues = [],
  defaultOpen = false,
  defaultSearchValue = "",
  defaultValue = [],
  disabled = false,
  emptyContent,
  expandedValues,
  filterOption,
  forceMount = false,
  loadChildren,
  lockScroll = true,
  maskOpacity = "default",
  maxCount,
  multiple = false,
  onCancel,
  onConfirm,
  onExpandedValuesChange,
  onLoadError,
  onOpenChange,
  onSearchValueChange,
  onSelect,
  open,
  options,
  overscan,
  readOnly = false,
  ref,
  renderOption,
  restoreFocus = true,
  returnFocusRef,
  safeArea = true,
  searchPlaceholder,
  searchable = true,
  searchValue,
  selectionMode = "leaf",
  status = "default",
  title,
  treeAriaLabel,
  treeHeight = DEFAULT_HEIGHT,
  value,
  virtual = true,
  ...props
}: TreeSelectProps<TValue>) {
  const config = useMeuConfig();
  const generatedId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const treeRef = useRef<HTMLDivElement>(null);
  const loadControllersRef = useRef(new Map<TValue, AbortController>());
  const typeaheadRef = useRef("");
  const typeaheadTimerRef = useRef<number | null>(null);
  const controlledValue = value !== undefined;
  const controlledExpanded = expandedValues !== undefined;
  const controlledSearch = searchValue !== undefined;
  const resolvedMaxCount = finiteInteger(
    maxCount,
    Number.MAX_SAFE_INTEGER,
    1,
    Number.MAX_SAFE_INTEGER
  );
  const resolvedHeight = finiteInteger(treeHeight, DEFAULT_HEIGHT, 120, 800);
  const resolvedOverscan = finiteInteger(overscan, DEFAULT_OVERSCAN, 0, 100);
  const [resolvedOpen, requestOpenChange] = useControllableOpen({
    defaultOpen,
    onOpenChange,
    open
  });
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState<TValue[]>([
    ...defaultExpandedValues
  ]);
  const [uncontrolledSearch, setUncontrolledSearch] = useState(defaultSearchValue);
  const [loadingValues, setLoadingValues] = useState<Set<TValue>>(() => new Set());
  const initialValue = normalizeTreeSelectValue(
    options,
    controlledValue ? value : defaultValue,
    multiple,
    selectionMode,
    resolvedMaxCount
  );
  const [storedState, setStoredState] = useState<ValueState<TValue>>(() => ({
    committed: initialValue,
    draft: initialValue,
    maxCount: resolvedMaxCount,
    multiple,
    open: resolvedOpen,
    options,
    selectionMode,
    valueSnapshot: controlledValue ? value : undefined
  }));
  let valueState = storedState;
  const normalizedControlled = controlledValue
    ? normalizeTreeSelectValue(options, value, multiple, selectionMode, resolvedMaxCount)
    : undefined;
  const optionsChanged = valueState.options !== options;
  const modeChanged =
    valueState.multiple !== multiple ||
    valueState.selectionMode !== selectionMode ||
    valueState.maxCount !== resolvedMaxCount;
  const openChanged = valueState.open !== resolvedOpen;
  const valueModeChanged = (valueState.valueSnapshot !== undefined) !== controlledValue;
  const controlledValueChanged =
    controlledValue && !sameValues(valueState.valueSnapshot || [], normalizedControlled || []);

  if (optionsChanged || modeChanged || openChanged || valueModeChanged || controlledValueChanged) {
    const committed = normalizeTreeSelectValue(
      options,
      controlledValue ? normalizedControlled : valueState.committed,
      multiple,
      selectionMode,
      resolvedMaxCount
    );
    let draft = normalizeTreeSelectValue(
      options,
      valueState.draft,
      multiple,
      selectionMode,
      resolvedMaxCount
    );
    if ((!valueState.open && resolvedOpen) || valueModeChanged || controlledValueChanged) {
      draft = [...committed];
    }
    valueState = {
      committed,
      draft,
      maxCount: resolvedMaxCount,
      multiple,
      open: resolvedOpen,
      options,
      selectionMode,
      valueSnapshot: controlledValue ? normalizedControlled : undefined
    };
    setStoredState(valueState);
  }

  const currentExpanded = controlledExpanded ? expandedValues : uncontrolledExpanded;
  const currentSearch = controlledSearch ? searchValue : uncontrolledSearch;
  const expandedSet = useMemo(() => new Set(currentExpanded), [currentExpanded]);
  const rows = useMemo(
    () =>
      flattenTreeSelectOptions(
        options,
        expandedSet,
        selectionMode,
        searchable ? currentSearch : "",
        filterOption
      ),
    [currentSearch, expandedSet, filterOption, options, searchable, selectionMode]
  );
  const registry = useMemo(() => collectTreeSelectOptions(options), [options]);
  const selectedSet = useMemo(() => new Set(valueState.draft), [valueState.draft]);
  const firstSelectedIndex = rows.findIndex((candidate) => selectedSet.has(candidate.option.value));
  const [activeIndex, setActiveIndex] = useState(firstSelectedIndex < 0 ? 0 : firstSelectedIndex);
  const hasTitle = title !== undefined && title !== null;
  const titleId = `meu-tree-select-title-${generatedId}`;
  const resolvedLabelledby = ariaLabelledby || (!ariaLabel && hasTitle ? titleId : undefined);
  const accessibleNameProps = ariaLabel
    ? ({ "aria-label": ariaLabel } as const)
    : resolvedLabelledby
      ? ({ "aria-labelledby": resolvedLabelledby } as const)
      : ({ "aria-label": config.locale === "en-US" ? "Tree select" : "树形选择" } as const);
  const localizedCancel =
    cancelText === undefined ? (config.locale === "en-US" ? "Cancel" : "取消") : cancelText;
  const localizedConfirm =
    confirmText === undefined ? (config.locale === "en-US" ? "Confirm" : "确定") : confirmText;
  const localizedSearch =
    searchPlaceholder === undefined
      ? config.locale === "en-US"
        ? "Search options"
        : "搜索选项"
      : searchPlaceholder;
  const localizedEmpty =
    emptyContent === undefined
      ? config.locale === "en-US"
        ? "No matching options"
        : "暂无匹配选项"
      : emptyContent;
  const resolvedTreeLabel =
    treeAriaLabel || (config.locale === "en-US" ? "Selectable options" : "可选项");
  const readOnlyDescriptionId = `${generatedId}-readonly-description`;
  const searching = searchable && currentSearch.trim().length > 0;

  const virtualizer = useVirtualizer<HTMLDivElement, HTMLDivElement>({
    count: virtual ? rows.length : 0,
    estimateSize: () => ROW_HEIGHT,
    getItemKey: (index) => {
      const candidate = rows[index];
      return candidate ? candidate.option.value : index;
    },
    getScrollElement: () => treeRef.current,
    initialRect: { height: resolvedHeight, width: 0 },
    overscan: resolvedOverscan,
    rangeExtractor: (range) => {
      const indexes = defaultRangeExtractor(range);
      if (activeIndex >= 0 && activeIndex < range.count && indexes.indexOf(activeIndex) === -1) {
        indexes.push(activeIndex);
        indexes.sort((left, right) => left - right);
      }
      return indexes;
    },
    useFlushSync: false
  });

  useEffect(() => {
    if (rows.length === 0) {
      setActiveIndex(0);
      return;
    }
    if (activeIndex >= rows.length) setActiveIndex(rows.length - 1);
  }, [activeIndex, rows.length]);

  const previousOpenRef = useRef(resolvedOpen);
  useEffect(() => {
    const wasOpen = previousOpenRef.current;
    previousOpenRef.current = resolvedOpen;
    if (!wasOpen || resolvedOpen || !clearSearchOnClose || currentSearch.length === 0) return;
    if (!controlledSearch) setUncontrolledSearch("");
    if (onSearchValueChange) onSearchValueChange("");
  }, [clearSearchOnClose, controlledSearch, currentSearch, onSearchValueChange, resolvedOpen]);

  useEffect(
    () => () => {
      loadControllersRef.current.forEach((controller) => controller.abort());
      if (typeaheadTimerRef.current !== null) window.clearTimeout(typeaheadTimerRef.current);
    },
    []
  );

  const focusIndex = useCallback(
    (nextIndex: number) => {
      if (rows.length === 0) return;
      const resolvedIndex = Math.min(rows.length - 1, Math.max(0, nextIndex));
      setActiveIndex(resolvedIndex);
      if (virtual) virtualizer.scrollToIndex(resolvedIndex, { align: "auto" });
      window.requestAnimationFrame(() => {
        const treeElement = treeRef.current;
        const element = treeElement
          ? treeElement.querySelector<HTMLElement>(`[data-meu-tree-index="${resolvedIndex}"]`)
          : null;
        if (element) element.focus({ preventScroll: true });
      });
    },
    [rows.length, virtual, virtualizer]
  );

  function updateSearch(nextValue: string) {
    if (!controlledSearch) setUncontrolledSearch(nextValue);
    if (onSearchValueChange) onSearchValueChange(nextValue);
  }

  const beginLoad = useCallback(
    (candidate: FlatTreeSelectOption<TValue>) => {
      const option = candidate.option;
      if (
        !loadChildren ||
        option.isLeaf !== false ||
        (option.children && option.children.length > 0) ||
        loadControllersRef.current.has(option.value)
      ) {
        return;
      }
      const controller = new AbortController();
      loadControllersRef.current.set(option.value, controller);
      setLoadingValues((current) => new Set(current).add(option.value));
      void loadChildren(option, { signal: controller.signal })
        .catch((error: unknown) => {
          if (!controller.signal.aborted && onLoadError) onLoadError(error, option);
        })
        .finally(() => {
          loadControllersRef.current.delete(option.value);
          setLoadingValues((current) => {
            const next = new Set(current);
            next.delete(option.value);
            return next;
          });
        });
    },
    [loadChildren, onLoadError]
  );

  useEffect(() => {
    rows.forEach((candidate) => {
      if (expandedSet.has(candidate.option.value)) beginLoad(candidate);
    });
  }, [beginLoad, expandedSet, rows]);

  function toggleExpanded(
    candidate: FlatTreeSelectOption<TValue>,
    reason: TreeSelectInteractionReason,
    force?: boolean
  ) {
    if (!candidate.expandable || disabled) return;
    const nextExpanded = force === undefined ? !expandedSet.has(candidate.option.value) : force;
    const next = nextExpanded
      ? [...currentExpanded, candidate.option.value]
      : currentExpanded.filter((item) => item !== candidate.option.value);
    if (!controlledExpanded) setUncontrolledExpanded(next);
    if (onExpandedValuesChange) {
      onExpandedValuesChange(next, {
        expanded: nextExpanded,
        option: candidate.option,
        path: candidate.path,
        reason
      });
    }
    if (nextExpanded) beginLoad(candidate);
  }

  function publishSelection(
    candidate: FlatTreeSelectOption<TValue>,
    reason: TreeSelectInteractionReason
  ) {
    if (!candidate.selectable || disabled || readOnly) return;
    const wasSelected = selectedSet.has(candidate.option.value);
    let next: TValue[];
    if (multiple) {
      if (wasSelected) next = valueState.draft.filter((item) => item !== candidate.option.value);
      else if (valueState.draft.length >= resolvedMaxCount) return;
      else next = [...valueState.draft, candidate.option.value];
    } else if (wasSelected && allowClear) next = [];
    else next = [candidate.option.value];
    if (sameValues(next, valueState.draft)) return;
    setStoredState({ ...valueState, draft: next });
    if (onSelect) {
      onSelect(
        next,
        next
          .map((item) => registry.options.get(item))
          .filter((item): item is TreeSelectOption<TValue> => item !== undefined),
        {
          option: candidate.option,
          path: candidate.path,
          reason,
          selected: !wasSelected
        }
      );
    }
  }

  function activate(candidate: FlatTreeSelectOption<TValue>, reason: TreeSelectInteractionReason) {
    if (candidate.selectable) publishSelection(candidate, reason);
    else if (candidate.expandable) toggleExpanded(candidate, reason);
  }

  function isVisiblyExpanded(candidate: FlatTreeSelectOption<TValue>) {
    if (expandedSet.has(candidate.option.value)) return true;
    return (
      searching && rows.some((rowCandidate) => rowCandidate.parentValue === candidate.option.value)
    );
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>, index: number) {
    const candidate = rows[index];
    if (!candidate) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusIndex(index + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusIndex(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusIndex(rows.length - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      if (candidate.expandable && !isVisiblyExpanded(candidate)) {
        toggleExpanded(candidate, "keyboard", true);
      } else if (candidate.expandable) {
        const childIndex = rows.findIndex(
          (rowCandidate) => rowCandidate.parentValue === candidate.option.value
        );
        if (childIndex >= 0) focusIndex(childIndex);
      }
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (candidate.expandable && expandedSet.has(candidate.option.value) && !searching) {
        toggleExpanded(candidate, "keyboard", false);
      } else if (candidate.parentValue !== null) {
        const parentIndex = rows.findIndex(
          (rowCandidate) => rowCandidate.option.value === candidate.parentValue
        );
        if (parentIndex >= 0) focusIndex(parentIndex);
      }
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activate(candidate, "keyboard");
    } else if (
      event.key.length === 1 &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey &&
      /\S/.test(event.key)
    ) {
      typeaheadRef.current += event.key.toLocaleLowerCase();
      if (typeaheadTimerRef.current !== null) window.clearTimeout(typeaheadTimerRef.current);
      typeaheadTimerRef.current = window.setTimeout(() => {
        typeaheadRef.current = "";
        typeaheadTimerRef.current = null;
      }, 500);
      const query = typeaheadRef.current;
      for (let offset = 1; offset <= rows.length; offset += 1) {
        const nextIndex = (index + offset) % rows.length;
        const next = rows[nextIndex];
        const text = next
          ? next.option.textValue !== undefined
            ? next.option.textValue
            : typeof next.option.label === "string"
              ? next.option.label
              : ""
          : "";
        if (text.toLocaleLowerCase().startsWith(query)) {
          event.preventDefault();
          focusIndex(nextIndex);
          break;
        }
      }
    }
  }

  function renderRow(candidate: FlatTreeSelectOption<TValue>, index: number) {
    const selected = selectedSet.has(candidate.option.value);
    const expanded = isVisiblyExpanded(candidate);
    const loading = Boolean(
      candidate.option.isLeaf === false && loadingValues.has(candidate.option.value)
    );
    const rowStyle: TreeStyle = { "--meu-tree-level": candidate.level };
    return (
      <div
        id={`${generatedId}-treeitem-${index}`}
        role="treeitem"
        aria-checked={multiple && candidate.selectable ? selected : undefined}
        aria-disabled={disabled || candidate.option.disabled || undefined}
        aria-expanded={candidate.expandable ? expanded : undefined}
        aria-level={candidate.level}
        aria-posinset={candidate.posInSet}
        aria-selected={!multiple && candidate.selectable ? selected : undefined}
        aria-setsize={candidate.setSize}
        className={row}
        data-meu-tree-index={index}
        data-readonly={readOnly || undefined}
        data-selected={selected || undefined}
        key={`${typeof candidate.option.value}-${String(candidate.option.value)}`}
        style={rowStyle}
        tabIndex={index === activeIndex ? 0 : -1}
        onClick={(event: MouseEvent<HTMLDivElement>) => {
          setActiveIndex(index);
          const target = event.target;
          const expandPressed =
            target instanceof Element && target.closest("[data-meu-tree-expand]") !== null;
          if (expandPressed) toggleExpanded(candidate, "pointer");
          else activate(candidate, "pointer");
        }}
        onFocus={() => setActiveIndex(index)}
        onKeyDown={(event) => handleKeyDown(event, index)}
      >
        <span className={expandTarget} data-meu-tree-expand aria-hidden="true">
          {candidate.expandable ? (
            <span className={chevron} data-expanded={expanded || undefined}>
              <MeuIconChevronLeft size={18} strokeWidth={2} />
            </span>
          ) : null}
        </span>
        <span className={label}>
          {renderOption
            ? renderOption(candidate.option, {
                expanded,
                level: candidate.level,
                loading,
                selected
              })
            : candidate.option.label}
          {candidate.option.description === undefined ? null : (
            <span className={description}>{candidate.option.description}</span>
          )}
        </span>
        {loading ? (
          <span className={loadingStyle} aria-hidden="true" />
        ) : (
          <span
            className={selection}
            data-multiple={multiple || undefined}
            data-selectable={candidate.selectable || undefined}
            data-selected={selected || undefined}
            aria-hidden="true"
          >
            {selected ? <MeuIconCheck size={16} strokeWidth={2.5} /> : null}
          </span>
        )}
      </div>
    );
  }

  function closeAsCancel(
    reason: Extract<TreeSelectOpenChangeReason, "cancel" | "escape" | "mask">
  ) {
    if (onCancel) onCancel({ reason });
    requestOpenChange(false, { reason });
  }

  function confirm() {
    const next = [...valueState.draft];
    if (!controlledValue) setStoredState({ ...valueState, committed: next, draft: next });
    if (onConfirm) {
      onConfirm(
        next,
        next
          .map((item) => registry.options.get(item))
          .filter((item): item is TreeSelectOption<TValue> => item !== undefined)
      );
    }
    requestOpenChange(false, { reason: "confirm" });
  }

  const virtualItems = virtual ? virtualizer.getVirtualItems() : [];

  return (
    <Popup
      {...accessibleNameProps}
      {...(container === undefined ? {} : { container })}
      {...(returnFocusRef === undefined ? {} : { returnFocusRef })}
      className={popupPanel}
      closeOnEscape={closeOnEscape}
      closeOnMaskClick={closeOnMaskClick}
      forceMount={forceMount}
      initialFocusRef={cancelRef}
      lockScroll={lockScroll}
      maskOpacity={maskOpacity}
      open={resolvedOpen}
      position="bottom"
      restoreFocus={restoreFocus}
      safeArea={safeArea}
      onOpenChange={(nextOpen, details) => {
        if (nextOpen) return;
        if (details.reason === "mask" || details.reason === "escape") closeAsCancel(details.reason);
      }}
    >
      <div
        {...props}
        ref={ref}
        className={className ? `${root} ${className}` : root}
        data-meu-component="tree-select"
        data-state={disabled ? "disabled" : readOnly ? "readonly" : status}
      >
        <div className={header}>
          <Button
            ref={cancelRef}
            className={`${headerButton} ${cancelButton}`}
            size="medium"
            variant="ghost"
            onClick={() => closeAsCancel("cancel")}
          >
            {localizedCancel}
          </Button>
          {hasTitle ? (
            <h2 className={titleStyle} id={titleId}>
              {title}
            </h2>
          ) : (
            <span />
          )}
          <Button
            className={`${headerButton} ${confirmButton}`}
            disabled={disabled}
            size="medium"
            variant="ghost"
            onClick={confirm}
          >
            {localizedConfirm}
          </Button>
        </div>
        {searchable ? (
          <div className={search}>
            <SearchField
              aria-label={localizedSearch}
              disabled={disabled}
              placeholder={localizedSearch}
              value={currentSearch}
              onChange={updateSearch}
            />
          </div>
        ) : null}
        {readOnly ? (
          <VisuallyHidden id={readOnlyDescriptionId}>
            {config.locale === "en-US" ? "Read only" : "只读"}
          </VisuallyHidden>
        ) : null}
        <div
          ref={treeRef}
          role="tree"
          aria-busy={loadingValues.size > 0 || undefined}
          aria-describedby={readOnly ? readOnlyDescriptionId : undefined}
          aria-disabled={disabled || undefined}
          aria-label={resolvedTreeLabel}
          aria-multiselectable={multiple || undefined}
          className={tree}
          data-readonly={readOnly || undefined}
          data-status={status}
          style={{ height: resolvedHeight }}
        >
          {rows.length === 0 ? (
            <div className={empty}>{localizedEmpty}</div>
          ) : virtual ? (
            <div
              className={sizer}
              role="presentation"
              style={{ height: virtualizer.getTotalSize() }}
            >
              {virtualItems.map((virtualItem) => (
                <div
                  ref={virtualizer.measureElement}
                  className={virtualRow}
                  data-index={virtualItem.index}
                  key={virtualItem.key}
                  role="presentation"
                  style={{ transform: `translateY(${virtualItem.start}px)` }}
                >
                  {renderRow(
                    rows[virtualItem.index] as FlatTreeSelectOption<TValue>,
                    virtualItem.index
                  )}
                </div>
              ))}
            </div>
          ) : (
            rows.map((candidate, index) => renderRow(candidate, index))
          )}
        </div>
      </div>
    </Popup>
  );
}
