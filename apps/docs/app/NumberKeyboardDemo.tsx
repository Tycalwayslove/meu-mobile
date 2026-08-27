"use client";

import { MeuForm, MeuFormNumberKeyboard, useMeuForm } from "@meu/form-react";
import { Button } from "@meu/mobile";
import { useState } from "react";
import { z } from "zod";

import type { NumberKeyboardInputDetails } from "@meu/mobile";

const schema = z.object({ amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "请输入有效金额") });
type Values = z.infer<typeof schema>;

function amountInput(current: string, input: string, details: NumberKeyboardInputDetails) {
  if (details.source === "decimal") {
    if (current.indexOf(".") >= 0) return current;
    return current ? `${current}.` : "0.";
  }
  const decimalIndex = current.indexOf(".");
  if (decimalIndex >= 0 && current.length - decimalIndex > 2) return current;
  return `${current}${input}`;
}

export function NumberKeyboardDemo() {
  const [result, setResult] = useState("尚未提交");
  const form = useMeuForm<Values>({ schema, defaultValues: { amount: "" } });

  return (
    <MeuForm
      form={form}
      onSubmit={(values) => setResult(`已提交金额：¥ ${values.amount}`)}
      style={{ display: "grid", gap: 16 }}
    >
      <MeuFormNumberKeyboard<Values>
        name="amount"
        label="交易金额"
        description="非模态虚拟键盘；值、校验和提交继续由表单持有"
        mode="decimal"
        maxLength={9}
        confirmLabel="完成输入"
        required
        transformInput={amountInput}
        formatValue={(value) => (value ? `¥ ${value}` : undefined)}
      />
      <Button type="submit">提交金额</Button>
      <output aria-live="polite">{result}</output>
    </MeuForm>
  );
}
