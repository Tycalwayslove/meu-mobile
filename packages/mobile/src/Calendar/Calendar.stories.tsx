import { createDateParts, nativeDateAdapter } from "@meu/date-adapter";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Calendar } from "./Calendar";
import type { CalendarRange } from "./types";

function date(day: number, month = 8, year = 2026) {
  return nativeDateAdapter.fromParts(createDateParts({ day, month, year }))!;
}

function SingleExample() {
  const [value, setValue] = useState<Date | null>(date(28));
  return (
    <div style={{ maxWidth: 420 }}>
      <Calendar<Date>
        value={value}
        onChange={(next) => setValue(next)}
        defaultMonth={date(1)}
        aria-label="Calendar"
      />
    </div>
  );
}

function RangeExample() {
  const [value, setValue] = useState<CalendarRange<Date> | null>([date(8), date(12)]);
  return (
    <div style={{ maxWidth: 420 }}>
      <Calendar<Date>
        selectionMode="range"
        value={value}
        onChange={(next) => setValue(next)}
        defaultMonth={date(1)}
        min={date(3)}
        max={date(29)}
        renderLabel={(value) =>
          nativeDateAdapter.getDayOfWeek(value) === 0 || nativeDateAdapter.getDayOfWeek(value) === 6
            ? "周末"
            : null
        }
        aria-label="Calendar"
      />
    </div>
  );
}

function MultipleExample() {
  const [value, setValue] = useState<ReadonlyArray<Date>>([date(6), date(13), date(20)]);
  return (
    <div style={{ maxWidth: 420 }}>
      <Calendar<Date>
        selectionMode="multiple"
        value={value}
        onChange={(next) => setValue(next)}
        defaultMonth={date(1)}
        weekStartsOn={1}
        aria-label="Calendar"
      />
    </div>
  );
}

const meta = {
  title: "Data Entry/Calendar",
  component: Calendar,
  parameters: { layout: "centered" }
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = { render: () => <SingleExample /> };
export const Range: Story = { render: () => <RangeExample /> };
export const Multiple: Story = { render: () => <MultipleExample /> };
