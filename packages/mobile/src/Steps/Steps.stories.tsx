import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

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

export const Horizontal: Story = {
  play: async ({ canvasElement }) => {
    const list = canvasElement.querySelector<HTMLOListElement>('ol[aria-label="进度"]');
    const steps = canvasElement.querySelectorAll<HTMLLIElement>("li");
    if (!list || steps.length !== 4) throw new window.Error("Expected four ordered Steps");
    if (
      list.getAttribute("data-direction") !== "horizontal" ||
      list.tabIndex !== 0 ||
      steps.item(0).getAttribute("data-status") !== "finish" ||
      steps.item(1).getAttribute("data-status") !== "process" ||
      steps.item(1).getAttribute("aria-current") !== "step" ||
      steps.item(2).getAttribute("data-status") !== "wait"
    ) {
      throw new window.Error("Steps did not expose current and derived statuses");
    }
    list.focus();
    await Promise.resolve();
    if (canvasElement.ownerDocument.activeElement !== list) {
      throw new window.Error("Horizontal Steps did not accept keyboard focus");
    }
  }
};
export const Vertical: Story = { args: { direction: "vertical" } };
export const Error: Story = {
  args: {
    items: items.map((item, index) => (index === 1 ? { ...item, status: "error" as const } : item))
  }
};
export const CompactDots: Story = { args: { indicator: "dot", size: "small" } };

function InteractiveStepsDemo() {
  const [current, setCurrent] = useState(1);
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <Steps
        aria-label="结算步骤"
        current={current}
        items={[
          { key: "cart", title: "购物车", description: "2 件商品" },
          { key: "address", title: "地址", description: "当前步骤" },
          { key: "payment", title: "支付", description: "可返回修改" },
          { key: "done", title: "完成", disabled: true }
        ]}
        onChange={setCurrent}
      />
      <output aria-live="polite">当前第 {current + 1} 步</output>
    </div>
  );
}

export const Interactive: Story = {
  render: () => <InteractiveStepsDemo />,
  play: async ({ canvasElement }) => {
    const target = Array.from(canvasElement.querySelectorAll<HTMLButtonElement>("button")).find(
      (button) => button.textContent && button.textContent.includes("支付")
    );
    if (!target) throw new window.Error("Expected an interactive payment step");
    target.click();
    await Promise.resolve();
    const output = canvasElement.querySelector("output");
    if (!output || output.textContent !== "当前第 3 步") {
      throw new window.Error("Interactive Steps did not publish the requested index");
    }
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
