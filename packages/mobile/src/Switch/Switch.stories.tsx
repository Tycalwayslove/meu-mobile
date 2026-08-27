import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Field } from "../Field";
import { Switch } from "./Switch";

function ControlledSwitch() {
  const [checked, setChecked] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Switch aria-label="消息通知" checked={checked} onChange={setChecked} />
      <span>{checked ? "已开启" : "已关闭"}</span>
    </div>
  );
}

const meta = {
  title: "Forms/Switch",
  component: Switch,
  args: { "aria-label": "开关示例" },
  parameters: { layout: "padded" }
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Checked: Story = { args: { defaultChecked: true } };
export const Controlled: Story = { render: () => <ControlledSwitch /> };
export const Loading: Story = { args: { defaultChecked: true, loading: true } };
export const Disabled: Story = { args: { disabled: true } };
export const Error: Story = {
  render: () => (
    <Field label="自动续费" error="暂时无法修改">
      <Switch />
    </Field>
  )
};
export const Small: Story = { args: { size: "small" } };
export const Large: Story = { args: { size: "large" } };
