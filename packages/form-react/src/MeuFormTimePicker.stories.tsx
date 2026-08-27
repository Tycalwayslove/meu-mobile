import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@meu/mobile";
import { useState } from "react";

import { MeuForm } from "./MeuForm";
import { MeuFormTimePicker } from "./MeuFormTimePicker";
import { useMeuForm } from "./useMeuForm";

type Values = {
  deliveryTime: { hour: number; minute: number; second: number } | null;
};

function FormTimePickerExample() {
  const [submitted, setSubmitted] = useState("尚未提交");
  const form = useMeuForm<Values>({
    defaultValues: { deliveryTime: { hour: 10, minute: 30, second: 0 } }
  });

  return (
    <MeuForm
      form={form}
      onSubmit={(values) =>
        setSubmitted(
          values.deliveryTime
            ? `${values.deliveryTime.hour}:${String(values.deliveryTime.minute).padStart(2, "0")}`
            : "未选择"
        )
      }
      style={{ display: "grid", gap: 16, width: 320 }}
    >
      <MeuFormTimePicker<Values>
        name="deliveryTime"
        label="送达时间"
        description="取消不修改字段，确定后才写入 TimeValue。"
        min={{ hour: 9, minute: 0, second: 0 }}
        max={{ hour: 18, minute: 0, second: 0 }}
        minuteStep={15}
        required
        rules={{ required: "请选择送达时间" }}
      />
      <Button type="submit">提交</Button>
      <output aria-live="polite">{submitted}</output>
    </MeuForm>
  );
}

const meta = {
  title: "Forms/TimePickerIntegration",
  component: FormTimePickerExample,
  parameters: { layout: "centered" }
} satisfies Meta<typeof FormTimePickerExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ConfirmOnlyCommit: Story = {};
