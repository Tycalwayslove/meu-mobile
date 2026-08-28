"use client";

import { MeuForm, MeuFormPasscodeInput, useMeuForm } from "@meu/form-react";
import { Button } from "@meu/mobile";
import { useState } from "react";
import { z } from "zod";

const schema = z.object({ code: z.string().length(6, "请输入 6 位验证码") });
type Values = z.infer<typeof schema>;

export function PasscodeInputDemo() {
  const [completion, setCompletion] = useState("等待输入完成");
  const [result, setResult] = useState("尚未提交");
  const form = useMeuForm<Values>({ schema, defaultValues: { code: "" } });

  return (
    <MeuForm
      form={form}
      onSubmit={(values) => setResult(`已提交验证码：${values.code}`)}
      style={{ display: "grid", gap: 16 }}
    >
      <MeuFormPasscodeInput<Values>
        name="code"
        label="短信验证码"
        description="真实 input 保留自动填充；示例组合非模态数字键盘"
        length={6}
        separated
        keyboard={{ closeOnComplete: true, title: "验证码键盘" }}
        onComplete={(value) => setCompletion(`输入完成：${value}`)}
        required
      />
      <Button type="submit">验证并提交</Button>
      <output aria-live="polite">{completion}</output>
      <output aria-live="polite">{result}</output>
    </MeuForm>
  );
}
