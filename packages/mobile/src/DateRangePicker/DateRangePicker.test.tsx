// @vitest-environment jsdom
import { createDateParts, nativeDateAdapter } from "@meu/date-adapter";
import type { DateAdapter } from "@meu/date-adapter";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useRef, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DateRangePicker } from "./DateRangePicker";
import { normalizeDateRange } from "./resolveDateRangePicker";

function date(day: number, month = 8, year = 2026) {
  return nativeDateAdapter.fromParts(createDateParts({ day, month, year }))!;
}

function dayButton(day: number, month = 8, year = 2026) {
  const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return screen.getByRole("button", { name: new RegExp(`^${key}`) });
}

function rangeDays(value: readonly [Date, Date]) {
  return value.map((item) => nativeDateAdapter.getParts(item).day);
}

afterEach(cleanup);

describe("DateRangePicker", () => {
  it("normalizes reversed ranges without dropping falsy custom date values", () => {
    const adapter = {
      compare: (left: number, right: number) => left - right,
      isValid: (value: number) => Number.isFinite(value),
      startOf: (value: number) => value
    } as unknown as DateAdapter<number>;

    expect(normalizeDateRange(adapter, [1, 0])).toEqual([0, 1]);
  });

  it("requires two calendar selections before confirming a sorted range", () => {
    const onConfirm = vi.fn();
    const onSelect = vi.fn();
    render(
      <DateRangePicker
        open
        title="配送日期"
        defaultMonth={date(1)}
        min={date(1)}
        max={date(31)}
        onConfirm={onConfirm}
        onSelect={onSelect}
      />
    );

    const dialog = screen.getByRole("dialog", { name: "配送日期" });
    const confirm = within(dialog).getByRole("button", { name: "确定" });
    expect(confirm.hasAttribute("disabled")).toBe(true);

    fireEvent.click(dayButton(12));
    expect(confirm.hasAttribute("disabled")).toBe(true);
    expect(onSelect.mock.calls[0]![1]).toMatchObject({ complete: false, reason: "calendar" });
    expect(within(dialog).getByText(/2026-08-12.*请选择结束日期/)).toBeTruthy();

    fireEvent.click(dayButton(8));
    expect(confirm.hasAttribute("disabled")).toBe(false);
    expect(onSelect.mock.calls[1]![1]).toMatchObject({ complete: true, reason: "calendar" });
    fireEvent.click(confirm);

    expect(rangeDays(onConfirm.mock.calls[0]![0] as readonly [Date, Date])).toEqual([8, 12]);
  });

  it("treats the same day as complete only after the second selection", () => {
    const onConfirm = vi.fn();
    render(
      <DateRangePicker open aria-label="日期范围" defaultMonth={date(1)} onConfirm={onConfirm} />
    );

    const confirm = screen.getByRole("button", { name: "确定" });
    fireEvent.click(dayButton(12));
    expect(confirm.hasAttribute("disabled")).toBe(true);
    fireEvent.click(dayButton(12));
    expect(confirm.hasAttribute("disabled")).toBe(false);
    fireEvent.click(confirm);
    expect(rangeDays(onConfirm.mock.calls[0]![0] as readonly [Date, Date])).toEqual([12, 12]);
  });

  it("rolls a cancelled draft back to the last committed range", async () => {
    function Example() {
      const [open, setOpen] = useState(true);
      const triggerRef = useRef<HTMLButtonElement>(null);
      return (
        <>
          <button ref={triggerRef} type="button" onClick={() => setOpen(true)}>
            选择范围
          </button>
          <DateRangePicker
            open={open}
            title="配送日期"
            defaultMonth={date(1)}
            defaultValue={[date(5), date(6)]}
            returnFocusRef={triggerRef}
            onOpenChange={setOpen}
          />
        </>
      );
    }

    render(<Example />);
    fireEvent.click(dayButton(12));
    expect(screen.getByRole("button", { name: "确定" }).hasAttribute("disabled")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "取消" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    fireEvent.click(screen.getByRole("button", { name: "选择范围" }));
    expect(dayButton(5).getAttribute("data-range-start")).toBe("true");
    expect(dayButton(6).getAttribute("data-range-end")).toBe("true");
  });

  it("applies a selectable preset as a draft and commits only on confirm", () => {
    const onConfirm = vi.fn();
    const onSelect = vi.fn();
    render(
      <DateRangePicker
        open
        aria-label="日期范围"
        defaultMonth={date(1)}
        presets={[
          { key: "week", label: "本周", value: [date(10), date(16)] },
          { key: "future", label: "超出范围", value: [date(30), date(31)] }
        ]}
        max={date(20)}
        onConfirm={onConfirm}
        onSelect={onSelect}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "本周" }));
    expect(onSelect).toHaveBeenLastCalledWith(expect.any(Array), {
      complete: true,
      presetKey: "week",
      reason: "preset"
    });
    expect(onConfirm).not.toHaveBeenCalled();
    expect(dayButton(10).getAttribute("data-range-start")).toBe("true");
    expect(dayButton(16).getAttribute("data-range-end")).toBe("true");
    expect(screen.getByRole("button", { name: "超出范围" }).hasAttribute("disabled")).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "确定" }));
    expect(rangeDays(onConfirm.mock.calls[0]![0] as readonly [Date, Date])).toEqual([10, 16]);
  });

  it("reports escape as cancellation and preserves controlled visibility", async () => {
    const onCancel = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <DateRangePicker
        open
        aria-label="日期范围"
        defaultMonth={date(1)}
        onCancel={onCancel}
        onOpenChange={onOpenChange}
      />
    );

    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "取消" }))
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledWith({ reason: "escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: "escape" });
    expect(screen.getByRole("dialog", { name: "日期范围" })).toBeTruthy();
  });
});
