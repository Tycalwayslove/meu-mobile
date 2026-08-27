import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";

import { Field } from "../Field";
import { PickerTrigger } from "../Picker";
import { TimePicker } from "./TimePicker";
import { formatTimeValue } from "./resolveTimePicker";
import type { TimePickerHourCycle, TimeValue } from "./types";

const initial: TimeValue = { hour: 10, minute: 30, second: 0 };

function TimePickerPreview({ hourCycle = "h23" }: { hourCycle?: TimePickerHourCycle }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<TimeValue | null>(initial);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <Field label="送达时间">
      <PickerTrigger
        ref={triggerRef}
        open={open}
        value={
          value
            ? formatTimeValue(value, { hourCycle, locale: "zh-CN", precision: "minute" })
            : undefined
        }
        onClick={() => setOpen(true)}
      />
      <TimePicker
        open={open}
        title="送达时间"
        hourCycle={hourCycle}
        max={{ hour: 18, minute: 0, second: 0 }}
        min={{ hour: 9, minute: 0, second: 0 }}
        minuteStep={15}
        returnFocusRef={triggerRef}
        value={value}
        onConfirm={setValue}
        onOpenChange={setOpen}
      />
    </Field>
  );
}

const meta = {
  title: "Data Entry/TimePicker",
  component: TimePicker,
  args: {
    title: "选择时间"
  },
  render: () => <TimePickerPreview />
} satisfies Meta<typeof TimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TwelveHour: Story = {
  render: () => <TimePickerPreview hourCycle="h12" />
};

export const SecondsAndFilter: Story = {
  args: {
    defaultValue: { hour: 10, minute: 30, second: 20 },
    filter: {
      second: (value) => value !== 40
    },
    max: { hour: 10, minute: 31, second: 50 },
    min: { hour: 10, minute: 29, second: 10 },
    minuteStep: 1,
    open: true,
    precision: "second",
    secondStep: 10,
    title: "精确时间"
  },
  render: (args) => <TimePicker {...args} />
};
