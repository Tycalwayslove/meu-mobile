import { Button } from "@meu/mobile";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { z } from "zod";

import { MeuForm } from "./MeuForm";
import { MeuFormSearchField } from "./MeuFormSearchField";
import { MeuFormTextArea } from "./MeuFormTextArea";
import { useMeuForm } from "./useMeuForm";

const schema = z.object({
  description: z.string().min(10, "商品介绍至少输入 10 个字符"),
  query: z.string().min(2, "关键词至少输入 2 个字符")
});
type Values = z.infer<typeof schema>;

function DataEntryExample() {
  const [result, setResult] = useState("尚未提交");
  const form = useMeuForm<Values>({
    schema,
    defaultValues: { description: "", query: "" }
  });

  return (
    <MeuForm
      form={form}
      onSubmit={(values) => setResult(JSON.stringify(values))}
      style={{ display: "grid", gap: 20, maxWidth: 390 }}
    >
      <MeuFormSearchField<Values>
        name="query"
        label="搜索关键词"
        placeholder="搜索商品或品牌"
        required
      />
      <MeuFormTextArea<Values>
        name="description"
        label="商品介绍"
        placeholder="介绍商品特色与适用场景"
        autoSize={{ minRows: 3, maxRows: 6 }}
        maxLength={200}
        showCount
        required
      />
      <Button type="submit">保存资料</Button>
      <output aria-live="polite">{result}</output>
    </MeuForm>
  );
}

const meta = {
  title: "Forms/DataEntryIntegration",
  component: DataEntryExample,
  parameters: { layout: "padded" }
} satisfies Meta<typeof DataEntryExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SearchAndLongText: Story = {};
