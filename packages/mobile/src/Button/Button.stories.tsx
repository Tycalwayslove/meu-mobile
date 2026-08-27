import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./Button";

const meta = {
  title: "Actions/Button",
  component: Button,
  args: { children: "保存更改" }
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Solid: Story = {};
export const Outline: Story = { args: { variant: "outline" } };
export const Loading: Story = { args: { loading: true } };
export const Danger: Story = { args: { tone: "danger", children: "删除这条记录" } };
