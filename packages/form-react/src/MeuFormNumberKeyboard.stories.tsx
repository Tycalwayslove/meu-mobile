import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@meu/mobile";
import { useState } from "react";
import { z } from "zod";

import { MeuForm } from "./MeuForm";
import { MeuFormNumberKeyboard } from "./MeuFormNumberKeyboard";
import { useMeuForm } from "./useMeuForm";

async function waitForStory(predicate: () => boolean, message: string) {
  const deadline = Date.now() + 3_000;
  while (!predicate()) {
    if (Date.now() >= deadline) throw new window.Error(message);
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
  }
}

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

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const body = canvasElement.ownerDocument.body;
    const trigger = canvasElement.querySelector<HTMLButtonElement>(
      '[data-meu-component="number-keyboard-trigger"]'
    );
    const form = trigger ? trigger.closest<HTMLFormElement>("form") : null;
    const submit = Array.from(canvasElement.querySelectorAll<HTMLButtonElement>("button")).find(
      (button) => button.textContent === "提交金额"
    );
    const output = canvasElement.querySelector<HTMLOutputElement>("output");
    if (!trigger || !form || !submit || !output) {
      throw new window.Error("Expected amount form controls");
    }

    trigger.focus();
    trigger.click();
    await waitForStory(
      () => body.querySelector('[data-meu-component="number-keyboard"]') !== null,
      "Form NumberKeyboard did not open"
    );
    const keyboard = body.querySelector<HTMLElement>('[data-meu-component="number-keyboard"]');
    const one = keyboard
      ? keyboard.querySelector<HTMLButtonElement>('button[aria-label="1"]')
      : null;
    const decimal = keyboard
      ? keyboard.querySelector<HTMLButtonElement>('button[aria-label="小数点"]')
      : null;
    const two = keyboard
      ? keyboard.querySelector<HTMLButtonElement>('button[aria-label="2"]')
      : null;
    const confirm = keyboard
      ? Array.from(keyboard.querySelectorAll<HTMLButtonElement>("button")).find(
          (button) => button.textContent === "完成输入"
        )
      : undefined;
    if (!one || !decimal || !two || !confirm) {
      throw new window.Error("Expected amount keyboard controls");
    }

    one.click();
    await waitForStory(
      () => Boolean(trigger.textContent && trigger.textContent.includes("¥ 1")),
      "NumberKeyboard digit was not written to the form field"
    );
    decimal.click();
    await waitForStory(
      () => Boolean(trigger.textContent && trigger.textContent.includes("¥ 1.")),
      "NumberKeyboard decimal was not written to the form field"
    );
    two.click();
    await waitForStory(
      () => Boolean(trigger.textContent && trigger.textContent.includes("¥ 1.2")),
      "NumberKeyboard input was not written to the form field"
    );
    confirm.click();
    await waitForStory(
      () => body.querySelector('[data-meu-component="number-keyboard"]') === null,
      "Form NumberKeyboard did not close after confirmation"
    );
    if (
      new FormData(form).get("amount") !== "1.2" ||
      canvasElement.ownerDocument.activeElement !== trigger
    ) {
      throw new window.Error("NumberKeyboard did not preserve its confirmed native form value");
    }

    submit.click();
    await waitForStory(
      () => output.textContent === "已提交：¥ 1.2",
      "Form did not submit the NumberKeyboard value"
    );
  }
};
