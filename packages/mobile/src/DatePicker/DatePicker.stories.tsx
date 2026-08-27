import { nativeDateAdapter } from "@meu/date-adapter";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";

import { Field } from "../Field";
import { PickerTrigger } from "../Picker";
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

export const DefaultDate: Story = {};

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
