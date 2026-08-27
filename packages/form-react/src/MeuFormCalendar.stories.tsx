import { createDateParts, nativeDateAdapter } from "@meu/date-adapter";
import { Button } from "@meu/mobile";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { MeuForm } from "./MeuForm";
import { MeuFormCalendar } from "./MeuFormCalendar";
import { useMeuForm } from "./useMeuForm";

function date(day: number) {
  return nativeDateAdapter.fromParts(createDateParts({ day, month: 8, year: 2026 }))!;
}

type Values = { campaignDates: ReadonlyArray<Date> };

function FormCalendarExample() {
  const form = useMeuForm<Values>({ defaultValues: { campaignDates: [date(8), date(18)] } });
  return (
    <MeuForm form={form} onSubmit={() => undefined}>
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
    </MeuForm>
  );
}

const meta = {
  title: "Forms/CalendarIntegration",
  component: FormCalendarExample
} satisfies Meta<typeof FormCalendarExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
