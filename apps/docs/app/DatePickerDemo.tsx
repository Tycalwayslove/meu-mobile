"use client";

import { MeuForm, MeuFormDatePicker, useMeuForm } from "@meu/form-react";
import { Button } from "@meu/mobile";
import { useState } from "react";

type Values = { deliveryDate: Date | null };

export function DatePickerDemo() {
  const [result, setResult] = useState("尚未提交");
  const form = useMeuForm<Values>({ defaultValues: { deliveryDate: null } });

  return (
    <MeuForm
      form={form}
      onSubmit={(values) =>
        setResult(values.deliveryDate ? values.deliveryDate.toISOString() : "未选择")
      }
      style={{ display: "grid", gap: 16 }}
    >
      <MeuFormDatePicker<Values>
        name="deliveryDate"
        label="送达时间"
        description="15 分钟步长；取消不写入表单，确定后才提交本地 Date"
        max={new Date(2027, 11, 31, 23, 59, 59, 999)}
        min={new Date(2025, 0, 1)}
        minuteStep={15}
        precision="minute"
        required
        rules={{ validate: (value) => value instanceof Date || "请选择送达时间" }}
        triggerProps={{ placeholder: "选择日期和时间" }}
      />
      <Button type="submit">提交时间</Button>
      <output aria-live="polite">{result}</output>
    </MeuForm>
  );
}
