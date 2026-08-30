import { createDateParts, nativeDateAdapter } from "@meu/date-adapter";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";

import { ConfigProvider } from "../ConfigProvider";
import { Field } from "../Field";
import { PickerTrigger } from "../Picker";
import { waitForStory } from "../storyTestUtils";
import { DateRangePicker } from "./DateRangePicker";
import type { CalendarRange, DateRangePickerPreset } from "./types";

function date(day: number, month = 8) {
  return nativeDateAdapter.fromParts(createDateParts({ day, month, year: 2026 }))!;
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

export const CrossMonthAndDisabledIntermediate: Story = {
  args: {
    "aria-label": "跨月配送范围",
    defaultMonth: date(1),
    disabledDate: (candidate: unknown) => {
      if (!(candidate instanceof Date)) return true;
      const parts = nativeDateAdapter.getParts(candidate);
      return parts.month === 8 && parts.day === 31;
    },
    max: date(5, 9),
    min: date(28),
    open: true,
    title: undefined
  },
  render: (args) => <DateRangePicker {...args} />,
  play: async ({ canvasElement }) => {
    const body = canvasElement.ownerDocument.body;
    const picker = body.querySelector<HTMLElement>('[data-meu-component="date-range-picker"]');
    if (!picker) throw new window.Error("Expected the cross-month DateRangePicker");
    const august30 = picker.querySelector<HTMLButtonElement>(
      '[data-date="2026-08-30"][data-outside="false"]'
    );
    const disabledIntermediate = picker.querySelector<HTMLButtonElement>(
      '[data-date="2026-08-31"][data-outside="false"]'
    );
    const next = Array.from(picker.querySelectorAll<HTMLButtonElement>("button")).find((button) =>
      ["下个月", "Next month"].includes(button.getAttribute("aria-label") || "")
    );
    if (!august30 || !disabledIntermediate || !next || !disabledIntermediate.disabled) {
      throw new window.Error("Expected bounded August range controls");
    }

    august30.click();
    next.click();
    await waitForStory(
      () =>
        picker.querySelector<HTMLButtonElement>(
          '[data-date="2026-09-02"][data-outside="false"]'
        ) !== null,
      "DateRangePicker did not navigate to the second month"
    );
    const september2 = picker.querySelector<HTMLButtonElement>(
      '[data-date="2026-09-02"][data-outside="false"]'
    );
    if (!september2) throw new window.Error("Expected September end date");
    september2.click();

    const confirm = Array.from(picker.querySelectorAll<HTMLButtonElement>("button")).find(
      (button) => ["确定", "Confirm"].includes(button.textContent || "")
    );
    await waitForStory(
      () =>
        picker.getAttribute("data-range-complete") === "true" &&
        Boolean(confirm && !confirm.disabled),
      "A range crossing a disabled intermediate date did not become confirmable"
    );
  }
};

export const LongLocalizedAdaptiveContent: Story = {
  render: () => (
    <ConfigProvider dir="rtl" locale="en-US" motion="reduced">
      <DateRangePicker
        open
        title="Choose a delivery date range for an exceptionally long international destination"
        cancelText="Keep the current delivery dates"
        confirmText="Confirm this delivery window"
        defaultMonth={date(1)}
        defaultValue={[date(8), date(18)]}
        presets={[
          {
            key: "international",
            label: "International fulfillment window with customs processing",
            value: [date(8), date(18)]
          }
        ]}
        renderRangeLabel={() =>
          "Saturday, 8 August 2026 through Tuesday, 18 August 2026 — destination-specific delivery estimate"
        }
      />
    </ConfigProvider>
  ),
  play: ({ canvasElement }) => {
    const body = canvasElement.ownerDocument.body;
    const picker = body.querySelector<HTMLElement>('[data-meu-component="date-range-picker"]');
    const dialog = picker === null ? null : picker.closest<HTMLElement>('[role="dialog"]');
    if (!picker || !dialog) throw new window.Error("Expected localized DateRangePicker dialog");
    const overlay = dialog.closest('[data-meu-overlay-layer="popup"]');
    if (overlay === null || overlay.getAttribute("dir") !== "rtl") {
      throw new window.Error("DateRangePicker lost its RTL portal boundary");
    }
    if (picker.scrollWidth > picker.clientWidth + 1) {
      throw new window.Error("Long localized DateRangePicker content overflowed horizontally");
    }
    const actionButtons = Array.from(picker.querySelectorAll<HTMLButtonElement>("button")).filter(
      (button) =>
        button.textContent === "Keep the current delivery dates" ||
        button.textContent === "Confirm this delivery window" ||
        button.textContent === "International fulfillment window with customs processing"
    );
    if (
      actionButtons.length !== 3 ||
      actionButtons.some((button) => button.getBoundingClientRect().height < 44)
    ) {
      throw new window.Error("DateRangePicker localized actions lost their touch geometry");
    }

    const dialogStyle = window.getComputedStyle(dialog);
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      dialogStyle.transitionDuration
        .split(",")
        .some((duration) => Number.parseFloat(duration) > 0.001)
    ) {
      throw new window.Error("DateRangePicker retained visible motion in reduced-motion mode");
    }
    if (
      window.matchMedia("(forced-colors: active)").matches &&
      Number.parseFloat(dialogStyle.borderTopWidth) < 1
    ) {
      throw new window.Error("DateRangePicker lost its forced-colors dialog boundary");
    }
  }
};
