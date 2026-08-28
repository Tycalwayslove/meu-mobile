import { Button } from "@meu/mobile";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { z } from "zod";

import { MeuForm } from "./MeuForm";
import { MeuFormTreeSelect } from "./MeuFormTreeSelect";
import { useMeuForm } from "./useMeuForm";

const schema = z.object({ categories: z.array(z.string()).min(1, "请选择至少一个商品类目") });
type Values = z.infer<typeof schema>;

const options = [
  {
    label: "数码家电",
    value: "digital",
    children: [
      { label: "智能手机", value: "smartphone" },
      { label: "电脑整机", value: "computer" }
    ]
  },
  {
    label: "家居生活",
    value: "home",
    children: [{ label: "厨房用品", value: "kitchen" }]
  }
];

function Example() {
  const [result, setResult] = useState("尚未提交");
  const form = useMeuForm<Values>({ schema, defaultValues: { categories: [] } });
  return (
    <MeuForm
      form={form}
      onSubmit={(values) => setResult(`已提交：${values.categories.join(",")}`)}
      style={{ display: "grid", gap: 16, width: "min(100%, 420px)" }}
    >
      <MeuFormTreeSelect<Values, string>
        multiple
        name="categories"
        label="商品类目"
        description="确认后写入表单；取消不会污染 dirty 值。"
        options={options}
        defaultExpandedValues={["digital", "home"]}
        maxCount={2}
        required
        triggerProps={{ placeholder: "请选择类目" }}
        virtual={false}
      />
      <Button type="submit">验证并提交</Button>
      <output aria-live="polite">{result}</output>
    </MeuForm>
  );
}

const meta = {
  title: "Forms/MeuFormTreeSelect",
  component: Example,
  parameters: { layout: "padded" }
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
