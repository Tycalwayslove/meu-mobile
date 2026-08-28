import { MeuIconCheck, MeuIconPlus, MeuIconSearch } from "@meu/icons-react";
import {
  Button,
  Card,
  ConfigProvider,
  Divider,
  IconButton,
  SafeArea,
  Space,
  Tag,
  ThemeProvider
} from "@meu/mobile";
import { Portal, VisuallyHidden } from "@meu/primitives-react";

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

function FoundationPreview({ slug }: { slug: string }) {
  if (slug === "config-provider") {
    return (
      <ConfigProvider dir="rtl" locale="en-US" motion="reduced" theme="dark">
        <Card title="Scoped configuration" description="RTL · en-US · dark · reduced motion">
          Provider settings stay inside this component subtree, including overlays.
        </Card>
      </ConfigProvider>
    );
  }
  if (slug === "theme-provider") {
    return (
      <div style={{ display: "grid", gap: 12 }}>
        {(["light", "dark"] as const).map((theme) => (
          <ThemeProvider
            key={theme}
            theme={theme}
            style={{
              background: "var(--meu-color-surface)",
              border: "1px solid var(--meu-color-border)",
              borderRadius: "var(--meu-radius-surface)",
              color: "var(--meu-color-ink)",
              padding: 16
            }}
          >
            <strong>{theme === "light" ? "Light" : "Dark"} theme</strong>
            <p style={{ color: "var(--meu-color-muted)", marginBlockEnd: 0 }}>
              背景、文字和边框都来自语义 Token。
            </p>
          </ThemeProvider>
        ))}
      </div>
    );
  }
  if (slug === "portal") {
    return (
      <div aria-label="Portal 原地目标" role="region">
        <Portal container={null}>
          <Card title="Portal 内容">当前示例使用 container=null，在受控容器中保留 DOM。</Card>
        </Portal>
      </div>
    );
  }
  if (slug === "safe-area") {
    return (
      <div
        style={{
          background: "var(--meu-color-surface)",
          border: "1px solid var(--meu-color-border)",
          borderRadius: "var(--meu-radius-surface)",
          overflow: "hidden"
        }}
      >
        <div style={{ padding: 16 }}>底部操作区</div>
        <SafeArea position="bottom" />
      </div>
    );
  }
  if (slug === "icon") {
    return (
      <Space align="center" gap={6}>
        <MeuIconSearch title="搜索" size={28} />
        <MeuIconCheck title="完成" size={28} />
        <MeuIconPlus title="新增" size={28} />
      </Space>
    );
  }
  if (slug === "space") {
    return (
      <Space wrap gap={3}>
        <Tag>订单</Tag>
        <Tag tone="success">已支付</Tag>
        <Tag tone="warning">待发货</Tag>
      </Space>
    );
  }
  if (slug === "divider") {
    return (
      <div>
        <strong>订单信息</strong>
        <Divider>配送信息</Divider>
        <p style={{ marginBlockEnd: 0 }}>预计明日送达</p>
      </div>
    );
  }
  if (slug === "visually-hidden") {
    return (
      <button type="button" style={{ minHeight: 48, minWidth: 48 }}>
        <MeuIconSearch aria-hidden />
        <VisuallyHidden>搜索订单</VisuallyHidden>
      </button>
    );
  }

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

function ActionsPreview({ slug }: { slug: string }) {
  if (slug === "icon-button") {
    return (
      <Space gap={3}>
        <IconButton aria-label="新增商品">
          <MeuIconPlus />
        </IconButton>
        <IconButton aria-label="搜索商品" variant="outline">
          <MeuIconSearch />
        </IconButton>
      </Space>
    );
  }
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
    return <FoundationPreview slug={slug} />;
  }
  if (slug === "button" || slug === "icon-button") return <ActionsPreview slug={slug} />;
  if (overlaySlugs.has(slug)) {
    return (
      <OverlayDemo
        focus={
          slug as "action-menu" | "bottom-sheet" | "dialog" | "mask" | "popover" | "popup" | "toast"
        }
      />
    );
  }
  if (feedbackSlugs.has(slug)) {
    return <FeedbackDemo focus={slug as "empty" | "progress" | "result" | "skeleton"} />;
  }
  if (formSlugs.has(slug)) {
    return (
      <FormDemo focus={slug as "field" | "form" | "search-field" | "text-area" | "text-input"} />
    );
  }
  if (selectionSlugs.has(slug)) {
    return <SelectionDemo focus={slug as "checkbox" | "radio-group" | "switch"} />;
  }
  if (advancedEntrySlugs.has(slug)) {
    return <AdvancedEntryDemo focus={slug as "rate" | "selector" | "slider" | "stepper"} />;
  }
  if (informationSlugs.has(slug)) return <InformationDemo focus={slug as "cell" | "list"} />;
  if (displaySlugs.has(slug)) {
    return <DisplayDemo focus={slug as "avatar" | "badge" | "ellipsis" | "image" | "tag"} />;
  }
  if (containerSlugs.has(slug)) return <ContainerDemo focus={slug as "card" | "collapse"} />;
  if (navigationSlugs.has(slug)) {
    return (
      <NavigationDemo
        focus={
          slug as "nav-bar" | "pagination-dots" | "segmented-control" | "steps" | "tab-bar" | "tabs"
        }
      />
    );
  }
  if (indexedNavigationSlugs.has(slug)) {
    return <IndexedNavigationDemo focus={slug as "index-list" | "side-nav"} />;
  }
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
  return <FoundationPreview slug={slug} />;
}
