import { nativeDateAdapter } from "@meu/date-adapter";
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

async function waitForFormStory(predicate: () => boolean, message: string) {
  const deadline = Date.now() + 2_000;
  while (!predicate()) {
    if (Date.now() >= deadline) throw new window.Error(message);
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
  }
}

const meta = {
  title: "Forms/DatePickerIntegration",
  component: FormDatePickerExample,
  parameters: { layout: "padded" }
} satisfies Meta<typeof FormDatePickerExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ConfirmDateToCommit: Story = {
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLButtonElement>(
      '[data-meu-component="picker-trigger"]'
    );
    const submit = Array.from(canvasElement.querySelectorAll<HTMLButtonElement>("button")).find(
      (button) => button.textContent === "提交日期"
    );
    const output = canvasElement.querySelector('output[aria-live="polite"]');
    if (!trigger || !submit || !output)
      throw new window.Error("Expected date picker form controls");

    submit.click();
    await waitForFormStory(
      () => canvasElement.querySelector('[role="alert"]') !== null,
      "Expected required date validation"
    );
    const alert = canvasElement.querySelector('[role="alert"]');
    if (
      !alert ||
      alert.textContent !== "请选择送达日期" ||
      trigger.getAttribute("data-invalid") !== "true" ||
      document.activeElement !== trigger
    ) {
      throw new window.Error("Expected invalid date feedback and trigger focus");
    }

    trigger.click();
    await waitForFormStory(
      () => document.querySelector('[role="dialog"][aria-modal="true"]') !== null,
      "Expected date picker dialog to open"
    );
    let dialog = document.querySelector<HTMLElement>('[role="dialog"][aria-modal="true"]');
    let day15 = dialog
      ? Array.from(dialog.querySelectorAll<HTMLElement>('[role="option"]')).find(
          (option) => option.textContent === "15日"
        )
      : undefined;
    const cancel = dialog
      ? Array.from(dialog.querySelectorAll<HTMLButtonElement>("button")).find(
          (button) => button.textContent === "取消"
        )
      : undefined;
    if (!day15 || !cancel) throw new window.Error("Expected date picker draft controls");
    day15.click();
    cancel.click();
    await waitForFormStory(
      () => document.querySelector('[role="dialog"][aria-modal="true"]') === null,
      "Expected cancelled date picker to close"
    );
    if (!trigger.textContent || !trigger.textContent.includes("选择日期")) {
      throw new window.Error("Expected cancellation to preserve the empty date");
    }

    trigger.click();
    await waitForFormStory(
      () => document.querySelector('[role="dialog"][aria-modal="true"]') !== null,
      "Expected date picker dialog to reopen"
    );
    dialog = document.querySelector<HTMLElement>('[role="dialog"][aria-modal="true"]');
    day15 = dialog
      ? Array.from(dialog.querySelectorAll<HTMLElement>('[role="option"]')).find(
          (option) => option.textContent === "15日"
        )
      : undefined;
    const confirm = dialog
      ? Array.from(dialog.querySelectorAll<HTMLButtonElement>("button")).find(
          (button) => button.textContent === "确定"
        )
      : undefined;
    if (!day15 || !confirm) throw new window.Error("Expected date picker confirm controls");
    day15.click();
    confirm.click();
    await waitForFormStory(
      () => Boolean(trigger.textContent && trigger.textContent.includes("2026-08-15")),
      "Expected confirmed date on the trigger"
    );
    submit.click();
    await waitForFormStory(
      () => output.textContent !== "尚未提交",
      "Expected confirmed date value to submit"
    );
    const submittedDate = output.textContent ? new Date(output.textContent) : null;
    if (
      !submittedDate ||
      !nativeDateAdapter.isValid(submittedDate) ||
      nativeDateAdapter.getParts(submittedDate).day !== 15
    ) {
      throw new window.Error("Expected the submitted Date to preserve the confirmed day");
    }
  }
};
