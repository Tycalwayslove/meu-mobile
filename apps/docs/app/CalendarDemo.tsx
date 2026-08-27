"use client";

import { MeuForm, MeuFormCalendar, useMeuForm } from "@meu/form-react";
import { Button } from "@meu/mobile";
import type { CalendarRange } from "@meu/mobile";
import { useState } from "react";

type Values = { deliveryWindow: CalendarRange<Date> | null };

function formatDate(value: Date) {
  return value.toLocaleDateString("zh-CN");
}

export function CalendarDemo() {
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
      <MeuFormCalendar<Values>
        name="deliveryWindow"
        label="配送日期范围"
        description="首个日期立即写入同日范围，第二个日期完成并自动排序范围。"
        selectionMode="range"
        defaultMonth={new Date(2026, 7, 1)}
        min={new Date(2026, 7, 3)}
        max={new Date(2026, 7, 29)}
        required
        rules={{ validate: (value) => value !== null || "请选择配送日期范围" }}
      />
      <Button type="submit">提交日期范围</Button>
      <output aria-live="polite">{result}</output>
    </MeuForm>
  );
}
