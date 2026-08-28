import { Button } from "@meu/mobile";
import type { ImageUploaderItem } from "@meu/mobile";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { z } from "zod";

import { MeuForm } from "./MeuForm";
import { MeuFormImageUploader } from "./MeuFormImageUploader";
import { useMeuForm } from "./useMeuForm";

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

export const Default: Story = {};
