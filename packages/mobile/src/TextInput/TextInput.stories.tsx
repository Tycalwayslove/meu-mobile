import type { Meta, StoryObj } from "@storybook/react-vite";

import { TextInput } from "./TextInput";

const meta = {
  title: "Forms/TextInput",
  component: TextInput,
  args: {
    "aria-label": "示例输入框",
    placeholder: "请输入内容"
  },
  parameters: {
    layout: "padded"
  }
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const FocusReference: Story = { args: { autoFocus: true } };
export const Error: Story = { args: { status: "error", defaultValue: "错误内容" } };
export const Disabled: Story = { args: { disabled: true, defaultValue: "不可编辑" } };
export const Clearable: Story = { args: { clearable: true, defaultValue: "可清除内容" } };
export const Small: Story = { args: { size: "small" } };
export const Large: Story = { args: { size: "large" } };
