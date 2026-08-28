import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../Button";
import { Empty } from "./Empty";

const meta = {
  title: "Feedback/Empty",
  component: Empty,
  args: {
    action: <Button size="small">清除筛选</Button>,
    description: "当前筛选条件下没有可处理的订单。",
    title: "暂时没有订单"
  }
} satisfies Meta<typeof Empty>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: ({ canvasElement }) => {
    const empty = canvasElement.querySelector<HTMLElement>('[data-meu-component="empty"]');
    const action = canvasElement.querySelector<HTMLButtonElement>("button");
    if (!empty || !action) throw new window.Error("Expected Empty content and action");
    const titleId = empty.getAttribute("aria-labelledby");
    const descriptionId = empty.getAttribute("aria-describedby");
    const title = titleId ? canvasElement.ownerDocument.getElementById(titleId) : null;
    const description = descriptionId
      ? canvasElement.ownerDocument.getElementById(descriptionId)
      : null;
    if (
      empty.getAttribute("role") !== "group" ||
      !title ||
      title.textContent !== "暂时没有订单" ||
      !description ||
      description.textContent !== "当前筛选条件下没有可处理的订单。" ||
      action.textContent !== "清除筛选"
    ) {
      throw new window.Error("Empty is missing its labelled group semantics");
    }
  }
};
export const WithoutIllustration: Story = { args: { illustration: null } };
export const NoResultsWithTwoActions: Story = {
  args: {
    action: <Button size="small">清除筛选</Button>,
    description: "没有商品同时满足当前价格、品牌和配送范围。你可以清除筛选，或返回查看全部商品。",
    reason: "no-results",
    secondaryAction: (
      <Button size="small" variant="outline">
        查看全部
      </Button>
    ),
    title: "没有匹配的商品"
  },
  parameters: { viewport: { defaultViewport: "mobile1" } }
};
export const NoAction: Story = {
  args: {
    action: undefined,
    description: "完成首个配置后，内容会显示在这里。",
    reason: "not-configured",
    title: "尚未配置"
  }
};
