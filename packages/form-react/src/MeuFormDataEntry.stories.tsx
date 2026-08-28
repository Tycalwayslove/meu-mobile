import { Button } from "@meu/mobile";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { z } from "zod";

import { MeuForm } from "./MeuForm";
import { MeuFormSearchField } from "./MeuFormSearchField";
import { MeuFormTextArea } from "./MeuFormTextArea";
import { useMeuForm } from "./useMeuForm";

const schema = z.object({
  description: z.string().min(10, "商品介绍至少输入 10 个字符"),
  query: z.string().min(2, "关键词至少输入 2 个字符")
});
type Values = z.infer<typeof schema>;

function DataEntryExample() {
  const [result, setResult] = useState("尚未提交");
  const form = useMeuForm<Values>({
    schema,
    defaultValues: { description: "", query: "" }
  });

  return (
    <MeuForm
      form={form}
      onSubmit={(values) => setResult(JSON.stringify(values))}
      style={{ display: "grid", gap: 20, maxWidth: 390 }}
    >
      <MeuFormSearchField<Values>
        name="query"
        label="搜索关键词"
        placeholder="搜索商品或品牌"
        required
      />
      <MeuFormTextArea<Values>
        name="description"
        label="商品介绍"
        placeholder="介绍商品特色与适用场景"
        autoSize={{ minRows: 3, maxRows: 6 }}
        maxLength={200}
        showCount
        required
      />
      <Button type="submit">保存资料</Button>
      <output aria-live="polite">{result}</output>
    </MeuForm>
  );
}

function setNativeValue(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const prototype =
    element instanceof HTMLInputElement
      ? HTMLInputElement.prototype
      : HTMLTextAreaElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
  if (!descriptor || !descriptor.set) throw new window.Error("Expected a native value setter");
  descriptor.set.call(element, value);
  element.dispatchEvent(new window.Event("input", { bubbles: true }));
}

async function waitForFormStory(predicate: () => boolean, message: string) {
  const deadline = Date.now() + 2_000;
  while (!predicate()) {
    if (Date.now() >= deadline) throw new window.Error(message);
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
  }
}

const meta = {
  title: "Forms/DataEntryIntegration",
  component: DataEntryExample,
  parameters: { layout: "padded" }
} satisfies Meta<typeof DataEntryExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SearchAndLongText: Story = {
  play: async ({ canvasElement }) => {
    const search = canvasElement.querySelector<HTMLInputElement>('input[type="search"]');
    const description = canvasElement.querySelector<HTMLTextAreaElement>("textarea");
    const submit = Array.from(canvasElement.querySelectorAll<HTMLButtonElement>("button")).find(
      (button) => button.textContent === "保存资料"
    );
    const output = canvasElement.querySelector('output[aria-live="polite"]');
    if (!search || !description || !submit || !output) {
      throw new window.Error("Expected data entry form controls");
    }

    submit.click();
    await waitForFormStory(
      () => canvasElement.querySelectorAll('[role="alert"]').length === 2,
      "Expected schema validation errors"
    );
    const errors = Array.from(canvasElement.querySelectorAll('[role="alert"]')).map(
      (alert) => alert.textContent
    );
    if (
      errors[0] !== "关键词至少输入 2 个字符" ||
      errors[1] !== "商品介绍至少输入 10 个字符" ||
      document.activeElement !== search
    ) {
      throw new window.Error("Expected validation messages and first invalid field focus");
    }

    setNativeValue(search, "猫粮");
    setNativeValue(description, "天然成分猫粮适合每日喂养");
    submit.click();
    await waitForFormStory(
      () => output.textContent === '{"description":"天然成分猫粮适合每日喂养","query":"猫粮"}',
      "Expected valid data entry values to submit"
    );
  }
};
