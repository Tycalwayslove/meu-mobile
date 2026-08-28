import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Field } from "../Field";
import { Slider } from "./Slider";

function NativeFormSlider() {
  return (
    <form style={{ display: "grid", gap: 12, maxWidth: 390 }}>
      <Slider aria-label="预算" name="budget" defaultValue={25} showValue />
      <button type="reset">恢复预算</button>
    </form>
  );
}

const meta = {
  title: "Data Entry/Slider",
  component: Slider,
  args: { "aria-label": "完成度", defaultValue: 35, showValue: true },
  parameters: { layout: "padded" }
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithMarks: Story = {
  args: {
    marks: [
      { value: 0, label: "0" },
      { value: 50, label: "50" },
      { value: 100, label: "100" }
    ]
  }
};

export const InField: Story = {
  render: () => (
    <Field label="配送距离" description="选择 0–20 公里">
      <Slider min={0} max={20} defaultValue={5} showValue formatValue={(value) => `${value} km`} />
    </Field>
  )
};

function ControlledSlider() {
  const [value, setValue] = useState(40);
  return <Slider value={value} onChange={setValue} showValue />;
}

export const Controlled: Story = {
  render: () => <ControlledSlider />
};

export const NativeFormReset: Story = {
  render: () => <NativeFormSlider />,
  play: async ({ canvasElement }) => {
    const slider = canvasElement.querySelector<HTMLInputElement>('input[type="range"]');
    const reset = canvasElement.querySelector<HTMLButtonElement>('button[type="reset"]');
    if (!slider || !reset) throw new globalThis.Error("Slider form controls were not rendered");
    const valueDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    if (!valueDescriptor || !valueDescriptor.set)
      throw new globalThis.Error("Native input value setter is unavailable");
    valueDescriptor.set.call(slider, "70");
    slider.dispatchEvent(new Event("input", { bubbles: true }));
    await Promise.resolve();
    reset.click();
    await new Promise((resolve) => globalThis.setTimeout(resolve, 0));
    if (slider.value !== "25") throw new globalThis.Error("Slider did not restore its default");
  }
};

export const RightToLeft: Story = {
  args: {
    dir: "rtl",
    defaultValue: 75,
    marks: [
      { value: 0, label: "منخفض" },
      { value: 100, label: "مرتفع" }
    ]
  }
};

export const Error: Story = {
  render: () => (
    <Field label="折扣" error="折扣必须符合活动规则">
      <Slider defaultValue={90} />
    </Field>
  )
};

export const Disabled: Story = { args: { defaultValue: 60, disabled: true } };
export const Small: Story = { args: { size: "small" } };
export const Large: Story = { args: { size: "large" } };
