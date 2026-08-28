import type { HTMLAttributes, ReactNode, Ref, RefObject } from "react";

import type { MaskOpacity } from "../Mask";
import type { OverlayContainer } from "../overlayTypes";

export type TreeSelectValue = string | number;
export type TreeSelectStatus = "default" | "error";
export type TreeSelectSelectionMode = "any" | "leaf";
export type TreeSelectInteractionReason = "keyboard" | "pointer";
export type TreeSelectOpenChangeReason = "cancel" | "confirm" | "escape" | "mask" | "trigger";

export type TreeSelectOption<TValue extends TreeSelectValue = TreeSelectValue> = {
  children?: ReadonlyArray<TreeSelectOption<TValue>>;
  description?: ReactNode;
  disabled?: boolean;
  isLeaf?: boolean;
  label: ReactNode;
  selectable?: boolean;
  textValue?: string;
  value: TValue;
};

export type TreeSelectPath<TValue extends TreeSelectValue = TreeSelectValue> = ReadonlyArray<
  TreeSelectOption<TValue>
>;

export type TreeSelectChangeDetails<TValue extends TreeSelectValue = TreeSelectValue> = {
  option: TreeSelectOption<TValue>;
  path: TreeSelectPath<TValue>;
  reason: TreeSelectInteractionReason;
  selected: boolean;
};

export type TreeSelectExpandDetails<TValue extends TreeSelectValue = TreeSelectValue> = {
  expanded: boolean;
  option: TreeSelectOption<TValue>;
  path: TreeSelectPath<TValue>;
  reason: TreeSelectInteractionReason;
};

export type TreeSelectLoadContext = {
  signal: AbortSignal;
};

export type TreeSelectFilter<TValue extends TreeSelectValue = TreeSelectValue> = (
  query: string,
  option: TreeSelectOption<TValue>,
  path: TreeSelectPath<TValue>
) => boolean;

type TreeSelectAccessibleName =
  | { title: ReactNode; "aria-label"?: string; "aria-labelledby"?: string }
  | { title?: undefined; "aria-label": string; "aria-labelledby"?: never }
  | { title?: undefined; "aria-label"?: never; "aria-labelledby": string };

type TreeSelectBaseProps<TValue extends TreeSelectValue> = Omit<
  HTMLAttributes<HTMLDivElement>,
  "aria-label" | "aria-labelledby" | "children" | "defaultValue" | "onChange" | "onSelect" | "title"
> & {
  allowClear?: boolean;
  cancelText?: ReactNode;
  clearSearchOnClose?: boolean;
  closeOnEscape?: boolean;
  closeOnMaskClick?: boolean;
  confirmText?: ReactNode;
  container?: OverlayContainer;
  defaultExpandedValues?: ReadonlyArray<TValue>;
  defaultOpen?: boolean;
  defaultSearchValue?: string;
  defaultValue?: ReadonlyArray<TValue>;
  disabled?: boolean;
  emptyContent?: ReactNode;
  expandedValues?: ReadonlyArray<TValue>;
  filterOption?: TreeSelectFilter<TValue>;
  forceMount?: boolean;
  loadChildren?: (
    option: TreeSelectOption<TValue>,
    context: TreeSelectLoadContext
  ) => Promise<void>;
  lockScroll?: boolean;
  maskOpacity?: MaskOpacity;
  maxCount?: number;
  multiple?: boolean;
  onCancel?: (details: { reason: "cancel" | "escape" | "mask" }) => void;
  onConfirm?: (
    value: ReadonlyArray<TValue>,
    options: ReadonlyArray<TreeSelectOption<TValue>>
  ) => void;
  onExpandedValuesChange?: (
    value: ReadonlyArray<TValue>,
    details: TreeSelectExpandDetails<TValue>
  ) => void;
  onLoadError?: (error: unknown, option: TreeSelectOption<TValue>) => void;
  onOpenChange?: (open: boolean, details: { reason: TreeSelectOpenChangeReason }) => void;
  onSearchValueChange?: (value: string) => void;
  onSelect?: (
    value: ReadonlyArray<TValue>,
    options: ReadonlyArray<TreeSelectOption<TValue>>,
    details: TreeSelectChangeDetails<TValue>
  ) => void;
  open?: boolean;
  options: ReadonlyArray<TreeSelectOption<TValue>>;
  overscan?: number;
  readOnly?: boolean;
  ref?: Ref<HTMLDivElement>;
  renderOption?: (
    option: TreeSelectOption<TValue>,
    details: {
      expanded: boolean;
      level: number;
      loading: boolean;
      selected: boolean;
    }
  ) => ReactNode;
  restoreFocus?: boolean;
  returnFocusRef?: RefObject<HTMLElement | null>;
  safeArea?: boolean;
  searchPlaceholder?: string;
  searchable?: boolean;
  searchValue?: string;
  selectionMode?: TreeSelectSelectionMode;
  status?: TreeSelectStatus;
  treeAriaLabel?: string;
  treeHeight?: number;
  value?: ReadonlyArray<TValue>;
  virtual?: boolean;
};

export type TreeSelectProps<TValue extends TreeSelectValue = TreeSelectValue> =
  TreeSelectBaseProps<TValue> & TreeSelectAccessibleName;
