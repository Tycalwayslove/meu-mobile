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

  it("seeds uncontrolled state from the latest controlled range", () => {
    const latest = [date(10), date(16)] as const;
    const { rerender } = render(
      <DateRangePicker
        open
        aria-label="日期范围"
        defaultMonth={date(1)}
        value={[date(5), date(6)]}
      />
    );
    rerender(<DateRangePicker open aria-label="日期范围" defaultMonth={date(1)} value={latest} />);
    expect(dayButton(10).getAttribute("data-range-start")).toBe("true");
    expect(dayButton(16).getAttribute("data-range-end")).toBe("true");

    rerender(<DateRangePicker open aria-label="日期范围" defaultMonth={date(1)} />);
    expect(dayButton(10).getAttribute("data-range-start")).toBe("true");
    expect(dayButton(16).getAttribute("data-range-end")).toBe("true");
  });

  it("rebuilds a controlled draft from the caller value after confirmation and reopening", () => {
    const onConfirm = vi.fn();
    const initial = [date(5), date(6)] as const;
    const requested = [date(10), date(16)] as const;
    const { rerender } = render(
      <DateRangePicker
        open
        aria-label="日期范围"
        defaultMonth={date(1)}
        value={initial}
        onConfirm={onConfirm}
      />
    );

    fireEvent.click(dayButton(10));
    fireEvent.click(dayButton(16));
    fireEvent.click(screen.getByRole("button", { name: "确定" }));

    expect(rangeDays(onConfirm.mock.calls[0]![0] as readonly [Date, Date])).toEqual([10, 16]);
    rerender(
      <DateRangePicker
        open={false}
        aria-label="日期范围"
        defaultMonth={date(1)}
        value={initial}
        onConfirm={onConfirm}
      />
    );
    rerender(
      <DateRangePicker
        open
        aria-label="日期范围"
        defaultMonth={date(1)}
        value={initial}
        onConfirm={onConfirm}
      />
    );
    expect(dayButton(5).getAttribute("data-range-start")).toBe("true");
    expect(dayButton(6).getAttribute("data-range-end")).toBe("true");

    rerender(
      <DateRangePicker
        open
        aria-label="日期范围"
        defaultMonth={date(1)}
        value={requested}
        onConfirm={onConfirm}
      />
    );
    expect(dayButton(10).getAttribute("data-range-start")).toBe("true");
    expect(dayButton(16).getAttribute("data-range-end")).toBe("true");
  });

  it("revalidates a complete draft when bounds or disabled-date rules change", () => {
    const selected = [date(10), date(16)] as const;
    const baseProps = {
      "aria-label": "日期范围",
      defaultMonth: date(1),
      open: true,
      value: selected
    } as const;
    const { rerender } = render(<DateRangePicker {...baseProps} max={date(31)} />);
    const confirm = screen.getByRole("button", { name: "确定" });
    expect(confirm.hasAttribute("disabled")).toBe(false);

    rerender(<DateRangePicker {...baseProps} max={date(15)} />);
    expect(confirm.hasAttribute("disabled")).toBe(true);

    rerender(
      <DateRangePicker
        {...baseProps}
        max={date(31)}
        disabledDate={(candidate) => nativeDateAdapter.getParts(candidate).day === 10}
      />
    );
    expect(confirm.hasAttribute("disabled")).toBe(true);

    rerender(<DateRangePicker {...baseProps} max={date(31)} />);
    expect(confirm.hasAttribute("disabled")).toBe(false);
  });

  it("allows a range to cross disabled intermediate days while rejecting disabled endpoints", () => {
    const onConfirm = vi.fn();
    render(
      <DateRangePicker
        open
        aria-label="日期范围"
        defaultMonth={date(1)}
        disabledDate={(candidate) => nativeDateAdapter.getParts(candidate).day === 11}
        onConfirm={onConfirm}
      />
    );

    expect(dayButton(11).hasAttribute("disabled")).toBe(true);
    fireEvent.click(dayButton(10));
    fireEvent.click(dayButton(12));
    const confirm = screen.getByRole("button", { name: "确定" });
    expect(confirm.hasAttribute("disabled")).toBe(false);
    fireEvent.click(confirm);
    expect(rangeDays(onConfirm.mock.calls[0]![0] as readonly [Date, Date])).toEqual([10, 12]);
  });

  it("keeps the draft anchor while navigating to a second month", () => {
    const onConfirm = vi.fn();
    render(
      <DateRangePicker
        open
        aria-label="日期范围"
        defaultMonth={date(1)}
        min={date(28)}
        max={date(5, 9)}
        onConfirm={onConfirm}
      />
    );

    fireEvent.click(dayButton(30));
    expect(screen.getByRole("button", { name: "确定" }).hasAttribute("disabled")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "下个月" }));
    fireEvent.click(dayButton(2, 9));

    const confirm = screen.getByRole("button", { name: "确定" });
    expect(confirm.hasAttribute("disabled")).toBe(false);
    fireEvent.click(confirm);
    const confirmed = onConfirm.mock.calls[0]![0] as readonly [Date, Date];
    expect(
      confirmed.map((candidate) => {
        const parts = nativeDateAdapter.getParts(candidate);
        return [parts.month, parts.day];
      })
    ).toEqual([
      [8, 30],
      [9, 2]
    ]);
  });
});
