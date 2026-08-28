"use client";

import {
  MeuForm,
  MeuFormSearchField,
  MeuFormTextArea,
  MeuFormTextInput,
  useMeuForm
} from "@meu/form-react";
import { Button } from "@meu/mobile";
import { z } from "zod";

const schema = z.object({
  description: z.string().min(10, "店铺介绍至少输入 10 个字符"),
  query: z.string().min(2, "搜索关键词至少输入 2 个字符"),
  storeName: z.string().min(1, "请输入店铺名称")
});
type FormValues = z.infer<typeof schema>;

type FormDemoProps = {
  focus?: "field" | "form" | "search-field" | "text-area" | "text-input";
};

export function FormDemo({ focus }: FormDemoProps = {}) {
  const form = useMeuForm<FormValues>({
    schema,
    defaultValues: { description: "", query: "", storeName: "" }
  });

  const searchField = (
    <MeuFormSearchField<FormValues>
      name="query"
      label="搜索关键词"
      placeholder="搜索商品或品牌"
      required
    />
  );
  const textInput = (
    <MeuFormTextInput<FormValues>
      name="storeName"
      label="店铺名称"
      description="用于验证 Next.js、表单上下文与错误关联。"
      placeholder="例如：喵呜体验店"
      required
    />
  );
  const textArea = (
    <MeuFormTextArea<FormValues>
      name="description"
      label="店铺介绍"
      placeholder="介绍店铺特色与适用场景"
      autoSize={{ minRows: 3, maxRows: 6 }}
      maxLength={200}
      showCount
      required
    />
  );
  const focusedControl =
    focus === "search-field"
      ? searchField
      : focus === "text-area"
        ? textArea
        : focus === "text-input" || focus === "field"
          ? textInput
          : null;

  return (
    <MeuForm form={form} onSubmit={() => undefined} style={{ display: "grid", gap: 16 }}>
      {focusedControl || (
        <>
          {searchField}
          {textInput}
          {textArea}
        </>
      )}
      <Button type="submit">保存更改</Button>
    </MeuForm>
  );
}
