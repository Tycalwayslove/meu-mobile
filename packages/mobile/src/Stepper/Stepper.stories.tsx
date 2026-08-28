import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Field } from "../Field";
import { Stepper } from "./Stepper";

function NativeFormStepper() {
  return (
    <form style={{ display: "grid", gap: 12, maxWidth: 390 }}>
      <Stepper aria-label="件数" name="quantity" defaultValue={2} min={0} max={8} />
      <button type="reset">恢复件数</button>
    </form>
  );
}

const meta = {
  title: "Data Entry/Stepper",
  component: Stepper,
  args: { "aria-label": "商品数量", defaultValue: 2, min: 0, max: 8 },
  parameters: { layout: "padded" }
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Decimal: Story = {
  args: { defaultValue: 1.5, step: 0.25, precision: 2 }
};

export const InField: Story = {
  render: () => (
    <Field label="购买数量" description="每人限购 8 件">
      <Stepper defaultValue={2} min={1} max={8} />
    </Field>
  )
};

function ControlledStepper() {
  const [value, setValue] = useState<number | null>(1);
  return <Stepper value={value} onChange={setValue} allowEmpty />;
}

export const Controlled: Story = {
  render: () => <ControlledStepper />
};

export const NativeFormReset: Story = {
  render: () => <NativeFormStepper />,
  play: async ({ canvasElement }) => {
    const increment = canvasElement.querySelector<HTMLButtonElement>('button[aria-label="增加"]');
    const input = canvasElement.querySelector<HTMLInputElement>('[role="spinbutton"]');
    const reset = canvasElement.querySelector<HTMLButtonElement>('button[type="reset"]');
    if (!increment || !input || !reset)
      throw new globalThis.Error("Stepper form controls were not rendered");
    increment.click();
    await Promise.resolve();
    if (Number(input.value) !== 3) throw new globalThis.Error("Stepper did not increment");
    reset.click();
    await new Promise((resolve) => globalThis.setTimeout(resolve, 0));
    if (Number(input.value) !== 2)
      throw new globalThis.Error("Stepper did not restore its default");
  }
};

export const RequiredEmpty: Story = {
  render: () => (
    <Field label="购买数量" required description="请先填写数量">
      <Stepper allowEmpty defaultValue={null} />
    </Field>
  )
};

export const AtMaximum: Story = { args: { defaultValue: 8 } };
export const Error: Story = {
  render: () => (
    <Field label="购买数量" error="超过当前库存">
      <Stepper defaultValue={8} />
    </Field>
  )
};
export const ReadOnly: Story = { args: { defaultValue: 4, readOnly: true } };
export const Disabled: Story = { args: { defaultValue: 4, disabled: true } };
export const RightToLeft: Story = { args: { defaultValue: 4, dir: "rtl" } };
export const Small: Story = { args: { size: "small" } };
export const Large: Story = { args: { size: "large" } };
