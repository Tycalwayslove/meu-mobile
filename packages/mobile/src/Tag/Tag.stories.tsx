import type { Meta, StoryObj } from "@storybook/react-vite";

import { Tag } from "./Tag";

const meta = {
  title: "Information/Tag",
  component: Tag,
  args: { children: "新品", tone: "accent" }
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Soft: Story = {};
export const Solid: Story = { args: { variant: "solid" } };
export const Outline: Story = { args: { variant: "outline" } };
export const Interactive: Story = { args: { children: "筛选：有货", onClick: () => undefined } };
