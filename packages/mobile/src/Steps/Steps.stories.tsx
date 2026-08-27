import type { Meta, StoryObj } from "@storybook/react-vite";

import { Steps } from "./Steps";

const items = [
  { title: "提交订单", description: "08:30" },
  { title: "商家发货", description: "预计今天完成" },
  { title: "运输中", description: "等待揽收" },
  { title: "确认收货" }
];

const meta = {
  title: "Information/Steps",
  component: Steps,
  args: { current: 1, items }
} satisfies Meta<typeof Steps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {};
export const Vertical: Story = { args: { direction: "vertical" } };
export const Error: Story = {
  args: {
    items: items.map((item, index) => (index === 1 ? { ...item, status: "error" as const } : item))
  }
};
