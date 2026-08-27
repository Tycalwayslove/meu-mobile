import { Button } from "@meu/mobile";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { MeuForm } from "./MeuForm";
import { MeuFormCascadePicker } from "./MeuFormCascadePicker";
import { useMeuForm } from "./useMeuForm";

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
      }
    ]
  }
] as const;

function FormCascadePickerExample() {
  const [result, setResult] = useState("尚未提交");
  const form = useMeuForm<Values>({ defaultValues: { region: [] } });

  return (
    <MeuForm
      form={form}
      onSubmit={(values) => setResult(JSON.stringify(values))}
      style={{ display: "grid", gap: 20, maxWidth: 390 }}
    >
      <MeuFormCascadePicker<Values, string>
        name="region"
        label="配送地区"
        description="取消不会修改表单，确定后才写入完整路径"
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

const meta = {
  title: "Forms/CascadePickerIntegration",
  component: FormCascadePickerExample,
  parameters: { layout: "padded" }
} satisfies Meta<typeof FormCascadePickerExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ConfirmPathToCommit: Story = {};
