import type { Meta, StoryObj } from "@storybook/react-vite";

import { Field } from "../Field";
import { TextArea } from "./TextArea";

const meta = {
  title: "Forms/TextArea",
  component: TextArea,
  args: {
    "aria-label": "多行输入示例",
    placeholder: "请输入详细内容"
  },
  parameters: { layout: "padded" }
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Counted: Story = {
  args: { defaultValue: "已有内容", maxLength: 100, showCount: true }
};
export const AutoSize: Story = {
  args: { autoSize: { minRows: 2, maxRows: 6 }, defaultValue: "输入内容后高度会自动增长。" }
};
export const Small: Story = { args: { size: "small" } };
export const Large: Story = { args: { size: "large" } };
export const Error: Story = {
  render: () => (
    <Field label="商品介绍" error="商品介绍至少输入 10 个字符" required>
      <TextArea defaultValue="太短" showCount maxLength={200} />
    </Field>
  )
};
export const Disabled: Story = { args: { defaultValue: "不可编辑内容", disabled: true } };
