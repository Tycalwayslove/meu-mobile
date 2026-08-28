import { Button, Card, Divider, SafeArea, Space, Tag } from "@meu/mobile";

import { AdvancedEntryDemo } from "../AdvancedEntryDemo";
import { CalendarDemo } from "../CalendarDemo";
import { CarouselDemo } from "../CarouselDemo";
import { CascadePickerDemo } from "../CascadePickerDemo";
import { ContainerDemo } from "../ContainerDemo";
import { DatePickerDemo } from "../DatePickerDemo";
import { DateRangePickerDemo } from "../DateRangePickerDemo";
import { DisplayDemo } from "../DisplayDemo";
import { FeedbackDemo } from "../FeedbackDemo";
import { FloatingPanelDemo } from "../FloatingPanelDemo";
import { FormDemo } from "../FormDemo";
import { ImageUploaderDemo } from "../ImageUploaderDemo";
import { ImageViewerDemo } from "../ImageViewerDemo";
import { IndexedNavigationDemo } from "../IndexedNavigationDemo";
import { InfiniteListDemo } from "../InfiniteListDemo";
import { InformationDemo } from "../InformationDemo";
import { NavigationDemo } from "../NavigationDemo";
import { NumberKeyboardDemo } from "../NumberKeyboardDemo";
import { OverlayDemo } from "../OverlayDemo";
import { PasscodeInputDemo } from "../PasscodeInputDemo";
import { PickerDemo } from "../PickerDemo";
import { PullToRefreshDemo } from "../PullToRefreshDemo";
import { SelectionDemo } from "../SelectionDemo";
import { SwipeActionsDemo } from "../SwipeActionsDemo";
import { TimePickerDemo } from "../TimePickerDemo";
import { TreeSelectDemo } from "../TreeSelectDemo";
import { VirtualListDemo } from "../VirtualListDemo";
import { WatermarkDemo } from "../WatermarkDemo";

const selectionSlugs = new Set(["checkbox", "radio-group", "switch"]);
const advancedEntrySlugs = new Set(["stepper", "slider", "rate", "selector"]);
const formSlugs = new Set(["field", "form", "text-input", "text-area", "search-field"]);
const overlaySlugs = new Set([
  "mask",
  "popup",
  "toast",
  "dialog",
  "bottom-sheet",
  "action-menu",
  "popover"
]);
const feedbackSlugs = new Set(["progress", "skeleton", "empty", "result"]);
const informationSlugs = new Set(["cell", "list"]);
const displaySlugs = new Set(["tag", "badge", "avatar", "image", "ellipsis"]);
const containerSlugs = new Set(["card", "collapse"]);
const navigationSlugs = new Set([
  "nav-bar",
  "tabs",
  "segmented-control",
  "tab-bar",
  "steps",
  "pagination-dots"
]);
const indexedNavigationSlugs = new Set(["index-list", "side-nav"]);

function FoundationPreview() {
  return (
    <div className="foundation-preview">
      <Card
        title={<Tag tone="accent">Meu Foundations</Tag>}
        footer="颜色、空间、圆角和动效均来自可审查 Token。"
      >
        <Space direction="vertical" gap={4}>
          <strong>同一套语义，适配 Light / Dark</strong>
          <Divider />
          <Space wrap>
            <Button size="small">主要动作</Button>
            <Button size="small" variant="outline">
              次要动作
            </Button>
          </Space>
          <SafeArea position="bottom" />
        </Space>
      </Card>
    </div>
  );
}

function ActionsPreview() {
  return (
    <Space direction="vertical" gap={4}>
      <Button block>继续</Button>
      <Button block variant="outline">
        稍后处理
      </Button>
      <Button block tone="danger" variant="text">
        删除记录
      </Button>
    </Space>
  );
}

export function ComponentPreview({ slug }: { slug: string }) {
  if (
    [
      "config-provider",
      "theme-provider",
      "portal",
      "safe-area",
      "icon",
      "space",
      "divider",
      "visually-hidden"
    ].includes(slug)
  ) {
    return <FoundationPreview />;
  }
  if (slug === "button" || slug === "icon-button") return <ActionsPreview />;
  if (overlaySlugs.has(slug)) return <OverlayDemo />;
  if (feedbackSlugs.has(slug)) return <FeedbackDemo />;
  if (formSlugs.has(slug)) return <FormDemo />;
  if (selectionSlugs.has(slug)) return <SelectionDemo />;
  if (advancedEntrySlugs.has(slug)) return <AdvancedEntryDemo />;
  if (informationSlugs.has(slug)) return <InformationDemo />;
  if (displaySlugs.has(slug)) return <DisplayDemo />;
  if (containerSlugs.has(slug)) return <ContainerDemo />;
  if (navigationSlugs.has(slug)) return <NavigationDemo />;
  if (indexedNavigationSlugs.has(slug)) return <IndexedNavigationDemo />;
  if (slug === "pull-to-refresh") return <PullToRefreshDemo />;
  if (slug === "infinite-list") return <InfiniteListDemo />;
  if (slug === "carousel") return <CarouselDemo />;
  if (slug === "swipe-actions") return <SwipeActionsDemo />;
  if (slug === "floating-panel") return <FloatingPanelDemo />;
  if (slug === "picker") return <PickerDemo />;
  if (slug === "cascade-picker") return <CascadePickerDemo />;
  if (slug === "date-picker") return <DatePickerDemo />;
  if (slug === "calendar") return <CalendarDemo />;
  if (slug === "date-range-picker") return <DateRangePickerDemo />;
  if (slug === "time-picker") return <TimePickerDemo />;
  if (slug === "image-viewer") return <ImageViewerDemo />;
  if (slug === "image-uploader") return <ImageUploaderDemo />;
  if (slug === "number-keyboard") return <NumberKeyboardDemo />;
  if (slug === "passcode-input") return <PasscodeInputDemo />;
  if (slug === "tree-select") return <TreeSelectDemo />;
  if (slug === "virtual-list") return <VirtualListDemo />;
  if (slug === "watermark") return <WatermarkDemo />;
  return <FoundationPreview />;
}
