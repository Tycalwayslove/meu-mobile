import { MeuIconCheck } from "@meu/icons-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Field } from "../Field";
import { SegmentedControl } from "./SegmentedControl";

const options = [
  { label: "列表", value: "list" },
  { label: "卡片", value: "card" },
  { label: "已完成", value: "done", icon: <MeuIconCheck size={16} /> }
];

const meta = {
  title: "Navigation/SegmentedControl",
  component: SegmentedControl,
  args: { "aria-label": "展示方式", options }
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Block: Story = { args: { block: true } };

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16, justifyItems: "start" }}>
      <SegmentedControl aria-label="小尺寸" options={options} size="small" />
      <SegmentedControl aria-label="中尺寸" options={options} size="medium" />
      <SegmentedControl aria-label="大尺寸" options={options} size="large" />
    </div>
  )
};

export const Disabled: Story = { args: { defaultValue: "card", disabled: true } };

export const RequiredError: Story = {
  render: () => (
    <Field label="展示方式" description="选择订单列表布局" error="请选择展示方式" required>
      <SegmentedControl block options={options} required status="error" value={null} />
    </Field>
  )
};

export const RtlAndLongContent: Story = {
  render: () => (
    <div dir="rtl" style={{ maxWidth: 390 }}>
      <SegmentedControl
        aria-label="طريقة العرض"
        block
        options={[
          { label: "قائمة الطلبات الطويلة", value: "list" },
          { label: "عرض البطاقات", value: "card" }
        ]}
      />
    </div>
  )
};

function ControlledSegmentedControl() {
  const [value, setValue] = useState<string | number | null>("list");
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <SegmentedControl
        aria-label="展示方式"
        block
        options={options}
        value={value}
        onChange={setValue}
      />
      <output aria-live="polite">当前值：{value === null ? "未选择" : value}</output>
    </div>
  );
}

export const ControlledInteraction: Story = {
  render: () => <ControlledSegmentedControl />,
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector<HTMLInputElement>('input[value="card"]');
    if (card) card.click();
    await Promise.resolve();
    if (!card || !card.checked) {
      throw new Error("SegmentedControl interaction did not select card");
    }
  }
};
