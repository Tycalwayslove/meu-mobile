import type {
  TreeSelectFilter,
  TreeSelectOption,
  TreeSelectPath,
  TreeSelectSelectionMode,
  TreeSelectValue
} from "./types";

export type FlatTreeSelectOption<TValue extends TreeSelectValue> = {
  expandable: boolean;
  level: number;
  option: TreeSelectOption<TValue>;
  parentValue: TValue | null;
  path: TreeSelectPath<TValue>;
  posInSet: number;
  selectable: boolean;
  setSize: number;
};

function textForOption<TValue extends TreeSelectValue>(option: TreeSelectOption<TValue>) {
  if (option.textValue !== undefined) return option.textValue;
  return typeof option.label === "string" || typeof option.label === "number"
    ? String(option.label)
    : "";
}

export function isExpandableOption<TValue extends TreeSelectValue>(
  option: TreeSelectOption<TValue>
) {
  return Boolean((option.children && option.children.length > 0) || option.isLeaf === false);
}

export function isSelectableOption<TValue extends TreeSelectValue>(
  option: TreeSelectOption<TValue>,
  selectionMode: TreeSelectSelectionMode
) {
  if (option.disabled || option.selectable === false) return false;
  return selectionMode === "any" || !isExpandableOption(option);
}

export function defaultTreeSelectFilter<TValue extends TreeSelectValue>(
  query: string,
  option: TreeSelectOption<TValue>
) {
  return textForOption(option).toLocaleLowerCase().includes(query.toLocaleLowerCase());
}

export function flattenTreeSelectOptions<TValue extends TreeSelectValue>(
  options: ReadonlyArray<TreeSelectOption<TValue>>,
  expandedValues: ReadonlySet<TValue>,
  selectionMode: TreeSelectSelectionMode,
  query: string,
  filterOption: TreeSelectFilter<TValue> = defaultTreeSelectFilter
) {
  const normalizedQuery = query.trim();
  const seen = new Set<TValue>();

  function visit(
    siblings: ReadonlyArray<TreeSelectOption<TValue>>,
    ancestors: ReadonlyArray<TreeSelectOption<TValue>>,
    parentValue: TValue | null
  ): Array<FlatTreeSelectOption<TValue>> {
    const result: Array<FlatTreeSelectOption<TValue>> = [];
    siblings.forEach((option, siblingIndex) => {
      if (seen.has(option.value)) return;
      seen.add(option.value);
      const path = [...ancestors, option];
      const children = option.children || [];
      const childRows = visit(children, path, option.value);
      const matches = normalizedQuery.length === 0 || filterOption(normalizedQuery, option, path);
      const hasMatchingDescendant = normalizedQuery.length > 0 && childRows.length > 0;
      if (!matches && !hasMatchingDescendant) return;
      result.push({
        expandable: isExpandableOption(option),
        level: path.length,
        option,
        parentValue,
        path,
        posInSet: siblingIndex + 1,
        selectable: isSelectableOption(option, selectionMode),
        setSize: siblings.length
      });
      if (children.length > 0 && (normalizedQuery.length > 0 || expandedValues.has(option.value))) {
        result.push(...childRows);
      }
    });
    return result;
  }

  return visit(options, [], null);
}

export function collectTreeSelectOptions<TValue extends TreeSelectValue>(
  options: ReadonlyArray<TreeSelectOption<TValue>>
) {
  const result = new Map<TValue, TreeSelectOption<TValue>>();
  const paths = new Map<TValue, TreeSelectPath<TValue>>();

  function visit(
    siblings: ReadonlyArray<TreeSelectOption<TValue>>,
    ancestors: ReadonlyArray<TreeSelectOption<TValue>>
  ) {
    siblings.forEach((option) => {
      if (result.has(option.value)) return;
      const path = [...ancestors, option];
      result.set(option.value, option);
      paths.set(option.value, path);
      if (option.children) visit(option.children, path);
    });
  }

  visit(options, []);
  return { options: result, paths };
}

export function normalizeTreeSelectValue<TValue extends TreeSelectValue>(
  options: ReadonlyArray<TreeSelectOption<TValue>>,
  values: ReadonlyArray<TValue> | undefined,
  multiple: boolean,
  selectionMode: TreeSelectSelectionMode,
  maxCount: number
) {
  const registry = collectTreeSelectOptions(options).options;
  const result: TValue[] = [];
  const seen = new Set<TValue>();
  const limit = multiple ? maxCount : 1;
  for (const value of values || []) {
    const option = registry.get(value);
    if (!option || seen.has(value) || !isSelectableOption(option, selectionMode)) continue;
    seen.add(value);
    result.push(value);
    if (result.length >= limit) break;
  }
  return result;
}
