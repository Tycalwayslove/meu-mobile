"use client";

import { MeuForm, MeuFormCascadePicker, useMeuForm } from "@meu/form-react";
import { Button } from "@meu/mobile";
import { useState } from "react";

type Values = { region: Array<string | null> };

const regions = [
  {
    label: "浙江省",
    value: "zhejiang",
    children: [
      {
        label: "杭州市",
        value: "hangzhou",
        children: [
          { label: "西湖区", value: "xihu" },
          { label: "滨江区", value: "binjiang" }
        ]
      },
      {
        label: "宁波市",
        value: "ningbo",
        children: [{ label: "海曙区", value: "haishu" }]
      }
    ]
  },
  {
    label: "江苏省",
    value: "jiangsu",
    children: [
      {
        label: "南京市",
        value: "nanjing",
        children: [{ label: "玄武区", value: "xuanwu" }]
      },
      {
        label: "苏州市",
        value: "suzhou",
        children: [{ label: "姑苏区", value: "gusu" }]
      }
    ]
  }
] as const;

export function CascadePickerDemo() {
  const [result, setResult] = useState("尚未提交");
  const form = useMeuForm<Values>({ defaultValues: { region: [] } });

  return (
    <MeuForm
      form={form}
      onSubmit={(values) => setResult(JSON.stringify(values))}
      style={{ display: "grid", gap: 16 }}
    >
      <MeuFormCascadePicker<Values, string>
        name="region"
        label="配送地区"
        description="切换父级会重建后续路径，点击确定后才写入表单"
        columnLabels={["省份", "城市", "区县"]}
        options={regions}
        required
        rules={{
          validate: (value) => (Array.isArray(value) && value.length === 3) || "请选择完整配送地区"
        }}
        triggerProps={{ placeholder: "选择省市区" }}
      />
      <Button type="submit">提交地区</Button>
      <output aria-live="polite">{result}</output>
    </MeuForm>
  );
}
