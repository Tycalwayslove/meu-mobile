import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "./Badge";

const meta = {
  title: "Information/Badge",
  component: Badge,
  args: { content: 8 }
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Count: Story = {};
export const Overflow: Story = { args: { content: 128, max: 99 } };
export const Dot: Story = {
  args: {
    children: <span style={{ display: "block", width: 44, height: 44, background: "#eaece7" }} />,
    dot: true,
    label: "有新消息"
  }
};
