import type { Meta, StoryObj } from "@storybook/react-vite";

import { Divider } from "./Divider";

const meta = {
  title: "Layout/Divider",
  component: Divider,
  parameters: {
    docs: {
      description: {
        component: "用于同一区域内的静态内容分组，保留原生 separator 语义；它不是可拖动分栏控件。"
      }
    }
  }
} satisfies Meta<typeof Divider>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithContent: Story = {
  args: { children: "订单信息" },
  play: ({ canvasElement }) => {
    const divider = canvasElement.querySelector<HTMLElement>('[role="separator"]');
    if (!divider) throw new window.Error("Expected semantic Divider");
    if (
      divider.getAttribute("aria-label") !== "订单信息" ||
      divider.getAttribute("aria-orientation") !== "horizontal"
    ) {
      throw new window.Error("Divider is missing its accessible name or orientation");
    }
  }
};
export const StartAligned: Story = { args: { align: "start", children: "更多信息" } };
export const EndAligned: Story = { args: { align: "end", children: "已完成" } };

export const Vertical: Story = {
  render: () => (
    <div style={{ alignItems: "stretch", display: "flex", height: 44, gap: 12 }}>
      <span style={{ alignSelf: "center" }}>价格</span>
      <Divider direction="vertical" aria-label="价格与库存分界" />
      <span style={{ alignSelf: "center" }}>库存</span>
    </div>
  )
};

export const LongContent: Story = {
  args: {
    children: "这是一段需要在窄屏中自然换行、且不能挤掉两侧分隔线的较长辅助说明"
  }
};

export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl">
      <Divider align="start">تفاصيل الطلب</Divider>
    </div>
  )
};
