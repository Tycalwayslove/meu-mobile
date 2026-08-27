import type { Meta, StoryObj } from "@storybook/react-vite";

import { TextInput } from "../TextInput";
import { Field } from "./Field";

const meta = {
  title: "Forms/Field",
  component: Field,
  args: {
    children: <TextInput placeholder="请输入收货人姓名" />,
    description: "请与身份证姓名保持一致",
    label: "收货人",
    required: true
  }
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Error: Story = {
  args: {
    description: undefined,
    error: "请输入收货人姓名"
  }
};
