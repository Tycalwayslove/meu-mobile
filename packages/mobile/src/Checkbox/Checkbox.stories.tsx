import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Field } from "../Field";
import { Checkbox } from "./Checkbox";
import { CheckboxGroup } from "./CheckboxGroup";

function ControlledGroup() {
  const [value, setValue] = useState<Array<string | number>>(["delivery"]);
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <CheckboxGroup value={value} onChange={setValue} direction="horizontal">
        <Checkbox value="delivery">配送</Checkbox>
        <Checkbox value="pickup">到店自提</Checkbox>
        <Checkbox value="express">同城急送</Checkbox>
      </CheckboxGroup>
      <output aria-live="polite">已选择：{value.join("、")}</output>
    </div>
  );
}

const meta = {
  title: "Forms/Checkbox",
  component: Checkbox,
  args: { children: "同意服务协议" },
  parameters: { layout: "padded" }
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Checked: Story = { args: { defaultChecked: true } };
export const Indeterminate: Story = { args: { children: "选择全部", indeterminate: true } };
export const Disabled: Story = { args: { defaultChecked: true, disabled: true } };
export const Error: Story = {
  render: () => (
    <Field label="服务范围" error="至少选择一项">
      <CheckboxGroup>
        <Checkbox value="delivery">配送</Checkbox>
        <Checkbox value="pickup">自提</Checkbox>
      </CheckboxGroup>
    </Field>
  )
};
export const Group: Story = { render: () => <ControlledGroup /> };
export const Small: Story = { args: { size: "small" } };
export const Large: Story = { args: { size: "large" } };
