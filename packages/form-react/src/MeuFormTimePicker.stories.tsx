import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@meu/mobile";
import { useState } from "react";

import { MeuForm } from "./MeuForm";
import { MeuFormTimePicker } from "./MeuFormTimePicker";
import { useMeuForm } from "./useMeuForm";

type Values = {
  deliveryTime: { hour: number; minute: number; second: number } | null;
};

function nextStoryFrame() {
  return new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
}

async function waitForStory(predicate: () => boolean, message: string) {
  const deadline = Date.now() + 2_000;
  while (!predicate()) {
    if (Date.now() >= deadline) throw new window.Error(message);
    await nextStoryFrame();
  }
}

function findButton(container: ParentNode, label: string) {
  return Array.from(container.querySelectorAll<HTMLButtonElement>("button")).find(
    (button) => (button.textContent || "").trim() === label
  );
}

function findOption(container: ParentNode, label: string) {
  return Array.from(container.querySelectorAll<HTMLElement>('[role="option"]')).find(
    (option) => (option.textContent || "").trim() === label
  );
}

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

export const ConfirmOnlyCommit: Story = {
  play: async ({ canvasElement }) => {
    const form = canvasElement.querySelector<HTMLFormElement>("form");
    const trigger = canvasElement.querySelector<HTMLButtonElement>(
      '[data-meu-component="picker-trigger"]'
    );
    const submit = canvasElement.querySelector<HTMLButtonElement>('button[type="submit"]');
    const output = canvasElement.querySelector<HTMLOutputElement>("output");
    if (!form || !trigger || !submit || !output) {
      throw new window.Error("Expected time picker form controls");
    }
    if (!(trigger.textContent || "").includes("10:30")) {
      throw new window.Error("Time picker trigger did not show its initial form value");
    }

    const body = canvasElement.ownerDocument.body;
    trigger.click();
    await waitForStory(
      () => body.querySelector('[data-meu-component="time-picker"]') !== null,
      "Form TimePicker did not open in its portal"
    );
    const picker = body.querySelector<HTMLElement>('[data-meu-component="time-picker"]');
    if (!picker) throw new window.Error("Expected TimePicker panel");
    const dialog = picker.closest<HTMLElement>('[role="dialog"]');
    if (!dialog) throw new window.Error("Expected TimePicker dialog");
    const minute45 = findOption(dialog, "45分");
    const cancel = findButton(dialog, "取消");
    if (!minute45 || !cancel) throw new window.Error("Expected TimePicker draft controls");
    minute45.click();
    await waitForStory(
      () => minute45.getAttribute("aria-selected") === "true",
      "TimePicker did not update its draft minute"
    );
    cancel.click();
    await waitForStory(
      () =>
        trigger.getAttribute("aria-expanded") === "false" &&
        canvasElement.ownerDocument.activeElement === trigger,
      "TimePicker cancel did not close and restore focus"
    );
    if (
      !(trigger.textContent || "").includes("10:30") ||
      new FormData(form).get("deliveryTime") !== "10:30"
    ) {
      throw new window.Error("Cancelled TimePicker draft changed the form value");
    }

    trigger.click();
    await waitForStory(
      () => trigger.getAttribute("aria-expanded") === "true",
      "TimePicker did not reopen"
    );
    const reopenedPicker = body.querySelector<HTMLElement>('[data-meu-component="time-picker"]');
    if (!reopenedPicker) throw new window.Error("Expected reopened TimePicker panel");
    const minute30 = findOption(reopenedPicker, "30分");
    const nextMinute45 = findOption(reopenedPicker, "45分");
    const confirm = findButton(reopenedPicker, "确定");
    if (!minute30 || !nextMinute45 || !confirm) {
      throw new window.Error("Expected reopened TimePicker controls");
    }
    if (minute30.getAttribute("aria-selected") !== "true") {
      throw new window.Error("TimePicker did not discard its cancelled draft");
    }
    nextMinute45.click();
    await waitForStory(
      () => nextMinute45.getAttribute("aria-selected") === "true",
      "TimePicker did not update its reopened draft"
    );
    confirm.click();
    await waitForStory(
      () =>
        (trigger.textContent || "").includes("10:45") &&
        new FormData(form).get("deliveryTime") === "10:45" &&
        canvasElement.ownerDocument.activeElement === trigger,
      "TimePicker confirm did not commit the form value and restore focus"
    );

    submit.click();
    await waitForStory(
      () => output.textContent === "10:45",
      "TimePicker form did not submit its confirmed TimeValue"
    );
  }
};
