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
export const LongResponsiveTitles: Story = {
  args: {
    items: [
      { title: "提交包含多件商品与优惠信息的订单", description: "系统正在校验库存与优惠" },
      { title: "商家完成打包并交付承运商", description: "预计今天 18:00 前完成" },
      { title: "确认收货并完成订单评价" }
    ]
  }
};
export const LocalLtrInsideRtl: Story = {
  decorators: [
    (Story) => (
      <div dir="rtl">
        <div dir="ltr">
          <Story />
        </div>
      </div>
    )
  ]
};
