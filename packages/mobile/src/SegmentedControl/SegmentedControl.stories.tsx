import { MeuIconCheck } from "@meu/icons-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { ConfigProvider } from "../ConfigProvider";
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

function TabModeExample() {
  const [value, setValue] = useState<string | number | null>("summary");
  const tabOptions = [
    {
      label: "订单摘要",
      panelId: "summary-panel",
      tabId: "summary-tab",
      value: "summary"
    },
    {
      label: "配送进度",
      panelId: "delivery-panel",
      tabId: "delivery-tab",
      value: "delivery"
    },
    {
      disabled: true,
      label: "售后记录",
      panelId: "service-panel",
      tabId: "service-tab",
      value: "service"
    }
  ];
  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 390 }}>
      <SegmentedControl
        mode="tabs"
        aria-label="订单详情"
        block
        options={tabOptions}
        value={value}
        onChange={setValue}
      />
      {tabOptions.map((item) => (
        <section
          key={item.value}
          id={item.panelId}
          role="tabpanel"
          aria-labelledby={item.tabId}
          hidden={value !== item.value}
          tabIndex={value === item.value ? 0 : -1}
        >
          {item.value === "summary" ? "订单金额与商品概览" : "包裹正在配送途中"}
        </section>
      ))}
    </div>
  );
}

export const TabsMode: Story = {
  render: () => <TabModeExample />
};

export const ReducedMotion: Story = {
  render: () => (
    <ConfigProvider motion="reduced">
      <SegmentedControl block aria-label="视图密度" options={options} defaultValue="card" />
    </ConfigProvider>
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
