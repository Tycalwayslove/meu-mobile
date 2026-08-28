"use client";

import {
  MeuForm,
  MeuFormCheckbox,
  MeuFormCheckboxGroup,
  MeuFormRadioGroup,
  MeuFormSwitch,
  useMeuForm
} from "@meu/form-react";
import { Button, Checkbox, Radio } from "@meu/mobile";
import { useState } from "react";
import { z } from "zod";

const schema = z.object({
  agreement: z.boolean().refine((value) => value, "请同意服务协议"),
  notifications: z.boolean(),
  services: z.array(z.string()).min(1, "至少选择一项服务"),
  shipping: z.string().min(1, "请选择配送方式")
});
type Values = z.infer<typeof schema>;

type SelectionDemoProps = {
  focus?: "checkbox" | "radio-group" | "switch";
};

export function SelectionDemo({ focus }: SelectionDemoProps = {}) {
  const [result, setResult] = useState("尚未保存");
  const form = useMeuForm<Values>({
    schema,
    defaultValues: { agreement: false, notifications: true, services: [], shipping: "" }
  });

  const checkbox = (
    <>
      <MeuFormCheckboxGroup<Values, string> name="services" label="服务范围" required>
        <Checkbox value="delivery">配送</Checkbox>
        <Checkbox value="pickup">到店自提</Checkbox>
      </MeuFormCheckboxGroup>
      <MeuFormCheckbox<Values> name="agreement">同意服务协议</MeuFormCheckbox>
    </>
  );
  const radio = (
    <MeuFormRadioGroup<Values, string> name="shipping" label="配送方式" required>
      <Radio value="standard">标准配送</Radio>
      <Radio value="express">急速配送</Radio>
    </MeuFormRadioGroup>
  );
  const toggle = <MeuFormSwitch<Values> name="notifications" label="消息通知" />;

  return (
    <MeuForm
      form={form}
      onSubmit={(values) => setResult(JSON.stringify(values))}
      style={{ display: "grid", gap: 16 }}
    >
      {focus === "checkbox" ? checkbox : null}
      {focus === "radio-group" ? radio : null}
      {focus === "switch" ? toggle : null}
      {!focus ? (
        <>
          {checkbox}
          {radio}
          {toggle}
        </>
      ) : null}
      <Button type="submit">保存选择</Button>
      <output aria-live="polite">{result}</output>
    </MeuForm>
  );
}
