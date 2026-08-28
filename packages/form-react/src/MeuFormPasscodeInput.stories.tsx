import { Button } from "@meu/mobile";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { z } from "zod";

import { MeuForm } from "./MeuForm";
import { MeuFormPasscodeInput } from "./MeuFormPasscodeInput";
import { useMeuForm } from "./useMeuForm";

const schema = z.object({ code: z.string().length(6, "请输入 6 位验证码") });
type Values = z.infer<typeof schema>;

function Example() {
  const [result, setResult] = useState("尚未提交");
  const form = useMeuForm<Values>({ schema, defaultValues: { code: "" } });
  return (
    <MeuForm
      form={form}
      onSubmit={(values) => setResult(`已提交：${values.code}`)}
      style={{ display: "grid", gap: 16, width: "min(100%, 420px)" }}
    >
      <MeuFormPasscodeInput<Values>
        name="code"
        label="短信验证码"
        description="真实 input、自动填充与完整 React Hook Form 生命周期"
        length={6}
        keyboard={{ closeOnComplete: true, title: "验证码键盘" }}
        required
      />
      <Button type="submit">验证并提交</Button>
      <output aria-live="polite">{result}</output>
    </MeuForm>
  );
}

const meta = {
  title: "Forms/MeuFormPasscodeInput",
  component: Example,
  parameters: { layout: "padded" }
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
