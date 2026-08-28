import { createDateParts, nativeDateAdapter } from "@meu/date-adapter";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";

import { Field } from "../Field";
import { PickerTrigger } from "../Picker";
import { waitForStory } from "../storyTestUtils";
import { DateRangePicker } from "./DateRangePicker";
import type { CalendarRange, DateRangePickerPreset } from "./types";

function date(day: number) {
  return nativeDateAdapter.fromParts(createDateParts({ day, month: 8, year: 2026 }))!;
}

const presets: ReadonlyArray<DateRangePickerPreset<Date>> = [
  { key: "week", label: "未来 7 天", value: [date(8), date(14)] },
  { key: "month", label: "本月", value: [date(1), date(31)] }
];

function DateRangePickerPreview() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<CalendarRange<Date> | null>([date(8), date(18)]);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const formatted = value
    ? `${nativeDateAdapter.format(value[0], "YYYY-MM-DD")} – ${nativeDateAdapter.format(
        value[1],
        "YYYY-MM-DD"
      )}`
    : undefined;

  return (
    <Field label="配送日期范围" description="取消不提交草稿，确定后才更新范围。">
      <PickerTrigger ref={triggerRef} open={open} value={formatted} onClick={() => setOpen(true)} />
      <DateRangePicker
        open={open}
        title="配送日期范围"
        defaultMonth={date(1)}
        min={date(1)}
        max={date(31)}
        presets={presets}
        returnFocusRef={triggerRef}
        value={value}
        onConfirm={setValue}
        onOpenChange={setOpen}
      />
    </Field>
  );
}

const meta = {
  title: "Data Entry/DateRangePicker",
  component: DateRangePicker,
  args: { title: "配送日期范围" },
  parameters: { layout: "padded" },
  render: () => <DateRangePickerPreview />
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const body = canvasElement.ownerDocument.body;
    const trigger = canvasElement.querySelector<HTMLButtonElement>(
      '[data-meu-component="picker-trigger"]'
    );
    if (!trigger) throw new window.Error("Expected DateRangePicker trigger");

    trigger.focus();
    trigger.click();
    await waitForStory(
      () => body.querySelector('[data-meu-component="date-range-picker"]') !== null,
      "DateRangePicker did not open"
    );

    const picker = body.querySelector<HTMLElement>('[data-meu-component="date-range-picker"]');
    const dialog = picker && picker.closest<HTMLElement>('[role="dialog"]');
    const preset = picker
      ? Array.from(picker.querySelectorAll<HTMLButtonElement>("button")).find(
          (button) => button.textContent === "未来 7 天"
        )
      : undefined;
    const confirm = picker
      ? Array.from(picker.querySelectorAll<HTMLButtonElement>("button")).find(
          (button) => button.textContent === "确定"
        )
      : undefined;
    if (!dialog || !preset || !confirm) {
      throw new window.Error("Expected DateRangePicker dialog controls");
    }
    const labelledBy = dialog.getAttribute("aria-labelledby");
    const title = labelledBy ? canvasElement.ownerDocument.getElementById(labelledBy) : null;
    if (!title || title.textContent !== "配送日期范围") {
      throw new window.Error("DateRangePicker dialog is missing its accessible name");
    }

    preset.click();
    await waitForStory(
      () => picker.getAttribute("data-range-complete") === "true" && !confirm.disabled,
      "DateRangePicker preset did not create a complete draft"
    );
    confirm.click();
    await waitForStory(
      () => body.querySelector('[data-meu-component="date-range-picker"]') === null,
      "DateRangePicker did not close after confirmation"
    );
    if (!trigger.textContent || !trigger.textContent.includes("2026-08-08 – 2026-08-14")) {
      throw new window.Error("DateRangePicker confirmation did not update the field value");
    }
    await waitForStory(
      () => canvasElement.ownerDocument.activeElement === trigger,
      "DateRangePicker did not restore focus to its trigger"
    );
  }
};

export const OpenWithPresets: Story = {
  args: {
    "aria-label": "日期范围选择器",
    defaultMonth: date(1),
    defaultValue: [date(8), date(18)],
    max: date(31),
    min: date(1),
    open: true,
    presets
  },
  render: (args) => <DateRangePicker {...args} />
};
