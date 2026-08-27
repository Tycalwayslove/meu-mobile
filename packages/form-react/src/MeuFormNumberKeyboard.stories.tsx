import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@meu/mobile";
import { useState } from "react";
import { z } from "zod";

import { MeuForm } from "./MeuForm";
import { MeuFormNumberKeyboard } from "./MeuFormNumberKeyboard";
import { useMeuForm } from "./useMeuForm";

const schema = z.object({ amount: z.string().min(1, "请输入金额") });
type Values = z.infer<typeof schema>;

function Example() {
  const [result, setResult] = useState("尚未提交");
  const form = useMeuForm<Values>({ schema, defaultValues: { amount: "" } });
  return (
    <MeuForm
      form={form}
      onSubmit={(values) => setResult(`已提交：¥ ${values.amount}`)}
      style={{ display: "grid", gap: 16, width: "min(100%, 420px)" }}
    >
      <MeuFormNumberKeyboard<Values>
        name="amount"
        label="交易金额"
        description="值、dirty、touched 与校验由 React Hook Form 持有"
        mode="decimal"
        maxLength={8}
        confirmLabel="完成输入"
        required
        formatValue={(value) => (value ? `¥ ${value}` : undefined)}
      />
      <Button type="submit">提交金额</Button>
      <output aria-live="polite">{result}</output>
    </MeuForm>
  );
}

const meta = {
  title: "Forms/MeuFormNumberKeyboard",
  component: Example,
  parameters: { layout: "padded" }
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
