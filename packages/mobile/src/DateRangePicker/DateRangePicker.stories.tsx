import { createDateParts, nativeDateAdapter } from "@meu/date-adapter";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";

import { Field } from "../Field";
import { PickerTrigger } from "../Picker";
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

export const Default: Story = {};

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
