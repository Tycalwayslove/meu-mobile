import { Button } from "@meu/mobile";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { MeuForm } from "./MeuForm";
import { MeuFormPicker } from "./MeuFormPicker";
import { useMeuForm } from "./useMeuForm";

type Values = { appointment: Array<string | number | null> };

function FormPickerExample() {
  const [result, setResult] = useState("尚未提交");
  const form = useMeuForm<Values>({ defaultValues: { appointment: [] } });

  return (
    <MeuForm
      form={form}
      onSubmit={(values) => setResult(JSON.stringify(values))}
      style={{ display: "grid", gap: 20, maxWidth: 390 }}
    >
      <MeuFormPicker<Values>
        name="appointment"
        label="预约时间"
        description="取消不会修改表单，确定后才写入值"
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
            { label: "11:00", value: 11 },
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

const meta = {
  title: "Forms/PickerIntegration",
  component: FormPickerExample,
  parameters: { layout: "padded" }
} satisfies Meta<typeof FormPickerExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ConfirmToCommit: Story = {};
