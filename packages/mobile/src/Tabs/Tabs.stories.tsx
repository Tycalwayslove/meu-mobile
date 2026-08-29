import type { Meta, StoryObj } from "@storybook/react-vite";

import { Tabs } from "./Tabs";

const items = [
  { key: "overview", label: "概览", content: "店铺经营概览" },
  { key: "orders", label: "订单", badge: 3, content: "订单列表" },
  { key: "products", label: "商品", content: "商品管理" },
  { key: "settings", label: "设置", content: "店铺设置" }
];

const meta = {
  title: "Navigation/Tabs",
  component: Tabs,
  args: { "aria-label": "店铺内容", items }
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Stretched: Story = {};
export const Scrollable: Story = { args: { stretch: false } };
export const OverflowAndDisabled: Story = {
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Tabs
        aria-label="订单视图"
        stretch={false}
        items={[
          { key: "all", label: "全部订单", content: "全部订单" },
          { key: "pending", label: "待付款订单", badge: 8, content: "待付款订单" },
          { key: "shipping", label: "等待发货", content: "等待发货" },
          { key: "refund", label: "退款售后", content: "退款售后", disabled: true },
          { key: "complete", label: "已完成订单", content: "已完成订单" }
        ]}
      />
    </div>
  )
};
export const ManualActivation: Story = { args: { activationMode: "manual" } };
export const LazyPanels: Story = { args: { lazy: true } };
export const KeyboardInteraction: Story = {
  args: { stretch: false },
  play: ({ canvasElement }) => {
    const tabs = canvasElement.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    const first = tabs.item(0);
    first.focus();
    first.dispatchEvent(new window.KeyboardEvent("keydown", { bubbles: true, key: "End" }));
    if (document.activeElement !== tabs.item(tabs.length - 1)) {
      throw new window.Error("End did not focus the last enabled tab");
    }
    if (tabs.item(tabs.length - 1).getAttribute("aria-selected") !== "true") {
      throw new window.Error("Automatic activation did not select the focused tab");
    }
    const visiblePanel = canvasElement.querySelector<HTMLElement>(
      '[role="tabpanel"]:not([hidden])'
    );
    if (!visiblePanel || visiblePanel.textContent !== "店铺设置") {
      throw new window.Error("The selected tab did not expose its associated panel");
    }
  }
};
export const RTL: Story = {
  render: () => (
    <div dir="rtl">
      <Tabs aria-label="أقسام المتجر" items={items} stretch={false} />
    </div>
  )
};
