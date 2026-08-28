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
  args: { description: "请检查网络后重试。", role: "alert", status: "error", title: "提交失败" }
};
export const Warning: Story = { args: { status: "warning", title: "库存发生变化" } };
export const Info: Story = { args: { status: "info", title: "订单信息已更新" } };
export const Pending: Story = { args: { status: "pending", title: "正在等待商家确认" } };
export const RecoveryActions: Story = {
  args: {
    actions: (
      <>
        <Button size="small">重新提交</Button>
        <Button size="small" variant="outline">
          保存草稿
        </Button>
      </>
    ),
    description: "检查网络后可再次提交，或先保存本地草稿。",
    role: "alert",
    status: "error",
    title: "提交失败"
  },
  play: ({ canvasElement }) => {
    const result = canvasElement.querySelector<HTMLElement>('[role="alert"]');
    const heading = canvasElement.querySelector<HTMLHeadingElement>("h2");
    const actions = canvasElement.querySelectorAll<HTMLButtonElement>("button");
    if (!result || !heading) throw new window.Error("Expected error Result semantics");
    if (
      heading.textContent !== "提交失败" ||
      result.getAttribute("aria-live") !== "assertive" ||
      result.getAttribute("aria-atomic") !== "true" ||
      result.getAttribute("data-status") !== "error"
    ) {
      throw new window.Error("Result did not expose its error announcement contract");
    }
    const describedBy = result.getAttribute("aria-describedby");
    if (!describedBy || !canvasElement.ownerDocument.getElementById(describedBy)) {
      throw new window.Error("Result description was not associated with the live region");
    }
    if (
      actions.length !== 2 ||
      actions.item(0).textContent !== "重新提交" ||
      actions.item(1).textContent !== "保存草稿"
    ) {
      throw new window.Error("Result recovery actions were not rendered in order");
    }
  }
};
