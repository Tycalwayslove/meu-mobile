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

export const Default: Story = {};
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
