/**
 * Canonical Storybook entry IDs used by the documentation site.
 *
 * Keep the IDs explicit: Storybook does not guarantee that a component has a
 * `Default` story, and deriving an ID from a title silently creates dead links.
 * `pnpm storybook:check-links` verifies every non-null ID against a freshly
 * built Storybook index and reports components that intentionally have no story.
 */
export const componentStoryIds = {
  "config-provider": null,
  "theme-provider": null,
  portal: null,
  "safe-area": "layout-safearea--bottom",
  icon: null,
  space: "layout-space--horizontal",
  divider: "layout-divider--default",
  "visually-hidden": null,
  button: "actions-button--solid",
  "icon-button": "actions-iconbutton--default",
  mask: "feedback-mask--default",
  popup: "feedback-popup--bottom",
  toast: "feedback-toast--neutral",
  dialog: "feedback-dialog--confirm",
  "bottom-sheet": "feedback-bottomsheet--default",
  "action-menu": "feedback-actionmenu--default",
  popover: "feedback-popover--default",
  progress: "feedback-progress--determinate",
  skeleton: "feedback-skeleton--paragraph",
  empty: "feedback-empty--default",
  result: "feedback-result--success",
  field: "forms-field--default",
  form: "forms-formtextinput--validation-and-submit",
  "text-input": "forms-textinput--default",
  "text-area": "forms-textarea--default",
  "search-field": "forms-searchfield--default",
  checkbox: "forms-checkbox--default",
  "radio-group": "forms-radio--default",
  switch: "forms-switch--default",
  stepper: "data-entry-stepper--default",
  slider: "data-entry-slider--default",
  rate: "data-entry-rate--default",
  selector: "data-entry-selector--single",
  "nav-bar": "navigation-navbar--default",
  tabs: "navigation-tabs--stretched",
  "segmented-control": "navigation-segmentedcontrol--default",
  "tab-bar": "navigation-tabbar--default",
  "index-list": "navigation-indexlist--default",
  "side-nav": "navigation-sidenav--default",
  cell: "information-cell-list--card",
  list: "information-cell-list--card",
  card: "information-card--outlined",
  tag: "information-tag--soft",
  badge: "information-badge--count",
  avatar: "information-avatar--image-avatar",
  image: "information-image--loaded",
  collapse: "information-collapse--multiple",
  ellipsis: "information-ellipsis--end",
  steps: "information-steps--horizontal",
  "pagination-dots": "navigation-paginationdots--dots",
  "pull-to-refresh": "gesture-pulltorefresh--default",
  "infinite-list": "collections-infinitelist--default",
  carousel: "gesture-carousel--default",
  "swipe-actions": "gesture-swipeactions--default",
  "floating-panel": "gesture-floatingpanel--bottom",
  picker: "data-entry-picker--single-column",
  "cascade-picker": "data-entry-cascadepicker--region-path",
  "date-picker": "data-entry-datepicker--default-date",
  calendar: "data-entry-calendar--single",
  "date-range-picker": "data-entry-daterangepicker--default",
  "time-picker": "data-entry-timepicker--default",
  "image-viewer": "feedback-imageviewer--gallery",
  "image-uploader": "data-entry-imageuploader--controlled",
  "number-keyboard": "data-entry-numberkeyboard--numeric",
  "passcode-input": "data-entry-passcodeinput--native-keyboard",
  "tree-select": "data-entry-treeselect--single",
  "virtual-list": "collections-virtuallist--ten-thousand-rows",
  watermark: "display-watermark--text"
} as const;

export type ComponentStorySlug = keyof typeof componentStoryIds;

export function getComponentStoryId(slug: string): string | undefined {
  if (!(slug in componentStoryIds)) return undefined;
  return componentStoryIds[slug as ComponentStorySlug] || undefined;
}
