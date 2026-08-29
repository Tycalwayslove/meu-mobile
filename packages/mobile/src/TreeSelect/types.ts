import type { HTMLAttributes, ReactNode, Ref, RefObject } from "react";

import type { MaskOpacity } from "../Mask";
import type { OverlayContainer } from "../overlayTypes";

/**
 * Primitive identity supported by TreeSelect nodes.
 *
 * @public
 */
export type TreeSelectValue = string | number;
/**
 * Visual validation state applied to the TreeSelect dialog.
 *
 * @public
 */
export type TreeSelectStatus = "default" | "error";
/**
 * Determines whether selection is limited to leaves or allowed on any selectable node.
 *
 * @public
 */
export type TreeSelectSelectionMode = "any" | "leaf";
/**
 * Input path that initiated a selection or expansion request.
 *
 * @public
 */
export type TreeSelectInteractionReason = "keyboard" | "pointer";
/**
 * User action that requested a TreeSelect visibility change.
 *
 * @public
 */
export type TreeSelectOpenChangeReason = "cancel" | "confirm" | "escape" | "mask" | "trigger";

/**
 * One immutable node in a TreeSelect data source whose value must be globally unique.
 *
 * @public
 */
export type TreeSelectOption<TValue extends TreeSelectValue = TreeSelectValue> = {
  /** Loaded children. Omit while an async branch has not loaded. */
  children?: ReadonlyArray<TreeSelectOption<TValue>>;
  /** Secondary visible content. */
  description?: ReactNode;
  /** Prevents expansion and selection while retaining navigation semantics. */
  disabled?: boolean;
  /** Set to `false` for an async expandable branch whose children are not loaded yet. */
  isLeaf?: boolean;
  /** Visible node content. Rich content should also provide `textValue`. */
  label: ReactNode;
  /** Prevents selection while still allowing an enabled branch to expand. */
  selectable?: boolean;
  /** Search and type-ahead text for non-plain labels. */
  textValue?: string;
  /** Globally unique business value used for selection, expansion, and row identity. */
  value: TValue;
};

/**
 * Immutable root-to-node path, including the target node.
 *
 * @public
 */
export type TreeSelectPath<TValue extends TreeSelectValue = TreeSelectValue> = ReadonlyArray<
  TreeSelectOption<TValue>
>;

/**
 * Metadata emitted with an in-panel draft selection change.
 *
 * @public
 */
export type TreeSelectChangeDetails<TValue extends TreeSelectValue = TreeSelectValue> = {
  /** Node whose selection state changed. */
  option: TreeSelectOption<TValue>;
  /** Root-to-node path for `option`, inclusive. */
  path: TreeSelectPath<TValue>;
  /** Input path that requested the draft selection change. */
  reason: TreeSelectInteractionReason;
  /** Whether `option` is selected in the emitted draft. */
  selected: boolean;
};

/**
 * Metadata emitted when a branch requests an expansion-state change.
 *
 * @public
 */
export type TreeSelectExpandDetails<TValue extends TreeSelectValue = TreeSelectValue> = {
  /** Requested expansion state for the node. */
  expanded: boolean;
  /** Branch whose expansion state changed. */
  option: TreeSelectOption<TValue>;
  /** Root-to-branch path for `option`, inclusive. */
  path: TreeSelectPath<TValue>;
  /** Input path that requested the expansion change. */
  reason: TreeSelectInteractionReason;
};

/**
 * Lifecycle context supplied to an asynchronous branch loader.
 *
 * @public
 */
export type TreeSelectLoadContext = {
  /** Aborts when the branch collapses, becomes loaded or invalid, or the component unmounts. */
  signal: AbortSignal;
};

/**
 * Predicate used to match a query against a node and its ancestry.
 *
 * @public
 */
export type TreeSelectFilter<TValue extends TreeSelectValue = TreeSelectValue> = (
  query: string,
  option: TreeSelectOption<TValue>,
  path: TreeSelectPath<TValue>
) => boolean;

type TreeSelectAccessibleName =
  | {
      /** Visible dialog heading. */
      title: ReactNode;
      /** Optional direct dialog name; otherwise `title` labels the dialog. */
      "aria-label"?: string;
      /** Optional external labelling relationship; takes precedence over `title`. */
      "aria-labelledby"?: string;
    }
  | {
      title?: undefined;
      /** Direct accessible dialog name required when no visible title is supplied. */
      "aria-label": string;
      /** Mutually exclusive with `aria-label`. */
      "aria-labelledby"?: never;
    }
  | {
      title?: undefined;
      /** Mutually exclusive with `aria-labelledby`. */
      "aria-label"?: never;
      /** ID of an external element that labels a titleless dialog. */
      "aria-labelledby": string;
    };

type TreeSelectBaseProps<TValue extends TreeSelectValue> = Omit<
  HTMLAttributes<HTMLDivElement>,
  "aria-label" | "aria-labelledby" | "children" | "defaultValue" | "onChange" | "onSelect" | "title"
> & {
  /** Lets an already selected node clear a single-selection draft. @defaultValue true */
  allowClear?: boolean;
  /** Cancel action content; defaults to the configured locale. */
  cancelText?: ReactNode;
  /** Clears controlled or uncontrolled search text after close. @defaultValue true */
  clearSearchOnClose?: boolean;
  /** Lets Escape cancel the draft and request closure. @defaultValue true */
  closeOnEscape?: boolean;
  /** Lets a mask press cancel the draft and request closure. @defaultValue true */
  closeOnMaskClick?: boolean;
  /** Confirm action content; defaults to the configured locale. */
  confirmText?: ReactNode;
  /** Portal target; `null` renders next to the caller. Defaults to ConfigProvider's target. */
  container?: OverlayContainer;
  /** Initially expanded values for uncontrolled expansion state. @defaultValue [] */
  defaultExpandedValues?: ReadonlyArray<TValue>;
  /** Initial visibility for uncontrolled usage. @defaultValue false */
  defaultOpen?: boolean;
  /** Initial query for uncontrolled search state. @defaultValue "" */
  defaultSearchValue?: string;
  /** Initial committed selection for uncontrolled usage. Invalid values are omitted. @defaultValue [] */
  defaultValue?: ReadonlyArray<TValue>;
  /** Prevents expansion, selection, async loading, and confirmation. @defaultValue false */
  disabled?: boolean;
  /** Content shown when filtering leaves no rows; defaults to the configured locale. */
  emptyContent?: ReactNode;
  /** Controlled expanded values. */
  expandedValues?: ReadonlyArray<TValue>;
  /** Matches a trimmed query against a node and its root-to-node path. */
  filterOption?: TreeSelectFilter<TValue>;
  /** Keeps the closed selector mounted and hidden after hydration. @defaultValue false */
  forceMount?: boolean;
  /** Loads an expanded `isLeaf: false` branch with no children; update `options` to publish results. */
  loadChildren?: (
    option: TreeSelectOption<TValue>,
    context: TreeSelectLoadContext
  ) => Promise<void>;
  /** Accessible text exposed while an async branch is loading. */
  loadingText?: string;
  /** Accessible text exposed after an async branch load rejects. */
  loadErrorText?: string;
  /** Prevents document-body scrolling while open. @defaultValue true */
  lockScroll?: boolean;
  /** Backdrop opacity token. @defaultValue "default" */
  maskOpacity?: MaskOpacity;
  /** Maximum draft selections in multiple mode, clamped to at least one. */
  maxCount?: number;
  /** Enables independent multi-selection and tree `aria-checked` semantics. @defaultValue false */
  multiple?: boolean;
  /** Called before cancel, Escape, or mask dismissal requests closure. */
  onCancel?: (details: { reason: "cancel" | "escape" | "mask" }) => void;
  /** Called with the committed draft before confirmation requests closure. */
  onConfirm?: (
    value: ReadonlyArray<TValue>,
    options: ReadonlyArray<TreeSelectOption<TValue>>
  ) => void;
  /** Reports a requested expansion state; controlled callers must update `expandedValues`. */
  onExpandedValuesChange?: (
    value: ReadonlyArray<TValue>,
    details: TreeSelectExpandDetails<TValue>
  ) => void;
  /** Receives a synchronous throw or rejected branch load unless its signal was aborted. */
  onLoadError?: (error: unknown, option: TreeSelectOption<TValue>) => void;
  /** Reports visibility requests after trigger, cancel, confirm, Escape, or mask interaction. */
  onOpenChange?: (open: boolean, details: { reason: TreeSelectOpenChangeReason }) => void;
  /** Reports each query proposal, including the automatic clear after close. */
  onSearchValueChange?: (value: string) => void;
  /** Reports in-panel draft changes without committing them. */
  onSelect?: (
    value: ReadonlyArray<TValue>,
    options: ReadonlyArray<TreeSelectOption<TValue>>,
    details: TreeSelectChangeDetails<TValue>
  ) => void;
  /** Controlled visibility. */
  open?: boolean;
  /** Immutable tree data. Replace affected arrays after async loading or business updates. */
  options: ReadonlyArray<TreeSelectOption<TValue>>;
  /** Extra virtual rows mounted before and after the visible window, clamped to 0–100. @defaultValue 5 */
  overscan?: number;
  /** Prevents draft selection changes while preserving search, navigation, and expansion. @defaultValue false */
  readOnly?: boolean;
  /** Ref to the selector content root inside the popup. */
  ref?: Ref<HTMLDivElement>;
  /** Customizes row content; descendants should remain non-interactive. */
  renderOption?: (
    option: TreeSelectOption<TValue>,
    details: {
      expanded: boolean;
      level: number;
      loading: boolean;
      selected: boolean;
    }
  ) => ReactNode;
  /** Restores focus after close when focus remains inside the selector. @defaultValue true */
  restoreFocus?: boolean;
  /** Explicit focus-restoration target; otherwise the previously focused element is used. */
  returnFocusRef?: RefObject<HTMLElement | null>;
  /** Adds the bottom device safe-area inset. @defaultValue true */
  safeArea?: boolean;
  /** Search-field placeholder and accessible name; defaults to the configured locale. */
  searchPlaceholder?: string;
  /** Renders the search field and enables filtering. @defaultValue true */
  searchable?: boolean;
  /** Controlled search query. */
  searchValue?: string;
  /** Restricts selection to leaf nodes or permits any selectable node. @defaultValue "leaf" */
  selectionMode?: TreeSelectSelectionMode;
  /** Visual validation state announced as `aria-invalid="true"` on the tree; caller grammar/spelling tokens are otherwise preserved there. @defaultValue "default" */
  status?: TreeSelectStatus;
  /** Accessible name for the inner tree; defaults to the configured locale. */
  treeAriaLabel?: string;
  /** Tree viewport height in pixels, clamped to 120–800. @defaultValue 320 */
  treeHeight?: number;
  /** Controlled committed selection; in-panel selection remains a draft until confirm. */
  value?: ReadonlyArray<TValue>;
  /** Virtualizes tree rows after hydration; SSR renders the full visible tree. @defaultValue true */
  virtual?: boolean;
};

/**
 * Props for a confirmation-based, searchable hierarchical selector.
 *
 * @public
 */
export type TreeSelectProps<TValue extends TreeSelectValue = TreeSelectValue> =
  TreeSelectBaseProps<TValue> & TreeSelectAccessibleName;
