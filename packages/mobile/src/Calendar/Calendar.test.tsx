// @vitest-environment jsdom
import { createDateParts, nativeDateAdapter } from "@meu/date-adapter";
import type { DateAdapter } from "@meu/date-adapter";
import { createRef } from "react";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { Calendar } from "./Calendar";
import { compareCalendarDays, normalizeCalendarValue } from "./resolveCalendar";
import type { CalendarRef } from "./types";

function date(day: number, month = 8, year = 2026) {
  return nativeDateAdapter.fromParts(createDateParts({ day, month, year }))!;
}

function dayButton(day: number, month = 8, year = 2026) {
  const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return screen.getByRole("button", { name: new RegExp(`^${key}`) });
}

afterEach(cleanup);

describe("Calendar", () => {
  it("preserves falsy values from a custom date adapter", () => {
    const adapter = {
      compare: (left: number, right: number) => left - right,
      isValid: (value: number) => Number.isFinite(value),
      startOf: (value: number) => value
    } as unknown as DateAdapter<number>;

    expect(compareCalendarDays(adapter, 0, 1)).toBe(-1);
  });

  it("preserves array-shaped values in single selection mode", () => {
    type TupleDate = readonly [number, number, number];
    const adapter = {
      isValid: (value: TupleDate) => value.length === 3,
      startOf: (value: TupleDate) => value
    } as unknown as DateAdapter<TupleDate>;
    const value = [2026, 8, 12] as const;

    expect(normalizeCalendarValue(adapter, "single", value)).toBe(value);
  });

  it("renders a stable 42-day grid with localized weekday and month labels", () => {
    render(
      <ConfigProvider locale="zh-CN">
        <Calendar defaultMonth={date(1)} weekStartsOn={1} aria-label="配送日历" />
      </ConfigProvider>
    );

    expect(screen.getByText("2026年8月")).toBeTruthy();
    expect(screen.getAllByRole("columnheader").map((node) => node.textContent)).toEqual([
      "一",
      "二",
      "三",
      "四",
      "五",
      "六",
      "日"
    ]);
    expect(screen.getAllByRole("gridcell")).toHaveLength(42);
    expect(screen.getByRole("group", { name: "配送日历" })).toBeTruthy();
    const grid = screen.getByRole("grid");
    const monthTitle = screen.getByText("2026年8月");
    expect(grid.getAttribute("aria-labelledby")).toBe(monthTitle.id);
  });

  it("does not forward unsupported required semantics to group or grid roles", () => {
    render(<Calendar defaultMonth={date(1)} aria-label="配送日历" aria-required />);

    expect(
      screen.getByRole("group", { name: "配送日历" }).getAttribute("aria-required")
    ).toBeNull();
    expect(screen.getByRole("grid").getAttribute("aria-required")).toBeNull();
  });

  it("supports uncontrolled single selection and explicit clearing", () => {
    const onChange = vi.fn();
    render(
      <Calendar
        defaultMonth={date(1)}
        defaultValue={date(10)}
        onChange={onChange}
        aria-label="Calendar"
      />
    );

    expect(dayButton(10).getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(dayButton(12));
    expect(dayButton(12).getAttribute("aria-pressed")).toBe("true");
    expect(nativeDateAdapter.getParts(onChange.mock.calls[0]![0] as Date).day).toBe(12);
    expect(onChange.mock.calls[0]![1]).toMatchObject({ complete: true, reason: "select" });

    fireEvent.click(dayButton(12));
    expect(onChange.mock.calls[1]![0]).toBeNull();
    expect(onChange.mock.calls[1]![1]).toMatchObject({ reason: "clear" });
  });

  it("toggles multiple values in chronological order", () => {
    const onChange = vi.fn();
    render(
      <Calendar
        selectionMode="multiple"
        defaultMonth={date(1)}
        defaultValue={[date(12)]}
        onChange={onChange}
        aria-label="Calendar"
      />
    );

    fireEvent.click(dayButton(8));
    const added = onChange.mock.calls[0]![0] as ReadonlyArray<Date>;
    expect(added.map((value) => nativeDateAdapter.getParts(value).day)).toEqual([8, 12]);
    expect(dayButton(8).getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(dayButton(12));
    const removed = onChange.mock.calls[1]![0] as ReadonlyArray<Date>;
    expect(removed.map((value) => nativeDateAdapter.getParts(value).day)).toEqual([8]);
  });

  it("reports an intermediate same-day range before completing a sorted range", () => {
    const onChange = vi.fn();
    render(
      <Calendar
        selectionMode="range"
        defaultMonth={date(1)}
        onChange={onChange}
        aria-label="Calendar"
      />
    );

    fireEvent.click(dayButton(12));
    const intermediate = onChange.mock.calls[0]![0] as readonly [Date, Date];
    expect(intermediate.map((value) => nativeDateAdapter.getParts(value).day)).toEqual([12, 12]);
    expect(onChange.mock.calls[0]![1]).toMatchObject({ complete: false });

    fireEvent.click(dayButton(8));
    const complete = onChange.mock.calls[1]![0] as readonly [Date, Date];
    expect(complete.map((value) => nativeDateAdapter.getParts(value).day)).toEqual([8, 12]);
    expect(onChange.mock.calls[1]![1]).toMatchObject({ complete: true });
    expect(dayButton(8).getAttribute("data-range-start")).toBe("true");
    expect(dayButton(10).getAttribute("aria-pressed")).toBe("true");
    expect(dayButton(10).closest('[role="gridcell"]')!.getAttribute("aria-selected")).toBe("true");
    expect(dayButton(12).getAttribute("data-range-end")).toBe("true");
  });

  it("applies bounds and disabledDate to dates and month navigation", () => {
    render(
      <Calendar
        defaultMonth={date(1)}
        min={date(5)}
        max={date(25)}
        disabledDate={(value) => nativeDateAdapter.getDayOfWeek(value) === 0}
        aria-label="Calendar"
      />
    );

    expect(dayButton(4).hasAttribute("disabled")).toBe(true);
    expect(dayButton(10).hasAttribute("disabled")).toBe(false);
    expect(dayButton(23).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: "上个月" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: "下个月" }).hasAttribute("disabled")).toBe(true);
  });

  it("keeps a controlled month stable while reporting navigation intent", () => {
    const onMonthChange = vi.fn();
    const { rerender } = render(
      <Calendar month={date(1)} onMonthChange={onMonthChange} aria-label="Calendar" />
    );

    fireEvent.click(screen.getByRole("button", { name: "下个月" }));
    expect(screen.getByText("2026年8月")).toBeTruthy();
    expect(nativeDateAdapter.getParts(onMonthChange.mock.calls[0]![0] as Date).month).toBe(9);
    expect(onMonthChange.mock.calls[0]![1]).toEqual({ reason: "next-month" });

    rerender(<Calendar month={date(1, 9)} onMonthChange={onMonthChange} aria-label="Calendar" />);
    expect(screen.getByText("2026年9月")).toBeTruthy();
  });

  it("focuses today imperatively in the current or a newly accepted month", () => {
    const ref = createRef<CalendarRef<Date>>();
    const onMonthChange = vi.fn();
    const adapter = { ...nativeDateAdapter, now: () => date(10, 9) };
    const { rerender } = render(
      <Calendar
        ref={ref}
        adapter={adapter}
        month={date(1)}
        defaultValue={date(5)}
        disabledDate={(_value, details) => details.outside}
        onMonthChange={onMonthChange}
        aria-label="Calendar"
      />
    );

    act(() => dayButton(5).focus());
    act(() => {
      if (ref.current) ref.current.goToToday();
    });
    expect(screen.getByText("2026年8月")).toBeTruthy();
    expect(document.activeElement).toBe(dayButton(5));
    expect(nativeDateAdapter.getParts(onMonthChange.mock.calls[0]![0] as Date)).toMatchObject({
      month: 9,
      year: 2026
    });
    expect(onMonthChange.mock.calls[0]![1]).toEqual({ reason: "today" });

    rerender(
      <Calendar
        ref={ref}
        adapter={adapter}
        month={date(1, 9)}
        defaultValue={date(5)}
        disabledDate={(_value, details) => details.outside}
        onMonthChange={onMonthChange}
        aria-label="Calendar"
      />
    );
    expect(document.activeElement).toBe(dayButton(10, 9));

    act(() => dayButton(8, 9).focus());
    act(() => {
      if (ref.current) ref.current.goToToday();
    });
    expect(document.activeElement).toBe(dayButton(10, 9));
  });

  it("clamps goToToday to the nearest enabled in-bounds day", () => {
    const ref = createRef<CalendarRef<Date>>();
    const adapter = { ...nativeDateAdapter, now: () => date(10) };
    render(
      <Calendar
        ref={ref}
        adapter={adapter}
        defaultMonth={date(1)}
        min={date(12)}
        disabledDate={(value) => nativeDateAdapter.getParts(value).day === 12}
        aria-label="Calendar"
      />
    );

    act(() => {
      if (ref.current) ref.current.goToToday();
    });
    expect(document.activeElement).toBe(dayButton(13));
  });

  it("provides roving keyboard focus across days and months", () => {
    render(<Calendar defaultMonth={date(1)} defaultValue={date(31)} aria-label="Calendar" />);

    const august31 = dayButton(31);
    act(() => august31.focus());
    fireEvent.keyDown(august31, { key: "ArrowRight" });
    expect(screen.getByText("2026年9月")).toBeTruthy();
    expect(document.activeElement).toBe(dayButton(1, 9));

    fireEvent.keyDown(dayButton(1, 9), { key: "PageDown" });
    expect(screen.getByText("2026年10月")).toBeTruthy();
    expect(document.activeElement).toBe(dayButton(1, 10));
  });

  it("maps horizontal keyboard movement to the visual direction in RTL", () => {
    render(
      <ConfigProvider dir="rtl">
        <Calendar defaultMonth={date(1)} defaultValue={date(10)} aria-label="Calendar" />
      </ConfigProvider>
    );

    act(() => dayButton(10).focus());
    fireEvent.keyDown(dayButton(10), { key: "ArrowLeft" });
    expect(document.activeElement).toBe(dayButton(11));
    fireEvent.keyDown(dayButton(11), { key: "ArrowRight" });
    expect(document.activeElement).toBe(dayButton(10));
  });

  it("persists an uncontrolled month after dynamic bounds clamp it", () => {
    const { rerender } = render(
      <Calendar defaultMonth={date(1)} min={date(1, 9)} aria-label="Calendar" />
    );
    expect(screen.getByText("2026年9月")).toBeTruthy();

    rerender(<Calendar defaultMonth={date(1)} aria-label="Calendar" />);
    expect(screen.getByText("2026年9月")).toBeTruthy();
  });

  it("hides outside dates without removing grid cells", () => {
    render(
      <Calendar
        defaultMonth={date(1)}
        showOutsideDays={false}
        fixedWeeks={false}
        aria-label="Calendar"
      />
    );

    const grid = screen.getByRole("grid");
    expect(within(grid).getAllByRole("gridcell")).toHaveLength(42);
    expect(screen.queryByRole("button", { name: /^2026-07-26/ })).toBeNull();
  });
});
