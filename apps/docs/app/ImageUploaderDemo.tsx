"use client";

import { Button } from "@meu/mobile";
import { MeuForm, MeuFormImageUploader, useMeuForm } from "@meu/form-react";
import { useState } from "react";
import { z } from "zod";

const schema = z.object({
  images: z.array(z.object({ alt: z.string(), url: z.string() })).min(1, "请上传至少一张商品图片")
});
type Values = z.infer<typeof schema>;

export function ImageUploaderDemo() {
  const [result, setResult] = useState("等待图片提交");
  const form = useMeuForm<Values>({ schema, defaultValues: { images: [] } });

  return (
    <MeuForm
      form={form}
      onSubmit={(values) => setResult(`已提交 ${values.images.length} 张商品图片`)}
      style={{ display: "grid", gap: 16, width: "min(100%, 420px)" }}
    >
      <MeuFormImageUploader<Values>
        name="images"
        label="商品图片"
        description="本地测试上传：成功元数据进入表单，原生 File 不进入业务值。"
        multiple
        maxCount={4}
        required
        upload={async (file, context) => {
          context.onProgress(35);
          await new Promise<void>((resolve) => window.setTimeout(resolve, 450));
          context.onProgress(82);
          await new Promise<void>((resolve) => window.setTimeout(resolve, 250));
          return {
            alt: file.name,
            key: `${file.name}-${file.lastModified}`,
            name: file.name,
            url: "/demo-media.svg"
          };
        }}
      />
      <Button type="submit">提交图片表单</Button>
      <output aria-live="polite">{result}</output>
    </MeuForm>
  );
}
