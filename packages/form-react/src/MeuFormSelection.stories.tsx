import { Button, Checkbox, Radio } from "@meu/mobile";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { z } from "zod";

import { MeuForm } from "./MeuForm";
import { MeuFormCheckbox } from "./MeuFormCheckbox";
import { MeuFormCheckboxGroup } from "./MeuFormCheckboxGroup";
import { MeuFormRadioGroup } from "./MeuFormRadioGroup";
import { MeuFormSwitch } from "./MeuFormSwitch";
import { useMeuForm } from "./useMeuForm";

const schema = z.object({
  agreement: z.boolean().refine((value) => value, "请同意服务协议"),
  notifications: z.boolean(),
  services: z.array(z.string()).min(1, "至少选择一项服务"),
  shipping: z.string().min(1, "请选择配送方式")
});
type Values = z.infer<typeof schema>;

function SelectionExample() {
  const [result, setResult] = useState("尚未提交");
  const form = useMeuForm<Values>({
    schema,
    defaultValues: { agreement: false, notifications: true, services: [], shipping: "" }
  });

  return (
    <MeuForm
      form={form}
      onSubmit={(values) => setResult(JSON.stringify(values))}
      style={{ display: "grid", gap: 20, maxWidth: 390 }}
    >
      <MeuFormCheckboxGroup<Values, string> name="services" label="服务范围" required>
        <Checkbox value="delivery">配送</Checkbox>
        <Checkbox value="pickup">到店自提</Checkbox>
      </MeuFormCheckboxGroup>
      <MeuFormRadioGroup<Values, string> name="shipping" label="配送方式" required>
        <Radio value="standard">标准配送</Radio>
        <Radio value="express">急速配送</Radio>
      </MeuFormRadioGroup>
      <MeuFormSwitch<Values> name="notifications" label="消息通知" />
      <MeuFormCheckbox<Values> name="agreement">同意服务协议</MeuFormCheckbox>
      <Button type="submit">保存设置</Button>
      <output aria-live="polite">{result}</output>
    </MeuForm>
  );
}

const meta = {
  title: "Forms/SelectionIntegration",
  component: SelectionExample,
  parameters: { layout: "padded" }
} satisfies Meta<typeof SelectionExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CheckboxRadioAndSwitch: Story = {};
