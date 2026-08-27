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
export const ManualActivation: Story = { args: { activationMode: "manual" } };
