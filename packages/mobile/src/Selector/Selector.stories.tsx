import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Field } from "../Field";
import { Selector } from "./Selector";

const options = [
  { value: "standard", label: "标准配送", description: "预计 2–3 天送达" },
  { value: "express", label: "急速配送", description: "预计当日送达" },
  { value: "pickup", label: "到店自提" },
  { value: "locker", label: "快递柜", disabled: true }
];

const meta = {
  title: "Data Entry/Selector",
  component: Selector,
  args: { "aria-label": "配送方案", options }
} satisfies Meta<typeof Selector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = { args: { defaultValue: ["standard"] } };

export const Multiple: Story = {
  args: { defaultValue: ["standard", "pickup"], multiple: true }
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      <Selector aria-label="小尺寸" options={options} size="small" />
      <Selector aria-label="中尺寸" options={options} size="medium" />
      <Selector aria-label="大尺寸" options={options} size="large" />
    </div>
  )
};

export const RequiredError: Story = {
  render: () => (
    <Field label="配送方案" description="请选择一种可用方案" error="配送方案不能为空" required>
      <Selector options={options} required status="error" />
    </Field>
  )
};

export const Disabled: Story = {
  args: { defaultValue: ["standard"], disabled: true }
};

export const RtlAndLongContent: Story = {
  render: () => (
    <div dir="rtl">
      <Selector
        aria-label="طريقة التسليم"
        columns={1}
        defaultValue={["standard"]}
        options={[
          {
            value: "standard",
            label: "التوصيل القياسي إلى عنوان طويل",
            description: "يصل الطلب عادة خلال يومين إلى ثلاثة أيام عمل"
          },
          { value: "pickup", label: "الاستلام من المتجر" }
        ]}
      />
    </div>
  )
};

function ControlledSelector() {
  const [value, setValue] = useState<Array<string | number>>(["standard"]);
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <Selector aria-label="配送方案" options={options} value={value} onChange={setValue} />
      <output aria-live="polite">当前值：{value.length > 0 ? value.join(", ") : "未选择"}</output>
    </div>
  );
}

export const ControlledInteraction: Story = {
  render: () => <ControlledSelector />,
  play: async ({ canvasElement }) => {
    const pickup = canvasElement.querySelector<HTMLInputElement>('input[value="pickup"]');
    if (pickup) pickup.click();
    await Promise.resolve();
    if (!pickup || !pickup.checked) throw new Error("Selector interaction did not select pickup");
  }
};
