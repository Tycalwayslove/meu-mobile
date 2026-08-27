"use client";

import { MeuForm, MeuFormPicker, useMeuForm } from "@meu/form-react";
import { Button } from "@meu/mobile";
import { useState } from "react";

type Values = { appointment: Array<string | number | null> };

export function PickerDemo() {
  const [result, setResult] = useState("尚未提交");
  const form = useMeuForm<Values>({ defaultValues: { appointment: [] } });

  return (
    <MeuForm
      form={form}
      onSubmit={(values) => setResult(JSON.stringify(values))}
      style={{ display: "grid", gap: 16 }}
    >
      <MeuFormPicker<Values>
        name="appointment"
        label="预约时间"
        description="滚动只修改草稿，点击确定后才写入表单"
        columnLabels={["日期", "时段"]}
        columns={[
          [
            { label: "今天", value: "today" },
            { label: "明天", value: "tomorrow" },
            { label: "后天", value: "after-tomorrow" },
            { label: "周六", value: "saturday" },
            { label: "周日", value: "sunday" }
          ],
          [
            { label: "09:00", value: 9 },
            { label: "10:00", value: 10 },
            { disabled: true, label: "11:00（约满）", value: 11 },
            { label: "12:00", value: 12 },
            { label: "13:00", value: 13 }
          ]
        ]}
        required
        rules={{
          validate: (value) => (Array.isArray(value) && value.length === 2) || "请选择完整预约时间"
        }}
        triggerProps={{ placeholder: "选择日期和时段" }}
      />
      <Button type="submit">提交预约</Button>
      <output aria-live="polite">{result}</output>
    </MeuForm>
  );
}
