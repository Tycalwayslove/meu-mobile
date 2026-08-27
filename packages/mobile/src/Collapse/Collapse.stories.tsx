import type { Meta, StoryObj } from "@storybook/react-vite";

import { Collapse } from "./Collapse";

const items = [
  { value: "delivery", title: "配送范围", content: "支持中国大陆大部分城市配送。" },
  { value: "returns", title: "退换规则", content: "签收后 7 天内可申请退换。" },
  { value: "invoice", title: "发票服务", content: "暂不支持纸质发票。", disabled: true }
] as const;

const meta = {
  title: "Information/Collapse",
  component: Collapse,
  args: { items, defaultValue: ["delivery"], variant: "card" }
} satisfies Meta<typeof Collapse>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Multiple: Story = {};
export const Accordion: Story = { args: { accordion: true } };
export const Plain: Story = { args: { variant: "plain" } };
