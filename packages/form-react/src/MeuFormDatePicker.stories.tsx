import { Button } from "@meu/mobile";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { MeuForm } from "./MeuForm";
import { MeuFormDatePicker } from "./MeuFormDatePicker";
import { useMeuForm } from "./useMeuForm";

type Values = { deliveryDate: Date | null };

const min = new Date(2026, 7, 1);
const max = new Date(2026, 8, 30, 23, 59, 59, 999);

function FormDatePickerExample() {
  const [result, setResult] = useState("尚未提交");
  const form = useMeuForm<Values>({ defaultValues: { deliveryDate: null } });

  return (
    <MeuForm
      form={form}
      onSubmit={(values) =>
        setResult(values.deliveryDate ? values.deliveryDate.toISOString() : "未选择")
      }
      style={{ display: "grid", gap: 20, maxWidth: 390 }}
    >
      <MeuFormDatePicker<Values>
        name="deliveryDate"
        label="送达日期"
        description="取消不修改字段，确定后才写入 Date"
        max={max}
        min={min}
        required
        rules={{ validate: (value) => value instanceof Date || "请选择送达日期" }}
        triggerProps={{ placeholder: "选择日期" }}
      />
      <Button type="submit">提交日期</Button>
      <output aria-live="polite">{result}</output>
    </MeuForm>
  );
}

const meta = {
  title: "Forms/DatePickerIntegration",
  component: FormDatePickerExample,
  parameters: { layout: "padded" }
} satisfies Meta<typeof FormDatePickerExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ConfirmDateToCommit: Story = {};
