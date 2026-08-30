import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Field } from "../Field";
import { waitForStory } from "../storyTestUtils";
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

function OptimisticFailureDemo() {
  const [attempts, setAttempts] = useState(0);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("idle");

  return (
    <div style={{ display: "grid", gap: 12, justifyItems: "start" }}>
      <Switch
        aria-label="自动续费"
        checked={checked}
        loading={loading}
        onChange={(nextChecked) => {
          setAttempts((count) => count + 1);
          setChecked(nextChecked);
          setLoading(true);
          setResult("saving");
        }}
      />
      <button
        type="button"
        data-action="fail"
        style={{ minHeight: 44 }}
        onClick={() => {
          setChecked(false);
          setLoading(false);
          setResult("failed");
        }}
      >
        模拟失败并回滚
      </button>
      <output>
        {result}; attempts={attempts}; checked={String(checked)}
      </output>
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
export const OptimisticFailureLifecycle: Story = {
  render: () => <OptimisticFailureDemo />,
  play: async ({ canvasElement }) => {
    const control = canvasElement.querySelector<HTMLInputElement>("input[role='switch']");
    const fail = canvasElement.querySelector<HTMLButtonElement>("[data-action='fail']");
    const output = canvasElement.querySelector("output");
    if (!control || !fail || !output) {
      throw new window.Error("Expected Switch lifecycle controls");
    }

    control.click();
    await waitForStory(() => control.getAttribute("aria-busy") === "true", "Switch did not load");
    control.click();
    if (output.textContent !== "saving; attempts=1; checked=true") {
      throw new window.Error("Switch loading state did not suppress a rapid repeat change");
    }

    fail.click();
    await waitForStory(
      () => !control.checked && control.getAttribute("aria-busy") === "false",
      "Switch did not roll back after failure"
    );
    control.click();
    await waitForStory(
      () => output.textContent === "saving; attempts=2; checked=true",
      "Switch could not retry after rollback"
    );
  }
};
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
