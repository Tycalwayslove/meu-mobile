"use client";

import { MeuForm, MeuFormTextInput, useMeuForm } from "@meu/form-react";
import { MeuIconCheck } from "@meu/icons-react";
import { Button, ConfigProvider } from "@meu/mobile";
import { useState } from "react";
import { z } from "zod";

const schema = z.object({
  storeName: z.string().min(2, "店铺名称至少输入 2 个字符")
});

type FormValues = z.infer<typeof schema>;

export function ConsumerScenario() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [savedName, setSavedName] = useState("");
  const form = useMeuForm<FormValues>({
    schema,
    defaultValues: { storeName: "" },
    mode: "onSubmit"
  });

  return (
    <ConfigProvider theme={theme}>
      <section className="integration-card" aria-label="组件消费场景">
        <div className="integration-toolbar">
          <p>当前主题：{theme === "light" ? "浅色" : "深色"}</p>
          <Button
            variant="outline"
            tone="neutral"
            size="small"
            onClick={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
          >
            切换主题
          </Button>
        </div>

        <MeuForm
          className="integration-form"
          form={form}
          onSubmit={({ storeName }) => setSavedName(storeName)}
        >
          <MeuFormTextInput<FormValues>
            name="storeName"
            label="店铺名称"
            description="用于验证受控字段、Zod 校验、清除按钮和错误关联。"
            placeholder="例如：喵呜体验店"
            autoComplete="organization"
            clearable
            required
          />
          <Button type="submit" block leadingIcon={<MeuIconCheck size={18} />}>
            保存店铺
          </Button>
        </MeuForm>

        <output className="integration-result" aria-live="polite">
          {savedName ? `已保存：${savedName}` : "等待提交"}
        </output>
      </section>
    </ConfigProvider>
  );
}
