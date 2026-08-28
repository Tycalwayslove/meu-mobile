import { nativeDateAdapter } from "@meu/date-adapter";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";

import { Field } from "../Field";
import { PickerTrigger } from "../Picker";
import { waitForStory } from "../storyTestUtils";
import { DatePicker } from "./DatePicker";
import type { DatePickerFilter } from "./types";

const min = nativeDateAdapter.fromParts({
  day: 1,
  hour: 0,
  millisecond: 0,
  minute: 0,
  month: 1,
  second: 0,
  year: 2025
})!;
const max = nativeDateAdapter.fromParts({
  day: 31,
  hour: 23,
  millisecond: 999,
  minute: 59,
  month: 12,
  second: 59,
  year: 2027
})!;
const initial = nativeDateAdapter.fromParts({
  day: 28,
  hour: 9,
  millisecond: 0,
  minute: 30,
  month: 8,
  second: 0,
  year: 2026
})!;
const weekdayFilter: DatePickerFilter<unknown> = {
  day: (_value, details) => !(details.date instanceof Date) || details.date.getDay() !== 0
};

function DatePickerPreview({ precision = "day" }: { precision?: "day" | "minute" }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<Date | null>(initial);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pattern = precision === "minute" ? "YYYY-MM-DD HH:mm" : "YYYY-MM-DD";

  return (
    <Field label={precision === "minute" ? "预约时间" : "预约日期"}>
      <PickerTrigger
        ref={triggerRef}
        open={open}
        value={value ? nativeDateAdapter.format(value, pattern) : undefined}
        onClick={() => setOpen(true)}
      />
      <DatePicker
        open={open}
        title={precision === "minute" ? "预约时间" : "预约日期"}
        max={max}
        min={min}
        minuteStep={15}
        precision={precision}
        returnFocusRef={triggerRef}
        value={value}
        onConfirm={setValue}
        onOpenChange={setOpen}
      />
    </Field>
  );
}

const meta = {
  title: "Data Entry/DatePicker",
  component: DatePicker,
  args: {
    max,
    min,
    title: "预约日期"
  },
  render: () => <DatePickerPreview />
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultDate: Story = {
  play: async ({ canvasElement }) => {
    const body = canvasElement.ownerDocument.body;
    const trigger = canvasElement.querySelector<HTMLButtonElement>(
      '[data-meu-component="picker-trigger"]'
    );
    if (!trigger) throw new window.Error("Expected DatePicker trigger");

    trigger.focus();
    trigger.click();
    await waitForStory(
      () => body.querySelector('[data-meu-component="date-picker"]') !== null,
      "DatePicker did not open"
    );

    const picker = body.querySelector<HTMLElement>('[data-meu-component="date-picker"]');
    const dialog = picker && picker.closest<HTMLElement>('[role="dialog"]');
    const dayOption = picker
      ? Array.from(picker.querySelectorAll<HTMLElement>('[role="option"]')).find(
          (option) => option.textContent === "29日"
        )
      : undefined;
    const confirm = picker
      ? Array.from(picker.querySelectorAll<HTMLButtonElement>("button")).find(
          (button) => button.textContent === "确定"
        )
      : undefined;
    if (!dialog || !dayOption || !confirm) {
      throw new window.Error("Expected DatePicker dialog controls");
    }
    const labelledBy = dialog.getAttribute("aria-labelledby");
    const title = labelledBy ? canvasElement.ownerDocument.getElementById(labelledBy) : null;
    if (
      dialog.getAttribute("aria-label") !== "预约日期" &&
      (!title || title.textContent !== "预约日期")
    ) {
      throw new window.Error("DatePicker dialog is missing its accessible name");
    }

    dayOption.click();
    await waitForStory(
      () => dayOption.getAttribute("aria-selected") === "true",
      "DatePicker did not select the requested day"
    );
    confirm.click();
    await waitForStory(
      () => body.querySelector('[data-meu-component="date-picker"]') === null,
      "DatePicker did not close after confirmation"
    );
    if (!trigger.textContent || !trigger.textContent.includes("2026-08-29")) {
      throw new window.Error("DatePicker confirmation did not update the field value");
    }
    await waitForStory(
      () => canvasElement.ownerDocument.activeElement === trigger,
      "DatePicker did not restore focus to its trigger"
    );
  }
};

export const DateAndTime: Story = {
  render: () => <DatePickerPreview precision="minute" />
};

export const BoundedAndFiltered: Story = {
  args: {
    defaultValue: initial,
    filter: weekdayFilter,
    open: true,
    title: "工作日",
    value: undefined
  },
  render: (args) => <DatePicker {...args} />
};
