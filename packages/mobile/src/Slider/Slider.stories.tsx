import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { ConfigProvider } from "../ConfigProvider";
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
  decorators: [
    (Story) => (
      <div style={{ width: "min(100%, 390px)" }}>
        <Story />
      </div>
    )
  ],
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
  return <Slider aria-label="完成度" value={value} onChange={setValue} showValue />;
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

export const ReadOnlyFormValue: Story = {
  render: () => (
    <form style={{ display: "grid", gap: 12, maxWidth: 390 }}>
      <Field label="审核后预算" description="只读值仍随表单提交">
        <Slider name="budget" value={65} readOnly showValue formatValue={(value) => `${value}%`} />
      </Field>
    </form>
  )
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

export const DecimalPrecision: Story = {
  args: {
    "aria-label": "服务费率",
    defaultValue: 0.7,
    formatValue: (value) => `${Math.round(value * 100)}%`,
    marks: [
      { value: 0.1, label: "10%" },
      { value: 0.5, label: "50%" },
      { value: 0.9, label: "90%" }
    ],
    min: 0.1,
    max: 1,
    step: 0.2
  }
};

export const ThemeAndStateMatrix: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      <ConfigProvider theme="light" style={{ background: "var(--meu-color-surface)", padding: 16 }}>
        <Field label="Light · 配送距离" description="当前主题下的默认交互态">
          <Slider defaultValue={35} showValue formatValue={(value) => `${value} km`} />
        </Field>
      </ConfigProvider>
      <ConfigProvider theme="dark" style={{ background: "var(--meu-color-surface)", padding: 16 }}>
        <Field label="Dark · 配送距离" error="距离超出本次服务范围">
          <Slider defaultValue={85} showValue status="error" />
        </Field>
      </ConfigProvider>
    </div>
  )
};

export const RtlLongContentAt200Percent: Story = {
  render: () => (
    <div dir="rtl" lang="ar" style={{ fontSize: "2rem" }}>
      <Field
        label="المسافة القصوى المتاحة لتوصيل الطلب إلى العنوان المحدد"
        description="يمكن تعديل النطاق باستخدام لوحة المفاتيح أو السحب على المسار"
      >
        <Slider
          defaultValue={70}
          marks={[
            { value: 0, label: "قريب" },
            { value: 100, label: "بعيد جداً" }
          ]}
          showValue
          formatValue={(value) => `${value} كيلومتراً كحد أقصى`}
        />
      </Field>
    </div>
  )
};

export const ReducedMotion: Story = {
  args: {
    "aria-label": "减少动态效果时的完成度",
    defaultValue: 45,
    marks: [
      { value: 0, label: "开始" },
      { value: 100, label: "完成" }
    ]
  },
  globals: { motion: "reduced" }
};

function InteractionCompletionSlider() {
  const [value, setValue] = useState(20);
  const [completedValue, setCompletedValue] = useState<number | null>(null);
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <Slider
        aria-label="交互结束值"
        value={value}
        onChange={setValue}
        onChangeComplete={setCompletedValue}
        showValue
      />
      <output data-completed-value>
        {completedValue === null ? "尚未完成交互" : `已完成：${completedValue}`}
      </output>
    </div>
  );
}

export const InteractionCompletion: Story = {
  render: () => <InteractionCompletionSlider />,
  play: async ({ canvasElement }) => {
    const slider = canvasElement.querySelector<HTMLInputElement>('input[type="range"]');
    const result = canvasElement.querySelector<HTMLOutputElement>("[data-completed-value]");
    if (!slider || !result)
      throw new globalThis.Error("Slider interaction controls were not rendered");
    const valueDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    if (!valueDescriptor || !valueDescriptor.set)
      throw new globalThis.Error("Native input value setter is unavailable");

    slider.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    valueDescriptor.set.call(slider, "65");
    slider.dispatchEvent(new Event("input", { bubbles: true }));
    slider.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
    await new Promise((resolve) => globalThis.setTimeout(resolve, 0));
    if (result.textContent !== "已完成：65") {
      throw new globalThis.Error(`Slider completion was not published: ${result.textContent}`);
    }
  }
};
