"use client";

import {
  MeuForm,
  MeuFormRate,
  MeuFormSelector,
  MeuFormSlider,
  MeuFormStepper,
  useMeuForm
} from "@meu/form-react";
import { Button } from "@meu/mobile";
import { useState } from "react";
import { z } from "zod";

const schema = z.object({
  fulfillment: z.array(z.string()).min(1, "请选择履约方案"),
  quantity: z.number().min(1).max(8),
  rating: z.number().min(1, "请完成评分"),
  volume: z.number().min(0).max(100)
});
type Values = z.infer<typeof schema>;

const fulfillmentOptions = [
  { value: "standard", label: "标准配送", description: "预计 2–3 天送达" },
  { value: "express", label: "急速配送", description: "预计当日送达" }
];

type AdvancedEntryDemoProps = {
  focus?: "rate" | "selector" | "slider" | "stepper";
};

export function AdvancedEntryDemo({ focus }: AdvancedEntryDemoProps = {}) {
  const [result, setResult] = useState("尚未保存");
  const form = useMeuForm<Values>({
    schema,
    defaultValues: { fulfillment: ["standard"], quantity: 1, rating: 3.5, volume: 40 }
  });

  const stepper = <MeuFormStepper<Values> name="quantity" label="购买数量" min={1} max={8} />;
  const slider = (
    <MeuFormSlider<Values>
      name="volume"
      label="提示音量"
      showValue
      formatValue={(value) => `${value}%`}
    />
  );
  const rate = <MeuFormRate<Values> name="rating" label="服务评分" allowHalf />;
  const selector = (
    <MeuFormSelector<Values, string>
      name="fulfillment"
      label="履约方案"
      options={fulfillmentOptions}
    />
  );

  return (
    <MeuForm
      form={form}
      onSubmit={(values) => setResult(JSON.stringify(values))}
      style={{ display: "grid", gap: 16 }}
    >
      {focus === "stepper" ? stepper : null}
      {focus === "slider" ? slider : null}
      {focus === "rate" ? rate : null}
      {focus === "selector" ? selector : null}
      {!focus ? (
        <>
          {stepper}
          {slider}
          {rate}
          {selector}
        </>
      ) : null}
      <Button type="submit">保存录入设置</Button>
      <output aria-live="polite">{result}</output>
    </MeuForm>
  );
}
