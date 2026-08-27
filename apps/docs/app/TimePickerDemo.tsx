"use client";

import { MeuForm, MeuFormTimePicker, useMeuForm } from "@meu/form-react";
import { Button, formatTimeValue } from "@meu/mobile";
import type { TimeValue } from "@meu/mobile";
import { useState } from "react";

type Values = { deliveryTime: TimeValue | null };

export function TimePickerDemo() {
  const [result, setResult] = useState("尚未提交");
  const form = useMeuForm<Values>({ defaultValues: { deliveryTime: null } });

  return (
    <MeuForm
      form={form}
      onSubmit={(values) =>
        setResult(values.deliveryTime ? formatTimeValue(values.deliveryTime) : "未选择")
      }
      style={{ display: "grid", gap: 16 }}
    >
      <MeuFormTimePicker<Values>
        name="deliveryTime"
        label="营业开始时间"
        description="平台无关 TimeValue；取消不写入表单，确定后才提交"
        max={{ hour: 22, minute: 0, second: 0 }}
        min={{ hour: 6, minute: 0, second: 0 }}
        minuteStep={15}
        required
        rules={{ required: "请选择营业开始时间" }}
        triggerProps={{ placeholder: "选择时间" }}
      />
      <Button type="submit">提交时间</Button>
      <output aria-live="polite">{result}</output>
    </MeuForm>
  );
}
