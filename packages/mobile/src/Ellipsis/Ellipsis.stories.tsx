import type { Meta, StoryObj } from "@storybook/react-vite";

import { Ellipsis } from "./Ellipsis";

const content =
  "Meu Mobile 为 Next.js 移动网页提供稳定的设计令牌、原生交互语义与完整表单集成，并为后续跨端扩展保留清晰边界。";

const meta = {
  title: "Information/Ellipsis",
  component: Ellipsis,
  args: { content, rows: 2 }
} satisfies Meta<typeof Ellipsis>;

export default meta;
type Story = StoryObj<typeof meta>;

export const End: Story = {};
export const Middle: Story = { args: { direction: "middle", rows: 1 } };
export const Start: Story = { args: { direction: "start", rows: 2 } };
