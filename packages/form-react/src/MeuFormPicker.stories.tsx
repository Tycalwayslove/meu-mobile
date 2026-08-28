import { Button } from "@meu/mobile";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { MeuForm } from "./MeuForm";
import { MeuFormPicker } from "./MeuFormPicker";
import { useMeuForm } from "./useMeuForm";

async function waitForStory(predicate: () => boolean, message: string) {
  const deadline = Date.now() + 3_000;
  while (!predicate()) {
    if (Date.now() >= deadline) throw new window.Error(message);
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
  }
}

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

export const ConfirmToCommit: Story = {
  play: async ({ canvasElement }) => {
    const body = canvasElement.ownerDocument.body;
    const trigger = canvasElement.querySelector<HTMLButtonElement>(
      '[data-meu-component="picker-trigger"]'
    );
    const form = trigger ? trigger.closest<HTMLFormElement>("form") : null;
    const submit = Array.from(canvasElement.querySelectorAll<HTMLButtonElement>("button")).find(
      (button) => button.textContent === "提交预约"
    );
    const output = canvasElement.querySelector<HTMLOutputElement>("output");
    if (!trigger || !form || !submit || !output) {
      throw new window.Error("Expected appointment form controls");
    }

    trigger.focus();
    trigger.click();
    await waitForStory(
      () => body.querySelector('[data-meu-component="picker"]') !== null,
      "Form Picker did not open"
    );
    const picker = body.querySelector<HTMLElement>('[data-meu-component="picker"]');
    const tomorrow = picker
      ? Array.from(picker.querySelectorAll<HTMLElement>('[role="option"]')).find(
          (option) => option.textContent === "明天"
        )
      : undefined;
    const eleven = picker
      ? Array.from(picker.querySelectorAll<HTMLElement>('[role="option"]')).find(
          (option) => option.textContent === "11:00"
        )
      : undefined;
    const confirm = picker
      ? Array.from(picker.querySelectorAll<HTMLButtonElement>("button")).find(
          (button) => button.textContent === "确定"
        )
      : undefined;
    if (!picker || !tomorrow || !eleven || !confirm) {
      throw new window.Error("Expected appointment Picker controls");
    }

    tomorrow.click();
    await waitForStory(
      () => tomorrow.getAttribute("aria-selected") === "true",
      "Appointment Picker did not select the requested day"
    );
    eleven.click();
    await waitForStory(
      () => eleven.getAttribute("aria-selected") === "true",
      "Appointment Picker did not select the requested time"
    );
    confirm.click();
    await waitForStory(
      () => body.querySelector('[data-meu-component="picker"]') === null,
      "Form Picker did not close after confirmation"
    );
    if (!trigger.textContent || !trigger.textContent.includes("明天 / 11:00")) {
      throw new window.Error("Confirmed appointment was not rendered by the form trigger");
    }
    const submittedValues = new FormData(form).getAll("appointment");
    if (
      submittedValues.length !== 2 ||
      submittedValues[0] !== "tomorrow" ||
      submittedValues[1] !== "11"
    ) {
      throw new window.Error("Picker value was not reflected in native FormData");
    }
    await waitForStory(
      () => canvasElement.ownerDocument.activeElement === trigger,
      "Form Picker did not restore trigger focus"
    );

    submit.click();
    await waitForStory(
      () => output.textContent === '{"appointment":["tomorrow",11]}',
      "Form did not submit the confirmed appointment"
    );
  }
};
