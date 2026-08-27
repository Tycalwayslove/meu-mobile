// @vitest-environment jsdom
import { createDateParts, nativeDateAdapter } from "@meu/date-adapter";
import type { DateAdapter } from "@meu/date-adapter";
import { Button } from "@meu/mobile";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MeuForm } from "./MeuForm";
import { MeuFormCalendar } from "./MeuFormCalendar";
import { useMeuForm } from "./useMeuForm";

function date(day: number) {
  return nativeDateAdapter.fromParts(createDateParts({ day, month: 8, year: 2026 }))!;
}

function dayButton(day: number) {
  return screen.getAllByRole("button", {
    name: new RegExp(`^2026-08-${String(day).padStart(2, "0")}`)
  })[0]!;
}

type Values = {
  deliveryDate: Date | null;
  deliveryWindow: readonly [Date, Date] | null;
};

const numericDateAdapter: DateAdapter<number> = {
  add(value, amount, unit) {
    return nativeDateAdapter.add(new Date(value), amount, unit).getTime();
  },
  compare(left, right) {
    return left - right;
  },
  format(value, pattern, locale) {
    return nativeDateAdapter.format(new Date(value), pattern, locale);
  },
  fromParts(parts) {
    const value = nativeDateAdapter.fromParts(parts);
    return value === null ? null : value.getTime();
  },
  getDayOfWeek(value) {
    return nativeDateAdapter.getDayOfWeek(new Date(value));
  },
  getDaysInMonth(parts) {
    return nativeDateAdapter.getDaysInMonth(parts);
  },
  getParts(value) {
    return nativeDateAdapter.getParts(new Date(value));
  },
  isValid(value) {
    return Number.isFinite(value) && nativeDateAdapter.isValid(new Date(value));
  },
  now() {
    return 0;
  },
  parse(value, pattern, locale) {
    const parsed = nativeDateAdapter.parse(value, pattern, locale);
    return parsed === null ? null : parsed.getTime();
  },
  startOf(value, unit) {
    return nativeDateAdapter.startOf(new Date(value), unit).getTime();
  }
};

afterEach(cleanup);

function CalendarForm({ onSubmit }: { onSubmit: (values: Values) => void }) {
  const form = useMeuForm<Values>({
    defaultValues: { deliveryDate: null, deliveryWindow: null }
  });

  return (
    <MeuForm form={form} onSubmit={onSubmit}>
      <MeuFormCalendar<Values>
        name="deliveryDate"
        label="送达日期"
        defaultMonth={date(1)}
        required
        rules={{ validate: (value) => value instanceof Date || "请选择送达日期" }}
      />
      <MeuFormCalendar<Values>
        name="deliveryWindow"
        label="送达区间"
        selectionMode="range"
        defaultMonth={date(1)}
      />
      <output data-testid="dirty">{form.formState.isDirty ? "dirty" : "pristine"}</output>
      <Button type="submit">提交订单</Button>
    </MeuForm>
  );
}

describe("MeuFormCalendar", () => {
  it("keeps a numeric adapter value of zero selected", () => {
    type NumericValues = { epochDate: number | null };
    function NumericCalendarForm() {
      const form = useMeuForm<NumericValues>({ defaultValues: { epochDate: 0 } });
      return (
        <MeuForm form={form} onSubmit={vi.fn()}>
          <MeuFormCalendar<NumericValues, number>
            name="epochDate"
            label="纪元日期"
            adapter={numericDateAdapter}
            defaultMonth={0}
          />
        </MeuForm>
      );
    }

    render(<NumericCalendarForm />);
    const calendar = screen.getByRole("group", { name: "纪元日期" });
    const selected = calendar.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
    expect(selected).not.toBeNull();
  });

  it("writes single and complete range selections into their exact field shapes", async () => {
    const onSubmit = vi.fn();
    render(<CalendarForm onSubmit={onSubmit} />);

    const calendars = screen.getAllByRole("grid");
    fireEvent.click(dayButton(10));
    const rangeGrid = calendars[1]!;
    const rangeStart = rangeGrid.querySelector<HTMLButtonElement>('[data-date="2026-08-12"]')!;
    const rangeEnd = rangeGrid.querySelector<HTMLButtonElement>('[data-date="2026-08-15"]')!;
    fireEvent.click(rangeStart);
    fireEvent.click(rangeEnd);
    expect(screen.getByTestId("dirty").textContent).toBe("dirty");

    fireEvent.click(screen.getByRole("button", { name: "提交订单" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const submitted = onSubmit.mock.calls[0]![0] as Values;
    expect(nativeDateAdapter.getParts(submitted.deliveryDate!).day).toBe(10);
    expect(submitted.deliveryWindow!.map((value) => nativeDateAdapter.getParts(value).day)).toEqual(
      [12, 15]
    );
  });

  it("associates validation feedback and focuses a real date button", async () => {
    render(<CalendarForm onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "提交订单" }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe("请选择送达日期");
    await waitFor(() => {
      const activeElement = document.activeElement;
      expect(activeElement && activeElement.getAttribute("data-date")).toBeTruthy();
    });
  });
});
