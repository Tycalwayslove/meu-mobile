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

function NativeFormDemo() {
  return (
    <form aria-label="通知设置表单" style={{ display: "grid", gap: 12 }}>
      <Field label="消息通知" labelAssociation="native">
        <Switch defaultChecked name="notifications" value="enabled" />
      </Field>
      <button type="reset" style={{ minHeight: 44 }}>
        重置
      </button>
    </form>
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
export const ReadOnly: Story = { args: { defaultChecked: true, readOnly: true } };
export const NativeFormContract: Story = {
  render: () => <NativeFormDemo />,
  play: async ({ canvasElement }) => {
    const form = canvasElement.querySelector("form");
    const control = canvasElement.querySelector<HTMLInputElement>("input[role='switch']");
    const reset = canvasElement.querySelector<HTMLButtonElement>("button[type='reset']");
    if (!(form instanceof HTMLFormElement) || !control || !reset) {
      throw new window.Error("Expected Switch native form controls");
    }

    control.click();
    await Promise.resolve();
    if (new FormData(form).has("notifications")) {
      throw new window.Error("Unchecked Switch remained in FormData");
    }

    reset.click();
    await Promise.resolve();
    await Promise.resolve();
    if (!control.checked || new FormData(form).get("notifications") !== "enabled") {
      throw new window.Error("Switch did not restore and submit defaultChecked");
    }
  }
};
export const RTL: Story = {
  render: () => (
    <div dir="rtl" style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Switch aria-label="الإشعارات" defaultChecked />
      <span>الإشعارات مفعلة</span>
    </div>
  )
};
export const Error: Story = {
  render: () => (
    <Field label="自动续费" error="暂时无法修改">
      <Switch />
    </Field>
  )
};
export const Small: Story = { args: { size: "small" } };
export const Large: Story = { args: { size: "large" } };
