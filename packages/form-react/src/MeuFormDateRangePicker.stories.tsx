import { createDateParts, nativeDateAdapter } from "@meu/date-adapter";
import { Button } from "@meu/mobile";
import type { CalendarRange } from "@meu/mobile";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { MeuForm } from "./MeuForm";
import { MeuFormDateRangePicker } from "./MeuFormDateRangePicker";
import { useMeuForm } from "./useMeuForm";

function date(day: number) {
  return nativeDateAdapter.fromParts(createDateParts({ day, month: 8, year: 2026 }))!;
}

type Values = { deliveryWindow: CalendarRange<Date> | null };

function FormDateRangePickerExample() {
  const [result, setResult] = useState("尚未提交");
  const form = useMeuForm<Values>({ defaultValues: { deliveryWindow: null } });

  return (
    <MeuForm
      form={form}
      onSubmit={(values) =>
        setResult(
          values.deliveryWindow
            ? values.deliveryWindow
                .map((value) => nativeDateAdapter.format(value, "YYYY-MM-DD"))
                .join(" – ")
            : "未选择"
        )
      }
      style={{ display: "grid", gap: 20, maxWidth: 390 }}
    >
      <MeuFormDateRangePicker<Values>
        name="deliveryWindow"
        label="配送日期范围"
        description="取消不修改字段，确定后才写入完整范围。"
        defaultMonth={date(1)}
        min={date(1)}
        max={date(31)}
        presets={[{ key: "week", label: "未来 7 天", value: [date(8), date(14)] }]}
        required
        rules={{ validate: (value) => value !== null || "请选择配送日期范围" }}
        triggerProps={{ placeholder: "选择开始和结束日期" }}
      />
      <Button type="submit">提交日期范围</Button>
      <output aria-live="polite">{result}</output>
    </MeuForm>
  );
}

const meta = {
  title: "Forms/DateRangePickerIntegration",
  component: FormDateRangePickerExample,
  parameters: { layout: "padded" }
} satisfies Meta<typeof FormDateRangePickerExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ConfirmRangeToCommit: Story = {};
