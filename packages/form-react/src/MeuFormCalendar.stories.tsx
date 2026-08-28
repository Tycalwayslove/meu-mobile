import { createDateParts, nativeDateAdapter } from "@meu/date-adapter";
import { Button } from "@meu/mobile";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { MeuForm } from "./MeuForm";
import { MeuFormCalendar } from "./MeuFormCalendar";
import { useMeuForm } from "./useMeuForm";

function date(day: number) {
  return nativeDateAdapter.fromParts(createDateParts({ day, month: 8, year: 2026 }))!;
}

type Values = { campaignDates: ReadonlyArray<Date> };

function FormCalendarExample() {
  const [result, setResult] = useState("尚未提交");
  const form = useMeuForm<Values>({ defaultValues: { campaignDates: [date(8), date(18)] } });
  return (
    <MeuForm
      form={form}
      onSubmit={(values) =>
        setResult(
          values.campaignDates.map((value) => nativeDateAdapter.getParts(value).day).join(",")
        )
      }
    >
      <MeuFormCalendar<Values>
        name="campaignDates"
        label="活动日期"
        description="可以选择多个日期"
        selectionMode="multiple"
        defaultMonth={date(1)}
        required
        rules={{ validate: (value) => value.length > 0 || "请至少选择一天" }}
      />
      <Button type="submit">保存</Button>
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
  title: "Forms/CalendarIntegration",
  component: FormCalendarExample
} satisfies Meta<typeof FormCalendarExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const day8 = canvasElement.querySelector<HTMLButtonElement>('button[data-date="2026-08-08"]');
    const day12 = canvasElement.querySelector<HTMLButtonElement>('button[data-date="2026-08-12"]');
    const submit = Array.from(canvasElement.querySelectorAll<HTMLButtonElement>("button")).find(
      (button) => button.textContent === "保存"
    );
    const output = canvasElement.querySelector('output[aria-live="polite"]');
    if (!day8 || !day12 || !submit || !output) {
      throw new window.Error("Expected calendar form controls");
    }

    day8.click();
    day12.click();
    await Promise.resolve();
    if (
      day8.getAttribute("aria-pressed") !== "false" ||
      day12.getAttribute("aria-pressed") !== "true"
    ) {
      throw new window.Error("Expected calendar form selection to update");
    }
    submit.click();
    await waitForFormStory(
      () => output.textContent === "12,18",
      "Expected selected calendar dates to submit"
    );
  }
};
