"use client";

import { Button } from "@meu/mobile";
import { MeuForm, MeuFormTreeSelect, useMeuForm } from "@meu/form-react";
import { useState } from "react";
import { z } from "zod";

const schema = z.object({ categories: z.array(z.string()).min(1, "请选择至少一个商品类目") });
type Values = z.infer<typeof schema>;

const options = [
  {
    label: "数码家电",
    value: "digital",
    children: [
      {
        label: "手机通讯",
        value: "phone",
        children: [
          { label: "智能手机", value: "smartphone" },
          { label: "手机配件", value: "phone-accessories" }
        ]
      },
      { label: "电脑整机", value: "computer" }
    ]
  },
  {
    label: "家居生活",
    value: "home",
    children: [{ label: "厨房用品", value: "kitchen" }]
  }
];

export function TreeSelectDemo() {
  const [result, setResult] = useState("等待类目提交");
  const form = useMeuForm<Values>({ schema, defaultValues: { categories: ["smartphone"] } });
  return (
    <MeuForm
      form={form}
      onSubmit={(values) => setResult(`已提交类目：${values.categories.join(", ")}`)}
      style={{ display: "grid", gap: 16, width: "min(100%, 420px)" }}
    >
      <MeuFormTreeSelect<Values, string>
        multiple
        name="categories"
        label="商品类目"
        description="搜索和展开不修改表单；点击确定后才提交所选叶子节点。"
        options={options}
        defaultExpandedValues={["digital", "phone"]}
        maxCount={3}
        required
        triggerProps={{ placeholder: "选择商品类目" }}
        virtual={false}
      />
      <Button type="submit">提交类目表单</Button>
      <output aria-live="polite">{result}</output>
    </MeuForm>
  );
}
