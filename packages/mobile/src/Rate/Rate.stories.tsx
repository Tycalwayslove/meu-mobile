import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Field } from "../Field";
import { Rate } from "./Rate";

function NativeFormRate() {
  return (
    <form style={{ display: "grid", gap: 12, maxWidth: 390 }}>
      <Rate aria-label="评分" name="rating" defaultValue={2} />
      <button type="reset">恢复评分</button>
    </form>
  );
}

const meta = {
  title: "Data Entry/Rate",
  component: Rate,
  args: { "aria-label": "商品评分", defaultValue: 3 },
  parameters: { layout: "padded" }
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

export const NativeFormReset: Story = {
  render: () => <NativeFormRate />,
  play: async ({ canvasElement }) => {
    const rating = canvasElement.querySelector<HTMLInputElement>('input[type="range"]');
    const reset = canvasElement.querySelector<HTMLButtonElement>('button[type="reset"]');
    if (!rating || !reset) throw new globalThis.Error("Rate form controls were not rendered");
    const valueDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    if (!valueDescriptor || !valueDescriptor.set)
      throw new globalThis.Error("Native input value setter is unavailable");
    valueDescriptor.set.call(rating, "4");
    rating.dispatchEvent(new Event("input", { bubbles: true }));
    await Promise.resolve();
    reset.click();
    await new Promise((resolve) => globalThis.setTimeout(resolve, 0));
    if (rating.value !== "2") throw new globalThis.Error("Rate did not restore its default");
  }
};

export const RightToLeft: Story = {
  args: { dir: "rtl", defaultValue: 4, allowHalf: true }
};

export const Error: Story = {
  render: () => (
    <Field label="服务评分" error="请完成评分">
      <Rate />
    </Field>
  )
};

export const ReadOnlyFormValue: Story = {
  args: { name: "rating", value: 4.5, allowHalf: true, readOnly: true }
};
export const Disabled: Story = { args: { value: 2, disabled: true } };
export const CustomCharacter: Story = { args: { character: "♥", defaultValue: 4 } };
export const Small: Story = { args: { size: "small" } };
export const Large: Story = { args: { size: "large" } };
