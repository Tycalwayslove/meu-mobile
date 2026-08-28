import { Button } from "@meu/mobile";
import type { ImageUploaderItem } from "@meu/mobile";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { z } from "zod";

import { MeuForm } from "./MeuForm";
import { MeuFormImageUploader } from "./MeuFormImageUploader";
import { useMeuForm } from "./useMeuForm";

async function waitForStory(predicate: () => boolean, message: string) {
  const deadline = Date.now() + 3_000;
  while (!predicate()) {
    if (Date.now() >= deadline) throw new window.Error(message);
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
  }
}

const schema = z.object({
  images: z.array(z.object({ alt: z.string(), url: z.string() })).min(1, "请至少上传一张图片")
});
type Values = z.infer<typeof schema>;

function Example() {
  const [result, setResult] = useState("尚未提交");
  const form = useMeuForm<Values>({ schema, defaultValues: { images: [] } });
  return (
    <MeuForm
      form={form}
      onSubmit={(values) => setResult(`已提交 ${values.images.length} 张图片`)}
      style={{ display: "grid", gap: 16, width: "min(100%, 420px)" }}
    >
      <MeuFormImageUploader<Values>
        name="images"
        label="商品图片"
        description="成功值进入表单；File、进度和失败重试留在上传任务层。"
        maxCount={4}
        required
        upload={async (file) => {
          await new Promise<void>((resolve) => window.setTimeout(resolve, 500));
          const item: ImageUploaderItem = {
            alt: file.name,
            name: file.name,
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"><rect width="320" height="320" fill="#176B5B"/><text x="160" y="170" text-anchor="middle" fill="white" font-family="sans-serif" font-size="20">${file.name}</text></svg>`)}`
          };
          return item;
        }}
      />
      <Button type="submit">验证并提交</Button>
      <output aria-live="polite">{result}</output>
    </MeuForm>
  );
}

const meta = {
  title: "Forms/MeuFormImageUploader",
  component: Example,
  parameters: { layout: "padded" }
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]');
    const submit = Array.from(canvasElement.querySelectorAll<HTMLButtonElement>("button")).find(
      (button) => button.textContent === "验证并提交"
    );
    const output = canvasElement.querySelector<HTMLOutputElement>("output");
    if (!input || !submit || !output) throw new window.Error("Expected image upload form controls");

    const transfer = new DataTransfer();
    transfer.items.add(
      new File(["storybook image"], "storybook-product.jpg", { type: "image/jpeg" })
    );
    Object.defineProperty(input, "files", { configurable: true, value: transfer.files });
    input.dispatchEvent(new window.Event("change", { bubbles: true }));

    await waitForStory(
      () =>
        canvasElement.querySelector('button[aria-label="storybook-product.jpg，预览"]') !== null,
      "Image upload did not produce a successful form value"
    );
    const remove = canvasElement.querySelector<HTMLButtonElement>(
      'button[aria-label="删除 storybook-product.jpg"]'
    );
    if (!remove) throw new window.Error("Uploaded image did not expose its remove action");

    submit.click();
    await waitForStory(
      () => output.textContent === "已提交 1 张图片",
      "Form did not submit the uploaded image value"
    );
  }
};
