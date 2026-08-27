"use client";

import { MeuForm, MeuFormTextInput, useMeuForm } from "@meu/form-react";
import { Button } from "@meu/mobile";
import { z } from "zod";

const schema = z.object({ storeName: z.string().min(1, "请输入店铺名称") });
type FormValues = z.infer<typeof schema>;

export function FormDemo() {
  const form = useMeuForm<FormValues>({ schema, defaultValues: { storeName: "" } });

  return (
    <MeuForm form={form} onSubmit={() => undefined}>
      <MeuFormTextInput<FormValues>
        name="storeName"
        label="店铺名称"
        description="用于验证 Next.js、表单上下文与错误关联。"
        placeholder="例如：喵呜体验店"
        required
      />
      <div style={{ marginTop: 16 }}>
        <Button type="submit">保存更改</Button>
      </div>
    </MeuForm>
  );
}
