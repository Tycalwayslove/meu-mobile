import { MeuIconCheck } from "@meu/icons-react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { SegmentedControl } from "./SegmentedControl";

const meta = {
  title: "Navigation/SegmentedControl",
  component: SegmentedControl,
  args: {
    "aria-label": "展示方式",
    options: [
      { label: "列表", value: "list" },
      { label: "卡片", value: "card" },
      { label: "已完成", value: "done", icon: <MeuIconCheck size={16} /> }
    ]
  }
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Block: Story = { args: { block: true } };
export const Disabled: Story = { args: { disabled: true } };
export const Error: Story = { args: { status: "error" } };
