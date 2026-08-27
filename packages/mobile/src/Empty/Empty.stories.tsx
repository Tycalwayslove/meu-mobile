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
