// @vitest-environment jsdom
import { createDateParts, nativeDateAdapter } from "@meu/date-adapter";
import type { DateAdapter } from "@meu/date-adapter";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { DatePicker } from "./DatePicker";
import { resolveDatePickerBounds } from "./resolveDatePicker";

function date(parts: Parameters<typeof createDateParts>[0]) {
  return nativeDateAdapter.fromParts(createDateParts(parts))!;
}

function expectParts(value: Date, parts: Partial<ReturnType<typeof nativeDateAdapter.getParts>>) {
  expect(nativeDateAdapter.getParts(value)).toMatchObject(parts);
}

describe("DatePicker", () => {
  it("preserves valid falsy custom date bounds and nullish adapter results", () => {
    const add = vi.fn(() => 999);
    const adapter = {
      add,
      fromParts: vi.fn(() => 0),
      getParts: () => createDateParts({ year: 2026 }),
      isValid: (value: number) => Number.isFinite(value)
    } as unknown as DateAdapter<number>;

    expect(resolveDatePickerBounds(adapter, 10, 0, 20)).toEqual({ min: 0, max: 20 });
    expect(resolveDatePickerBounds(adapter, 10, undefined, undefined)).toEqual({ min: 0, max: 0 });
    expect(add).not.toHaveBeenCalled();
  });
  it("renders named date columns and normalizes hidden units", () => {
    const onConfirm = vi.fn();
    render(
      <DatePicker
        open
        title="预约日期"
        min={date({ day: 1, month: 1, year: 2024 })}
        max={date({ day: 31, month: 12, year: 2025 })}
        defaultValue={date({ day: 29, hour: 18, minute: 30, month: 2, year: 2024 })}
        onConfirm={onConfirm}
      />
    );

    const dialog = screen.getByRole("dialog", { name: "预约日期" });
    const wheels = within(dialog).getAllByRole("listbox");
    expect(wheels.map((wheel) => wheel.getAttribute("aria-label"))).toEqual(["年", "月", "日"]);
    expect(
      within(wheels[0]!).getByRole("option", { name: "2024年" }).getAttribute("aria-selected")
    ).toBe("true");
    expect(
      within(wheels[1]!).getByRole("option", { name: "2月" }).getAttribute("aria-selected")
    ).toBe("true");
    expect(
      within(wheels[2]!).getByRole("option", { name: "29日" }).getAttribute("aria-selected")
    ).toBe("true");

    fireEvent.click(within(dialog).getByRole("button", { name: "确定" }));
    const confirmed = onConfirm.mock.calls[0]![0] as Date;
    expectParts(confirmed, { day: 29, hour: 0, minute: 0, month: 2, second: 0, year: 2024 });
    expect(document.body.querySelector('[data-meu-component="date-picker"]')).toBeTruthy();
  });

  it("clamps a stale day when the month changes", async () => {
    const onSelect = vi.fn();
    render(
      <DatePicker
        open
        aria-label="日期"
        min={date({ month: 1, year: 2024 })}
        max={date({ day: 31, month: 12, year: 2024 })}
        defaultValue={date({ day: 31, month: 1, year: 2024 })}
        onSelect={onSelect}
      />
    );

    const monthWheel = screen.getByRole("listbox", { name: "月" });
    fireEvent.click(within(monthWheel).getByRole("option", { name: "2月" }));
    const selected = onSelect.mock.calls[0]![0] as Date;
    expectParts(selected, { day: 29, month: 2, year: 2024 });
    expect(onSelect.mock.calls[0]![1]).toEqual({
      columnIndex: 1,
      precision: "month",
      reason: "pointer"
    });
    await waitFor(() =>
      expect(screen.getByRole("option", { name: "29日" }).getAttribute("aria-selected")).toBe(
        "true"
      )
    );
    expect(screen.queryByRole("option", { name: "31日" })).toBeNull();
  });

  it("applies precision-aware bounds, steps and filters", () => {
    render(
      <DatePicker
        open
        aria-label="预约时间"
        precision="minute"
        minuteStep={15}
        min={date({ day: 15, hour: 9, minute: 20, month: 7, year: 2026 })}
        max={date({ day: 16, hour: 10, minute: 35, month: 7, year: 2026 })}
        defaultValue={date({ day: 15, hour: 9, minute: 20, month: 7, year: 2026 })}
        filter={{
          minute: (value) => value !== 45
        }}
      />
    );

    expect(screen.getAllByRole("listbox")).toHaveLength(5);
    const dayWheel = screen.getByRole("listbox", { name: "日" });
    expect(
      within(dayWheel).getByRole("option", { name: "14日" }).getAttribute("aria-disabled")
    ).toBe("true");
    expect(
      within(dayWheel).getByRole("option", { name: "15日" }).getAttribute("aria-selected")
    ).toBe("true");
    const minuteWheel = screen.getByRole("listbox", { name: "分" });
    expect(
      within(minuteWheel)
        .getAllByRole("option")
        .map((option) => option.textContent)
    ).toEqual(["00分", "15分", "30分", "45分"]);
    expect(
      within(minuteWheel).getByRole("option", { name: "00分" }).getAttribute("aria-disabled")
    ).toBe("true");
    expect(
      within(minuteWheel).getByRole("option", { name: "30分" }).getAttribute("aria-selected")
    ).toBe("true");
    expect(
      within(minuteWheel).getByRole("option", { name: "45分" }).getAttribute("aria-disabled")
    ).toBe("true");
  });

  it("rounds a fine-grained minimum up to the next representable hour", () => {
    const onConfirm = vi.fn();
    render(
      <DatePicker
        open
        aria-label="整点预约"
        precision="hour"
        min={date({ day: 15, hour: 9, minute: 30, month: 7, year: 2026 })}
        max={date({ day: 15, hour: 11, minute: 45, month: 7, year: 2026 })}
        defaultValue={date({ day: 15, hour: 9, minute: 30, month: 7, year: 2026 })}
        onConfirm={onConfirm}
      />
    );

    const hourWheel = screen.getByRole("listbox", { name: "时" });
    expect(
      within(hourWheel).getByRole("option", { name: "09时" }).getAttribute("aria-disabled")
    ).toBe("true");
    expect(
      within(hourWheel).getByRole("option", { name: "10时" }).getAttribute("aria-selected")
    ).toBe("true");

    fireEvent.click(screen.getByRole("button", { name: "确定" }));
    expectParts(onConfirm.mock.calls[0]![0] as Date, {
      day: 15,
      hour: 10,
      minute: 0,
      month: 7,
      second: 0,
      year: 2026
    });
  });

  it("rounds minute bounds to the step grid and disables an empty grid", () => {
    const min = date({
      day: 15,
      hour: 9,
      minute: 20,
      month: 7,
      second: 30,
      year: 2026
    });
    const { rerender } = render(
      <DatePicker
        open
        aria-label="步长预约"
        precision="minute"
        minuteStep={15}
        min={min}
        max={date({
          day: 15,
          hour: 9,
          minute: 44,
          month: 7,
          second: 59,
          year: 2026
        })}
        defaultValue={min}
      />
    );

    const minuteWheel = screen.getByRole("listbox", { name: "分" });
    expect(
      within(minuteWheel).getByRole("option", { name: "15分" }).getAttribute("aria-disabled")
    ).toBe("true");
    expect(
      within(minuteWheel).getByRole("option", { name: "30分" }).getAttribute("aria-selected")
    ).toBe("true");
    expect(
      within(minuteWheel).getByRole("option", { name: "45分" }).getAttribute("aria-disabled")
    ).toBe("true");

    rerender(
      <DatePicker
        open
        aria-label="步长预约"
        precision="minute"
        minuteStep={15}
        min={date({
          day: 15,
          hour: 9,
          minute: 59,
          month: 7,
          second: 30,
          year: 2026
        })}
        max={date({ day: 15, hour: 10, minute: 10, month: 7, year: 2026 })}
        defaultValue={min}
      />
    );
    expect(screen.getByRole("option", { name: "10时" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("option", { name: "00分" }).getAttribute("aria-selected")).toBe("true");

    rerender(
      <DatePicker
        open
        aria-label="步长预约"
        precision="minute"
        minuteStep={15}
        min={date({ day: 15, hour: 9, minute: 31, month: 7, year: 2026 })}
        max={date({
          day: 15,
          hour: 9,
          minute: 44,
          month: 7,
          second: 59,
          year: 2026
        })}
        defaultValue={min}
      />
    );
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "确定" }).disabled).toBe(true);
  });

  it("supports localized column names and custom labels", () => {
    render(
      <ConfigProvider locale="en-US">
        <DatePicker
          open
          aria-label="Date"
          precision="month"
          min={date({ year: 2026 })}
          max={date({ day: 31, month: 12, year: 2026 })}
          defaultValue={date({ month: 8, year: 2026 })}
          renderLabel={(type, value) => (type === "month" ? `Month ${value}` : value)}
        />
      </ConfigProvider>
    );

    expect(screen.getByRole("listbox", { name: "Year" })).toBeTruthy();
    expect(screen.getByRole("listbox", { name: "Month" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "Month 8" }).getAttribute("aria-selected")).toBe(
      "true"
    );
  });

  it("discards cancelled drafts and commits only on confirm", async () => {
    const onConfirm = vi.fn();

    function Example() {
      const [open, setOpen] = useState(true);
      const triggerRef = useRef<HTMLButtonElement>(null);
      return (
        <>
          <button ref={triggerRef} type="button" onClick={() => setOpen(true)}>
            选择日期
          </button>
          <DatePicker
            open={open}
            title="日期"
            min={date({ year: 2026 })}
            max={date({ day: 31, month: 12, year: 2026 })}
            defaultValue={date({ day: 28, month: 8, year: 2026 })}
            returnFocusRef={triggerRef}
            onConfirm={onConfirm}
            onOpenChange={setOpen}
          />
        </>
      );
    }

    render(<Example />);
    fireEvent.click(screen.getByRole("option", { name: "29日" }));
    fireEvent.click(screen.getByRole("button", { name: "取消" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(onConfirm).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "选择日期" }));
    expect(screen.getByRole("option", { name: "28日" }).getAttribute("aria-selected")).toBe("true");
    fireEvent.click(screen.getByRole("option", { name: "29日" }));
    fireEvent.click(screen.getByRole("button", { name: "确定" }));
    expectParts(onConfirm.mock.calls[0]![0] as Date, { day: 29, month: 8, year: 2026 });
  });

  it("reports controlled confirm intent without mutating external state", () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <DatePicker
        open
        aria-label="日期"
        min={date({ year: 2026 })}
        max={date({ day: 31, month: 12, year: 2026 })}
        value={date({ day: 28, month: 8, year: 2026 })}
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
      />
    );

    fireEvent.click(screen.getByRole("option", { name: "29日" }));
    fireEvent.click(screen.getByRole("button", { name: "确定" }));
    expectParts(onConfirm.mock.calls[0]![0] as Date, { day: 29, month: 8, year: 2026 });
    expect(onOpenChange).toHaveBeenLastCalledWith(false, { reason: "confirm" });
    expect(screen.getByRole("dialog", { name: "日期" })).toBeTruthy();
  });

  it("seeds uncontrolled state from the latest controlled value", () => {
    const min = date({ year: 2026 });
    const max = date({ day: 31, month: 12, year: 2026 });
    const initial = date({ day: 28, month: 8, year: 2026 });
    const controlled = date({ day: 29, month: 8, year: 2026 });
    const { rerender } = render(
      <DatePicker open aria-label="日期" min={min} max={max} value={initial} />
    );
    rerender(<DatePicker open aria-label="日期" min={min} max={max} value={controlled} />);
    expect(screen.getByRole("option", { name: "29日" }).getAttribute("aria-selected")).toBe("true");

    rerender(<DatePicker open aria-label="日期" min={min} max={max} />);
    expect(screen.getByRole("option", { name: "29日" }).getAttribute("aria-selected")).toBe("true");
  });

  it("treats defaultValue as initialization rather than a live input", () => {
    const min = date({ year: 2026 });
    const max = date({ day: 31, month: 12, year: 2026 });
    const { rerender } = render(
      <DatePicker
        open
        aria-label="日期"
        min={min}
        max={max}
        defaultValue={date({ day: 28, month: 8, year: 2026 })}
      />
    );

    rerender(
      <DatePicker
        open
        aria-label="日期"
        min={min}
        max={max}
        defaultValue={date({ day: 29, month: 8, year: 2026 })}
      />
    );
    expect(screen.getByRole("option", { name: "28日" }).getAttribute("aria-selected")).toBe("true");
  });

  it("preserves an uncontrolled committed value when the adapter identity changes", async () => {
    const firstAdapter = { ...nativeDateAdapter };
    const secondAdapter = { ...nativeDateAdapter };

    function Example() {
      const [adapter, setAdapter] = useState(firstAdapter);
      const [open, setOpen] = useState(true);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            选择日期
          </button>
          <button type="button" onClick={() => setAdapter(secondAdapter)}>
            切换适配器
          </button>
          <DatePicker
            adapter={adapter}
            open={open}
            aria-label="日期"
            min={date({ year: 2026 })}
            max={date({ day: 31, month: 12, year: 2026 })}
            defaultValue={date({ day: 28, month: 8, year: 2026 })}
            onOpenChange={setOpen}
          />
        </>
      );
    }

    render(<Example />);
    fireEvent.click(screen.getByRole("option", { name: "29日" }));
    fireEvent.click(screen.getByRole("button", { name: "确定" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    fireEvent.click(screen.getByRole("button", { name: "切换适配器" }));
    fireEvent.click(screen.getByRole("button", { name: "选择日期" }));
    expect(screen.getByRole("option", { name: "29日" }).getAttribute("aria-selected")).toBe("true");
  });

  it("disables confirmation for contradictory bounds", () => {
    render(
      <DatePicker
        open
        aria-label="日期"
        min={date({ year: 2027 })}
        max={date({ day: 31, month: 12, year: 2026 })}
      />
    );

    expect(screen.getByRole<HTMLButtonElement>("button", { name: "确定" }).disabled).toBe(true);
  });
});
