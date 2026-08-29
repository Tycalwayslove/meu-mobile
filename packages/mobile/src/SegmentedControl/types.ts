import type { ChangeEvent, HTMLAttributes, KeyboardEvent, MouseEvent, ReactNode, Ref } from "react";

/** Primitive value used as the stable identity of a SegmentedControl option. @public */
export type SegmentedControlValue = string | number;
/** SegmentedControl touch-target and typography scale. @public */
export type SegmentedControlSize = "small" | "medium" | "large";
/** SegmentedControl validation presentation. @public */
export type SegmentedControlStatus = "default" | "error";
/** Semantic pattern used by the segmented options. @public */
export type SegmentedControlMode = "radiogroup" | "tabs";

/** User event that requested a new SegmentedControl value. @public */
export type SegmentedControlChangeEvent =
  ChangeEvent<HTMLInputElement> | MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>;

/** One mutually exclusive radio or tab option. @public */
export type SegmentedControlOption<TValue extends SegmentedControlValue = SegmentedControlValue> = {
  /** Accessible name override for labels that do not expose useful text. */
  ariaLabel?: string;
  /** Disables the option and excludes its identity from selection, validation, and form data. @defaultValue false */
  disabled?: boolean;
  /** Decorative leading icon. It is hidden from assistive technology. */
  icon?: ReactNode;
  /** Visible option content. Do not include nested interactive elements. */
  label: ReactNode;
  /** Id of the tab panel controlled by this option when `mode="tabs"`. */
  panelId?: string;
  /** Stable DOM id for the tab when a panel needs to reference it with `aria-labelledby`. */
  tabId?: string;
  /** Unique option identity and native form value. */
  value: TValue;
};

/** Props shared by radio-group and tab-list SegmentedControl modes. @public */
export type SegmentedControlBaseProps<
  TValue extends SegmentedControlValue = SegmentedControlValue
> = Omit<HTMLAttributes<HTMLDivElement>, "children" | "defaultValue" | "onChange" | "role"> & {
  /** Expands all options evenly across the available inline width. @defaultValue false */
  block?: boolean;
  /** Initial identity for an uncontrolled control; the first enabled option is used when omitted. */
  defaultValue?: TValue;
  /** Disables every option without discarding selection. @defaultValue false */
  disabled?: boolean;
  /** Root element ref. Calling `focus()` forwards focus to the selected or first enabled control. */
  ref?: Ref<HTMLDivElement>;
  /** Controls minimum touch-target height and typography. @defaultValue "medium" */
  size?: SegmentedControlSize;
  /** Applies validation styling and `aria-invalid="true"`; caller grammar/spelling tokens are otherwise preserved on the semantic root. @defaultValue "default" */
  status?: SegmentedControlStatus;
  /** Selected identity for a controlled control; `null` intentionally leaves every option unchecked. */
  value?: TValue | null;
};

/** Native form and event contract for the default radio-group mode. @public */
export type SegmentedControlRadioProps<TValue extends SegmentedControlValue> = {
  /** Associates all native radios with a form by id, including outside that form. */
  form?: string;
  /** Uses native radio-group semantics and form behavior. @defaultValue "radiogroup" */
  mode?: "radiogroup";
  /** Native form field name shared by the radios. A stable private name is generated when omitted. */
  name?: string;
  /** Called with the original native-radio change event after the user selects a new enabled option. */
  onChange?: (value: TValue, event: ChangeEvent<HTMLInputElement>) => void;
  /** Available radio options. Values are identities and must be unique; the first duplicate wins. */
  options: readonly SegmentedControlOption<TValue>[];
  /** Requires one selection using native radio-group constraint validation. @defaultValue false */
  required?: boolean;
};

/** Navigation and panel-association contract for the tab-list mode. @public */
export type SegmentedControlTabsProps<TValue extends SegmentedControlValue> = {
  /** Uses APG tablist/tab semantics. Form-only props are intentionally unavailable. */
  mode: "tabs";
  /** Unavailable in tabs mode because tabs do not participate in form ownership. */
  form?: never;
  /** Unavailable in tabs mode because tabs are navigation, not a submitted field. */
  name?: never;
  /** Called with the button mouse/keyboard event after the user activates a new enabled tab. */
  onChange?: (
    value: TValue,
    event: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>
  ) => void;
  /** Tabs with stable ids that form a two-way relationship with caller-owned tabpanels. */
  options: readonly (Omit<SegmentedControlOption<TValue>, "panelId" | "tabId"> & {
    panelId: string;
    tabId: string;
  })[];
  /** Unavailable in tabs mode because required is a form constraint. */
  required?: never;
};

/** Props for the native radio- or APG tab-backed SegmentedControl. @public */
export type SegmentedControlProps<TValue extends SegmentedControlValue = SegmentedControlValue> =
  SegmentedControlBaseProps<TValue> &
    (SegmentedControlRadioProps<TValue> | SegmentedControlTabsProps<TValue>);
