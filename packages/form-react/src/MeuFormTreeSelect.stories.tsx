import { Button } from "@meu/mobile";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { z } from "zod";

import { MeuForm } from "./MeuForm";
import { MeuFormTreeSelect } from "./MeuFormTreeSelect";
import { useMeuForm } from "./useMeuForm";

const schema = z.object({ categories: z.array(z.string()).min(1, "请选择至少一个商品类目") });
type Values = z.infer<typeof schema>;

const options = [
  {
    label: "数码家电",
    value: "digital",
    children: [
      { label: "智能手机", value: "smartphone" },
      { label: "电脑整机", value: "computer" }
    ]
  },
  {
    label: "家居生活",
    value: "home",
    children: [{ label: "厨房用品", value: "kitchen" }]
  }
];

function nextStoryFrame() {
  return new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
}

async function waitForStory(predicate: () => boolean, message: string) {
  const deadline = Date.now() + 2_000;
  while (!predicate()) {
    if (Date.now() >= deadline) throw new window.Error(message);
    await nextStoryFrame();
  }
}

function findTreeItem(container: ParentNode, label: string) {
  return Array.from(container.querySelectorAll<HTMLElement>('[role="treeitem"]')).find((item) =>
    (item.textContent || "").includes(label)
  );
}

function findButton(container: ParentNode, label: string) {
  return Array.from(container.querySelectorAll<HTMLButtonElement>("button")).find(
    (button) => (button.textContent || "").trim() === label
  );
}

function Example() {
  const [result, setResult] = useState("尚未提交");
  const form = useMeuForm<Values>({ schema, defaultValues: { categories: [] } });
  return (
    <MeuForm
      form={form}
      onSubmit={(values) => setResult(`已提交：${values.categories.join(",")}`)}
      style={{ display: "grid", gap: 16, width: "min(100%, 420px)" }}
    >
      <MeuFormTreeSelect<Values, string>
        multiple
        name="categories"
        label="商品类目"
        description="确认后写入表单；取消不会污染 dirty 值。"
        options={options}
        defaultExpandedValues={["digital", "home"]}
        maxCount={2}
        required
        triggerProps={{ placeholder: "请选择类目" }}
        virtual={false}
      />
      <Button type="submit">验证并提交</Button>
      <output aria-live="polite">{result}</output>
    </MeuForm>
  );
}

const meta = {
  title: "Forms/MeuFormTreeSelect",
  component: Example,
  parameters: { layout: "padded" }
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const form = canvasElement.querySelector<HTMLFormElement>("form");
    const trigger = canvasElement.querySelector<HTMLButtonElement>(
      '[data-meu-component="picker-trigger"]'
    );
    const submit = canvasElement.querySelector<HTMLButtonElement>('button[type="submit"]');
    const output = canvasElement.querySelector<HTMLOutputElement>("output");
    if (!form || !trigger || !submit || !output) {
      throw new window.Error("Expected tree select form controls");
    }

    submit.click();
    await waitForStory(() => {
      const alert = canvasElement.querySelector<HTMLElement>('[role="alert"]');
      return Boolean(alert && alert.textContent === "请选择至少一个商品类目");
    }, "TreeSelect form did not expose schema validation");
    if (
      trigger.getAttribute("data-invalid") !== "true" ||
      canvasElement.ownerDocument.activeElement !== trigger
    ) {
      throw new window.Error("TreeSelect validation did not mark and focus the trigger");
    }

    trigger.click();
    const body = canvasElement.ownerDocument.body;
    await waitForStory(
      () => body.querySelector('[data-meu-component="tree-select"]') !== null,
      "Form TreeSelect did not open in its portal"
    );
    const panel = body.querySelector<HTMLElement>('[data-meu-component="tree-select"]');
    if (!panel) throw new window.Error("Expected TreeSelect panel");
    const smartphone = findTreeItem(panel, "智能手机");
    const kitchen = findTreeItem(panel, "厨房用品");
    const confirm = findButton(panel, "确定");
    if (!smartphone || !kitchen || !confirm) {
      throw new window.Error("Expected TreeSelect selection controls");
    }
    smartphone.click();
    kitchen.click();
    await waitForStory(
      () =>
        smartphone.getAttribute("aria-checked") === "true" &&
        kitchen.getAttribute("aria-checked") === "true",
      "TreeSelect did not update its multiple-selection draft"
    );
    if (
      !(trigger.textContent || "").includes("请选择类目") ||
      new FormData(form).getAll("categories").length !== 0
    ) {
      throw new window.Error("TreeSelect changed the form before confirmation");
    }

    confirm.click();
    await waitForStory(() => {
      const values = new FormData(form).getAll("categories");
      return (
        values.length === 2 &&
        values[0] === "smartphone" &&
        values[1] === "kitchen" &&
        (trigger.textContent || "").includes("智能手机") &&
        (trigger.textContent || "").includes("厨房用品") &&
        canvasElement.querySelector('[role="alert"]') === null &&
        canvasElement.ownerDocument.activeElement === trigger
      );
    }, "TreeSelect confirm did not commit native form values and restore focus");

    submit.click();
    await waitForStory(
      () => output.textContent === "已提交：smartphone,kitchen",
      "TreeSelect form did not submit its confirmed values"
    );
  }
};
