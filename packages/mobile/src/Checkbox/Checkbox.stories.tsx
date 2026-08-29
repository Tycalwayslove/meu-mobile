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

function NativeFormDemo() {
  return (
    <form aria-label="配送服务表单" style={{ display: "grid", gap: 12 }}>
      <CheckboxGroup defaultValue={["delivery"]} name="service">
        <Checkbox value="delivery">配送</Checkbox>
        <Checkbox value="pickup">到店自提</Checkbox>
      </CheckboxGroup>
      <button type="reset" style={{ minHeight: 44 }}>
        重置
      </button>
    </form>
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
export const Indeterminate: Story = {
  args: { children: "选择全部", indeterminate: true },
  play: async ({ canvasElement }) => {
    const control = canvasElement.querySelector<HTMLInputElement>("input[type='checkbox']");
    if (!control) throw new window.Error("Expected indeterminate Checkbox input");

    control.click();
    await Promise.resolve();
    if (
      !control.checked ||
      !control.indeterminate ||
      control.getAttribute("aria-checked") !== "mixed"
    ) {
      throw new window.Error(
        "Checkbox did not preserve its controlled mixed semantics after click"
      );
    }
  }
};
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
export const ReadOnly: Story = {
  render: () => (
    <CheckboxGroup defaultValue={["delivery"]} name="service" readOnly>
      <Checkbox value="delivery">已锁定配送</Checkbox>
      <Checkbox value="pickup">不可新增自提</Checkbox>
    </CheckboxGroup>
  )
};
export const NativeFormContract: Story = {
  render: () => <NativeFormDemo />,
  play: async ({ canvasElement }) => {
    const form = canvasElement.querySelector("form");
    const options = canvasElement.querySelectorAll<HTMLInputElement>("input[type='checkbox']");
    const reset = canvasElement.querySelector<HTMLButtonElement>("button[type='reset']");
    if (!(form instanceof HTMLFormElement) || options.length !== 2 || !reset) {
      throw new window.Error("Expected Checkbox native form controls");
    }

    const pickup = options.item(1);
    if (!pickup) throw new window.Error("Expected pickup Checkbox");
    pickup.click();
    await Promise.resolve();
    const submitted = new FormData(form).getAll("service");
    if (submitted.length !== 2 || submitted[0] !== "delivery" || submitted[1] !== "pickup") {
      throw new window.Error("CheckboxGroup did not submit repeated selected values");
    }

    reset.click();
    await Promise.resolve();
    await Promise.resolve();
    if (pickup.checked) throw new window.Error("CheckboxGroup did not restore defaultValue");
  }
};
export const RTL: Story = {
  render: () => (
    <div dir="rtl">
      <CheckboxGroup defaultValue={["delivery"]} direction="horizontal">
        <Checkbox value="delivery">التوصيل</Checkbox>
        <Checkbox value="pickup">الاستلام</Checkbox>
      </CheckboxGroup>
    </div>
  )
};
export const Small: Story = { args: { size: "small" } };
export const Large: Story = { args: { size: "large" } };
