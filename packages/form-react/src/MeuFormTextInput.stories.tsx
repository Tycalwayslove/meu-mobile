import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@meu/mobile";
import { useState } from "react";
import { z } from "zod";

import { MeuForm } from "./MeuForm";
import { MeuFormTextInput } from "./MeuFormTextInput";
import { useMeuForm } from "./useMeuForm";

const schema = z.object({
  storeName: z.string().min(1, "请输入店铺名称"),
  contact: z.string().min(1, "请输入联系人")
});

type FormValues = z.infer<typeof schema>;

function FormExample() {
  const [result, setResult] = useState("尚未提交");
  const form = useMeuForm<FormValues>({
    schema,
    defaultValues: { storeName: "", contact: "" }
  });

  return (
    <MeuForm
      form={form}
      onSubmit={(values) => setResult(JSON.stringify(values))}
      style={{ display: "grid", gap: 20, maxWidth: 390 }}
    >
      <MeuFormTextInput<FormValues>
        name="storeName"
        label="店铺名称"
        description="提交后用于消费者侧展示"
        placeholder="例如：喵呜体验店"
        clearable
        required
      />
      <MeuFormTextInput<FormValues>
        name="contact"
        label="联系人"
        placeholder="请输入联系人"
        required
      />
      <Button type="submit">保存更改</Button>
      <output aria-live="polite">{result}</output>
    </MeuForm>
  );
}

const meta = {
  title: "Forms/FormTextInput",
  component: FormExample,
  parameters: {
    docs: {
      description: {
        component: "React Hook Form + Zod 的完整绑定示例，覆盖字段注册、错误显示、清除与提交。"
      }
    }
  }
} satisfies Meta<typeof FormExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ValidationAndSubmit: Story = {};
