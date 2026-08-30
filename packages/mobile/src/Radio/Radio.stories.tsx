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

function NativeFormDemo() {
  return (
    <form aria-label="配送方式表单" style={{ display: "grid", gap: 12 }}>
      <RadioGroup defaultValue="standard" name="shipping" required>
        <Radio value="standard">标准配送</Radio>
        <Radio value="express">急速配送</Radio>
      </RadioGroup>
      <button type="reset" style={{ minHeight: 44 }}>
        重置
      </button>
    </form>
  );
}

function ReadOnlyKeyboardDemo() {
  return (
    <form aria-label="只读配送表单">
      <RadioGroup defaultValue="standard" name="shipping" readOnly>
        <Radio value="standard">标准配送</Radio>
        <Radio value="express">急速配送</Radio>
      </RadioGroup>
    </form>
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
export const ReadOnly: Story = {
  render: () => (
    <RadioGroup defaultValue="standard" name="shipping" readOnly>
      <Radio value="standard">已锁定标准配送</Radio>
      <Radio value="express">不可切换急速配送</Radio>
    </RadioGroup>
  )
};
export const NativeFormContract: Story = {
  render: () => <NativeFormDemo />,
  play: async ({ canvasElement }) => {
    const form = canvasElement.querySelector("form");
    const options = canvasElement.querySelectorAll<HTMLInputElement>("input[type='radio']");
    const reset = canvasElement.querySelector<HTMLButtonElement>("button[type='reset']");
    if (!(form instanceof HTMLFormElement) || options.length !== 2 || !reset) {
      throw new window.Error("Expected Radio native form controls");
    }

    const standard = options.item(0);
    const express = options.item(1);
    if (!standard || !express) throw new window.Error("Expected Radio options");
    express.click();
    await Promise.resolve();
    if (new FormData(form).get("shipping") !== "express") {
      throw new window.Error("RadioGroup did not submit the current selection");
    }

    reset.click();
    await Promise.resolve();
    await Promise.resolve();
    if (!standard.checked) throw new window.Error("RadioGroup did not restore defaultValue");
  }
};
export const ReadOnlyKeyboardRollback: Story = {
  render: () => <ReadOnlyKeyboardDemo />,
  play: async ({ canvasElement }) => {
    const form = canvasElement.querySelector("form");
    const options = canvasElement.querySelectorAll<HTMLInputElement>("input[type='radio']");
    if (!(form instanceof HTMLFormElement) || options.length !== 2) {
      throw new window.Error("Expected read-only Radio controls");
    }
    const standard = options.item(0);
    const express = options.item(1);
    if (!standard || !express) throw new window.Error("Expected read-only Radio options");

    standard.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "ArrowRight" }));
    standard.checked = false;
    express.checked = true;
    express.click();
    await Promise.resolve();
    await Promise.resolve();
    if (!standard.checked || express.checked || new FormData(form).get("shipping") !== "standard") {
      throw new window.Error("Read-only RadioGroup did not restore its native selection");
    }
  }
};
export const RTL: Story = {
  render: () => (
    <div dir="rtl">
      <RadioGroup defaultValue="standard" direction="horizontal">
        <Radio value="standard">توصيل عادي</Radio>
        <Radio value="express">توصيل سريع</Radio>
      </RadioGroup>
    </div>
  )
};
export const Small: Story = { args: { size: "small" } };
export const Large: Story = { args: { size: "large" } };
