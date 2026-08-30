import { nativeDateAdapter } from "@meu/date-adapter";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";

import { ConfigProvider } from "../ConfigProvider";
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

export const LongLocalizedRTL: Story = {
  args: {
    cancelText: "Keep the currently selected delivery date",
    confirmText: "Confirm this delivery date",
    defaultValue: initial,
    open: true,
    precision: "minute",
    minuteStep: 15,
    title: "Choose the preferred delivery date and arrival window for this order",
    renderLabel: (type, value) => (
      <span>{type === "month" ? `Month ${value} — seasonal delivery schedule` : value}</span>
    ),
    value: undefined
  },
  render: (args) => (
    <ConfigProvider dir="rtl" locale="en-US">
      <DatePicker {...args} lockScroll={false} restoreFocus={false} />
    </ConfigProvider>
  ),
  play: ({ canvasElement }) => {
    const picker = canvasElement.ownerDocument.body.querySelector<HTMLElement>(
      '[data-meu-component="date-picker"]'
    );
    const dialog = picker ? picker.closest<HTMLElement>('[role="dialog"]') : null;
    if (!picker || !dialog) throw new window.Error("Expected open DatePicker dialog");
    if (dialog.getAttribute("dir") !== "rtl" && getComputedStyle(dialog).direction !== "rtl") {
      throw new window.Error("DatePicker did not inherit RTL direction");
    }
    if (picker.scrollWidth > picker.clientWidth + 1) {
      throw new window.Error("DatePicker overflowed horizontally with localized content");
    }

    const buttons = Array.from(picker.querySelectorAll<HTMLButtonElement>("button"));
    if (buttons.length !== 2) throw new window.Error("Expected DatePicker header actions");
    for (const button of buttons) {
      if (button.getBoundingClientRect().height < 44) {
        throw new window.Error("DatePicker header action is below the 44px touch target");
      }
    }

    const wheels = Array.from(picker.querySelectorAll<HTMLElement>('[role="listbox"]'));
    const labels = wheels.map((wheel) => wheel.getAttribute("aria-label"));
    if (labels.join(",") !== "Year,Month,Day,Hour,Minute") {
      throw new window.Error("DatePicker changed its semantic precision order in RTL");
    }
    for (const wheel of wheels) {
      const activeId = wheel.getAttribute("aria-activedescendant");
      if (!activeId || !canvasElement.ownerDocument.getElementById(activeId)) {
        throw new window.Error("DatePicker wheel lost its active option relationship");
      }
    }

    const august = picker.querySelector<HTMLElement>(
      '[role="listbox"][aria-label="Month"] [role="option"][aria-label="08"]'
    );
    if (
      !august ||
      !august.textContent ||
      !august.textContent.includes("seasonal delivery schedule")
    ) {
      throw new window.Error("Rich DatePicker label lost its localized accessible fallback");
    }
  }
};
