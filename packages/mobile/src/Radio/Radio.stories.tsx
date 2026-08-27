import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Field } from "../Field";
import { Radio } from "./Radio";
import { RadioGroup } from "./RadioGroup";

function ControlledGroup() {
  const [value, setValue] = useState<string | number>("standard");
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <RadioGroup value={value} onChange={setValue} direction="horizontal">
        <Radio value="standard">标准配送</Radio>
        <Radio value="express">急速配送</Radio>
        <Radio value="pickup">到店自提</Radio>
      </RadioGroup>
      <output aria-live="polite">当前值：{value}</output>
    </div>
  );
}

const meta = {
  title: "Forms/Radio",
  component: Radio,
  args: { children: "单选项" },
  parameters: { layout: "padded" }
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Checked: Story = { args: { defaultChecked: true } };
export const Disabled: Story = { args: { defaultChecked: true, disabled: true } };
export const Error: Story = {
  render: () => (
    <Field label="配送方式" error="请选择配送方式">
      <RadioGroup>
        <Radio value="standard">标准配送</Radio>
        <Radio value="express">急速配送</Radio>
      </RadioGroup>
    </Field>
  )
};
export const Group: Story = { render: () => <ControlledGroup /> };
export const Small: Story = { args: { size: "small" } };
export const Large: Story = { args: { size: "large" } };
