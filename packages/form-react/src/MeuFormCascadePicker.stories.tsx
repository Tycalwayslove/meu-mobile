import { Button } from "@meu/mobile";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { MeuForm } from "./MeuForm";
import { MeuFormCascadePicker } from "./MeuFormCascadePicker";
import { useMeuForm } from "./useMeuForm";

type Values = { region: Array<string | null> };

const regions = [
  {
    label: "浙江省",
    value: "zhejiang",
    children: [
      {
        label: "杭州市",
        value: "hangzhou",
        children: [
          { label: "西湖区", value: "xihu" },
          { label: "滨江区", value: "binjiang" }
        ]
      }
    ]
  },
  {
    label: "江苏省",
    value: "jiangsu",
    children: [
      {
        label: "南京市",
        value: "nanjing",
        children: [{ label: "玄武区", value: "xuanwu" }]
      }
    ]
  }
] as const;

function FormCascadePickerExample() {
  const [result, setResult] = useState("尚未提交");
  const form = useMeuForm<Values>({ defaultValues: { region: [] } });

  return (
    <MeuForm
      form={form}
      onSubmit={(values) => setResult(JSON.stringify(values))}
      style={{ display: "grid", gap: 20, maxWidth: 390 }}
    >
      <MeuFormCascadePicker<Values, string>
        name="region"
        label="配送地区"
        description="取消不会修改表单，确定后才写入完整路径"
        columnLabels={["省份", "城市", "区县"]}
        options={regions}
        required
        rules={{
          validate: (value) => (Array.isArray(value) && value.length === 3) || "请选择完整配送地区"
        }}
        triggerProps={{ placeholder: "选择省市区" }}
      />
      <Button type="submit">提交地区</Button>
      <output aria-live="polite">{result}</output>
    </MeuForm>
  );
}

async function waitForFormStory(predicate: () => boolean, message: string) {
  const deadline = Date.now() + 2_000;
  while (!predicate()) {
    if (Date.now() >= deadline) throw new window.Error(message);
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
  }
}

const meta = {
  title: "Forms/CascadePickerIntegration",
  component: FormCascadePickerExample,
  parameters: { layout: "padded" }
} satisfies Meta<typeof FormCascadePickerExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ConfirmPathToCommit: Story = {
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLButtonElement>(
      '[data-meu-component="picker-trigger"]'
    );
    const submit = Array.from(canvasElement.querySelectorAll<HTMLButtonElement>("button")).find(
      (button) => button.textContent === "提交地区"
    );
    const output = canvasElement.querySelector('output[aria-live="polite"]');
    if (!trigger || !submit || !output) {
      throw new window.Error("Expected cascade picker form controls");
    }

    trigger.click();
    await waitForFormStory(
      () => document.querySelector('[role="dialog"][aria-modal="true"]') !== null,
      "Expected cascade picker dialog to open"
    );
    let dialog = document.querySelector<HTMLElement>('[role="dialog"][aria-modal="true"]');
    let jiangsu = dialog
      ? Array.from(dialog.querySelectorAll<HTMLElement>('[role="option"]')).find(
          (option) => option.textContent === "江苏省"
        )
      : undefined;
    const cancel = dialog
      ? Array.from(dialog.querySelectorAll<HTMLButtonElement>("button")).find(
          (button) => button.textContent === "取消"
        )
      : undefined;
    if (!jiangsu || !cancel) throw new window.Error("Expected cascade picker draft controls");
    jiangsu.click();
    cancel.click();
    await waitForFormStory(
      () => document.querySelector('[role="dialog"][aria-modal="true"]') === null,
      "Expected cancelled cascade picker to close"
    );
    if (
      !trigger.textContent ||
      !trigger.textContent.includes("选择省市区") ||
      output.textContent !== "尚未提交"
    ) {
      throw new window.Error("Expected cancellation to preserve the empty form value");
    }

    trigger.click();
    await waitForFormStory(
      () => document.querySelector('[role="dialog"][aria-modal="true"]') !== null,
      "Expected cascade picker dialog to reopen"
    );
    dialog = document.querySelector<HTMLElement>('[role="dialog"][aria-modal="true"]');
    jiangsu = dialog
      ? Array.from(dialog.querySelectorAll<HTMLElement>('[role="option"]')).find(
          (option) => option.textContent === "江苏省"
        )
      : undefined;
    const confirm = dialog
      ? Array.from(dialog.querySelectorAll<HTMLButtonElement>("button")).find(
          (button) => button.textContent === "确定"
        )
      : undefined;
    if (!jiangsu || !confirm) throw new window.Error("Expected cascade picker confirm controls");
    jiangsu.click();
    confirm.click();
    await waitForFormStory(
      () =>
        Boolean(trigger.textContent && trigger.textContent.includes("江苏省 / 南京市 / 玄武区")),
      "Expected confirmed cascade picker path on the trigger"
    );
    submit.click();
    await waitForFormStory(
      () => output.textContent === '{"region":["jiangsu","nanjing","xuanwu"]}',
      "Expected confirmed cascade picker value to submit"
    );
  }
};
