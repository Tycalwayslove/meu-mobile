// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { TimePicker } from "./TimePicker";
import { formatTimeValue } from "./resolveTimePicker";

describe("TimePicker", () => {
  it("renders named time columns and normalizes hidden seconds", () => {
    const onConfirm = vi.fn();
    render(
      <TimePicker
        open
        title="送达时间"
        defaultValue={{ hour: 9, minute: 30, second: 45 }}
        onConfirm={onConfirm}
      />
    );

    const dialog = screen.getByRole("dialog", { name: "送达时间" });
    const wheels = within(dialog).getAllByRole("listbox");
    expect(wheels.map((wheel) => wheel.getAttribute("aria-label"))).toEqual(["时", "分"]);
    expect(
      within(wheels[0]!).getByRole("option", { name: "09时" }).getAttribute("aria-selected")
    ).toBe("true");
    expect(
      within(wheels[1]!).getByRole("option", { name: "30分" }).getAttribute("aria-selected")
    ).toBe("true");

    fireEvent.click(within(dialog).getByRole("button", { name: "确定" }));
    expect(onConfirm).toHaveBeenCalledWith({ hour: 9, minute: 30, second: 0 });
    expect(document.body.querySelector('[data-meu-component="time-picker"]')).toBeTruthy();
  });

  it("applies precision-aware bounds, steps and contextual filters", () => {
    render(
      <TimePicker
        open
        aria-label="预约时间"
        defaultValue={{ hour: 9, minute: 20, second: 0 }}
        min={{ hour: 9, minute: 20, second: 0 }}
        max={{ hour: 10, minute: 35, second: 0 }}
        minuteStep={15}
        filter={{
          minute: (value, details) => !details.time || details.time.hour !== 10 || value !== 15
        }}
      />
    );

    const hourWheel = screen.getByRole("listbox", { name: "时" });
    expect(
      within(hourWheel).getByRole("option", { name: "08时" }).getAttribute("aria-disabled")
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

    fireEvent.click(within(hourWheel).getByRole("option", { name: "10时" }));
    expect(
      within(minuteWheel).getByRole("option", { name: "15分" }).getAttribute("aria-disabled")
    ).toBe("true");
  });

  it("maps a twelve-hour period column back to canonical hours", () => {
    const onConfirm = vi.fn();
    render(
      <ConfigProvider locale="en-US">
        <TimePicker
          open
          aria-label="Time"
          hourCycle="h12"
          defaultValue={{ hour: 13, minute: 20, second: 0 }}
          onConfirm={onConfirm}
        />
      </ConfigProvider>
    );

    expect(screen.getAllByRole("listbox")).toHaveLength(3);
    const hourWheel = screen.getByRole("listbox", { name: "Hour" });
    const periodWheel = screen.getByRole("listbox", { name: "Period" });
    expect(
      within(hourWheel).getByRole("option", { name: "01" }).getAttribute("aria-selected")
    ).toBe("true");
    expect(
      within(periodWheel).getByRole("option", { name: "PM" }).getAttribute("aria-selected")
    ).toBe("true");
    fireEvent.click(within(periodWheel).getByRole("option", { name: "AM" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onConfirm).toHaveBeenCalledWith({ hour: 1, minute: 20, second: 0 });
  });

  it("supports second precision and custom labels", () => {
    render(
      <TimePicker
        open
        aria-label="精确时间"
        precision="second"
        secondStep={10}
        defaultValue={{ hour: 8, minute: 5, second: 20 }}
        renderLabel={(column, value) => (column === "second" ? `S${value}` : value)}
      />
    );

    expect(screen.getAllByRole("listbox")).toHaveLength(3);
    expect(screen.getByRole("option", { name: "S20" }).getAttribute("aria-selected")).toBe("true");
  });

  it("normalizes hidden minute and second fields at hour precision", () => {
    const onConfirm = vi.fn();
    render(
      <TimePicker
        open
        aria-label="整点时间"
        precision="hour"
        defaultValue={{ hour: 12, minute: 34, second: 56 }}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getAllByRole("listbox")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "确定" }));
    expect(onConfirm).toHaveBeenCalledWith({ hour: 12, minute: 0, second: 0 });
  });

  it("discards cancelled drafts and commits only on confirm", async () => {
    const onConfirm = vi.fn();

    function Example() {
      const [open, setOpen] = useState(true);
      const triggerRef = useRef<HTMLButtonElement>(null);
      return (
        <>
          <button ref={triggerRef} type="button" onClick={() => setOpen(true)}>
            选择时间
          </button>
          <TimePicker
            open={open}
            title="时间"
            defaultValue={{ hour: 10, minute: 30, second: 0 }}
            minuteStep={15}
            returnFocusRef={triggerRef}
            onConfirm={onConfirm}
            onOpenChange={setOpen}
          />
        </>
      );
    }

    render(<Example />);
    fireEvent.click(screen.getByRole("option", { name: "45分" }));
    fireEvent.click(screen.getByRole("button", { name: "取消" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(onConfirm).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "选择时间" }));
    expect(screen.getByRole("option", { name: "30分" }).getAttribute("aria-selected")).toBe("true");
    fireEvent.click(screen.getByRole("option", { name: "45分" }));
    fireEvent.click(screen.getByRole("button", { name: "确定" }));
    expect(onConfirm).toHaveBeenCalledWith({ hour: 10, minute: 45, second: 0 });
  });

  it("reports controlled confirm intent without mutating external state", () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <TimePicker
        open
        aria-label="时间"
        minuteStep={15}
        value={{ hour: 10, minute: 30, second: 0 }}
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
      />
    );

    fireEvent.click(screen.getByRole("option", { name: "45分" }));
    fireEvent.click(screen.getByRole("button", { name: "确定" }));
    expect(onConfirm).toHaveBeenCalledWith({ hour: 10, minute: 45, second: 0 });
    expect(onOpenChange).toHaveBeenLastCalledWith(false, { reason: "confirm" });
    expect(screen.getByRole("dialog", { name: "时间" })).toBeTruthy();
  });

  it("seeds uncontrolled state from the latest controlled value", () => {
    const { rerender } = render(
      <TimePicker
        open
        aria-label="时间"
        minuteStep={15}
        value={{ hour: 10, minute: 30, second: 0 }}
      />
    );
    rerender(
      <TimePicker
        open
        aria-label="时间"
        minuteStep={15}
        value={{ hour: 10, minute: 45, second: 0 }}
      />
    );
    expect(screen.getByRole("option", { name: "45分" }).getAttribute("aria-selected")).toBe("true");

    rerender(<TimePicker open aria-label="时间" minuteStep={15} />);
    expect(screen.getByRole("option", { name: "45分" }).getAttribute("aria-selected")).toBe("true");
  });

  it("treats defaultValue as initialization rather than a live input", () => {
    const { rerender } = render(
      <TimePicker open aria-label="时间" defaultValue={{ hour: 10, minute: 30, second: 0 }} />
    );

    rerender(
      <TimePicker open aria-label="时间" defaultValue={{ hour: 11, minute: 45, second: 0 }} />
    );
    expect(screen.getByRole("option", { name: "10时" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("option", { name: "30分" }).getAttribute("aria-selected")).toBe("true");
  });

  it("disables confirmation for contradictory bounds", () => {
    render(
      <TimePicker
        open
        aria-label="时间"
        min={{ hour: 18, minute: 0, second: 0 }}
        max={{ hour: 9, minute: 0, second: 0 }}
      />
    );

    expect(screen.getByRole<HTMLButtonElement>("button", { name: "确定" }).disabled).toBe(true);
  });

  it("formats canonical values for both hour cycles", () => {
    const value = { hour: 13, minute: 5, second: 9 };
    expect(formatTimeValue(value)).toBe("13:05");
    expect(formatTimeValue(value, { hourCycle: "h12", locale: "en-US", precision: "second" })).toBe(
      "01:05:09 PM"
    );
    expect(formatTimeValue(value, { hourCycle: "h12", locale: "zh-CN" })).toBe("下午 01:05");
  });
});
