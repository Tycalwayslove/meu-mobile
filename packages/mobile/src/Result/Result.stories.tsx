import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../Button";
import { Result } from "./Result";

const meta = {
  title: "Feedback/Result",
  component: Result,
  args: {
    actions: <Button size="small">查看详情</Button>,
    description: "商家将在今天处理这笔订单。",
    status: "success",
    title: "订单提交成功"
  }
} satisfies Meta<typeof Result>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {};
export const Error: Story = {
  args: { description: "请检查网络后重试。", status: "error", title: "提交失败" }
};
export const Warning: Story = { args: { status: "warning", title: "库存发生变化" } };
export const Waiting: Story = { args: { status: "waiting", title: "正在等待商家确认" } };
