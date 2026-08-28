import { Button } from "@meu/mobile";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { z } from "zod";

import { MeuForm } from "./MeuForm";
import { MeuFormPasscodeInput } from "./MeuFormPasscodeInput";
import { useMeuForm } from "./useMeuForm";

async function waitForStory(predicate: () => boolean, message: string) {
  const deadline = Date.now() + 3_000;
  while (!predicate()) {
    if (Date.now() >= deadline) throw new window.Error(message);
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
  }
}

const schema = z.object({ code: z.string().length(6, "请输入 6 位验证码") });
type Values = z.infer<typeof schema>;

function Example() {
  const [result, setResult] = useState("尚未提交");
  const form = useMeuForm<Values>({ schema, defaultValues: { code: "" } });
  return (
    <MeuForm
      form={form}
      onSubmit={(values) => setResult(`已提交：${values.code}`)}
      style={{ display: "grid", gap: 16, width: "min(100%, 420px)" }}
    >
      <MeuFormPasscodeInput<Values>
        name="code"
        label="短信验证码"
        description="真实 input、自动填充与完整 React Hook Form 生命周期"
        length={6}
        keyboard={{ closeOnComplete: true, title: "验证码键盘" }}
        required
      />
      <Button type="submit">验证并提交</Button>
      <output aria-live="polite">{result}</output>
    </MeuForm>
  );
}

const meta = {
  title: "Forms/MeuFormPasscodeInput",
  component: Example,
  parameters: { layout: "padded" }
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const body = canvasElement.ownerDocument.body;
    const input = canvasElement.querySelector<HTMLInputElement>(
      '[data-meu-component="passcode-input"] input'
    );
    const root = canvasElement.querySelector<HTMLElement>('[data-meu-component="passcode-input"]');
    const form = input ? input.closest<HTMLFormElement>("form") : null;
    const submit = Array.from(canvasElement.querySelectorAll<HTMLButtonElement>("button")).find(
      (button) => button.textContent === "验证并提交"
    );
    const output = canvasElement.querySelector<HTMLOutputElement>("output");
    if (!input || !root || !form || !submit || !output) {
      throw new window.Error("Expected passcode form controls");
    }

    input.focus();
    await waitForStory(
      () => body.querySelector('[data-meu-component="number-keyboard"]') !== null,
      "Passcode number keyboard did not open"
    );
    const keyboard = body.querySelector<HTMLElement>('[data-meu-component="number-keyboard"]');
    if (!keyboard) throw new window.Error("Expected passcode keyboard");
    let expectedValue = "";
    for (const digit of ["1", "2", "3", "4", "5", "6"]) {
      const key = keyboard.querySelector<HTMLButtonElement>(`button[aria-label="${digit}"]`);
      if (!key) throw new window.Error(`Expected passcode key ${digit}`);
      key.click();
      expectedValue += digit;
      await waitForStory(
        () => input.value === expectedValue,
        `Passcode key ${digit} was not written to the controlled input`
      );
    }

    await waitForStory(
      () => input.value === "123456" && root.getAttribute("data-complete") === "true",
      "Passcode input did not complete its controlled form value"
    );
    await waitForStory(
      () => body.querySelector('[data-meu-component="number-keyboard"]') === null,
      "Passcode keyboard did not close on completion"
    );
    if (new FormData(form).get("code") !== "123456") {
      throw new window.Error("Passcode was not reflected in native FormData");
    }

    submit.click();
    await waitForStory(
      () => output.textContent === "已提交：123456",
      "Form did not submit the completed passcode"
    );
  }
};
