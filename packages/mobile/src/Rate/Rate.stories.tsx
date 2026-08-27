import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Field } from "../Field";
import { Rate } from "./Rate";

const meta = {
  title: "Data Entry/Rate",
  component: Rate,
  args: { defaultValue: 3 }
} satisfies Meta<typeof Rate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HalfAndReadOnly: Story = {
  args: { value: 3.5, allowHalf: true, readOnly: true, "aria-label": "评分 3.5 星" }
};

export const InField: Story = {
  render: () => (
    <Field label="服务评分" description="支持键盘方向键与半星评分">
      <Rate allowHalf />
    </Field>
  )
};

function ControlledRate() {
  const [value, setValue] = useState(2);
  return <Rate value={value} onChange={setValue} aria-label="受控评分" />;
}

export const Controlled: Story = {
  render: () => <ControlledRate />
};
