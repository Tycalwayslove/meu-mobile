"use client";

import { MeuForm, MeuFormDateRangePicker, useMeuForm } from "@meu/form-react";
import { Button } from "@meu/mobile";
import type { CalendarRange } from "@meu/mobile";
import { useState } from "react";

type Values = { deliveryWindow: CalendarRange<Date> | null };

function formatDate(value: Date) {
  return value.toLocaleDateString("zh-CN");
}

export function DateRangePickerDemo() {
  const [result, setResult] = useState("尚未提交");
  const form = useMeuForm<Values>({ defaultValues: { deliveryWindow: null } });

  return (
    <MeuForm
      form={form}
      onSubmit={(values) =>
        setResult(
          values.deliveryWindow
            ? `${formatDate(values.deliveryWindow[0])} – ${formatDate(values.deliveryWindow[1])}`
            : "未选择"
        )
      }
      style={{ display: "grid", gap: 16 }}
    >
      <MeuFormDateRangePicker<Values>
        name="deliveryWindow"
        label="配送日期范围"
        description="在弹层中预览草稿；取消不写入，确定后才提交完整范围。"
        defaultMonth={new Date(2026, 7, 1)}
        min={new Date(2026, 7, 3)}
        max={new Date(2026, 7, 29)}
        presets={[
          {
            key: "week",
            label: "未来 7 天",
            value: [new Date(2026, 7, 8), new Date(2026, 7, 14)]
          }
        ]}
        required
        rules={{ validate: (value) => value !== null || "请选择配送日期范围" }}
        triggerProps={{ placeholder: "选择开始和结束日期" }}
      />
      <Button type="submit">提交日期范围</Button>
      <output aria-live="polite">{result}</output>
    </MeuForm>
  );
}
