import type {
  ComponentProps,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  Ref
} from "react";

/**
 * Keyboard activation behavior for tabs.
 *
 * @public
 */
export type TabsActivationMode = "automatic" | "manual";

/**
 * One tab and its optional panel content.
 *
 * @public
 */
export type TabsItem = {
  /** Optional badge rendered next to the tab label. */
  badge?: ReactNode;
  /** Associated tabpanel content. */
  content?: ReactNode;
  /** Removes the tab from activation and roving focus. */
  disabled?: boolean;
  /** Stable identity used for value, DOM association, and state retention. */
  key: string;
  /** Visible tab label. */
  label: ReactNode;
};

/**
 * Props for an accessible tab list and its panels.
 *
 * @public
 */
export type TabsProps = Omit<ComponentProps<"div">, "children" | "defaultValue" | "onChange"> & {
  /** Activates on arrow focus or waits for Enter/Space. @defaultValue "automatic" */
  activationMode?: TabsActivationMode;
  /** Initial uncontrolled tab key. */
  defaultValue?: string;
  /** Unmounts inactive panels and therefore discards their React state. */
  destroyInactive?: boolean;
  /** Ordered tabs; keys must be unique and stable across renders. */
  items: readonly TabsItem[];
  /** Mounts a panel only after its tab has first become active, then retains it. */
  lazy?: boolean;
  /** Called after an activation request; controlled callers remain authoritative. */
  onChange?: (
    key: string,
    event: ReactMouseEvent<HTMLButtonElement> | ReactKeyboardEvent<HTMLButtonElement>
  ) => void;
  ref?: Ref<HTMLDivElement>;
  /** Makes every tab share the available row width. @defaultValue true */
  stretch?: boolean;
  /** Controlled active key. `null` renders no selected tab or panel. */
  value?: string | null;
};
