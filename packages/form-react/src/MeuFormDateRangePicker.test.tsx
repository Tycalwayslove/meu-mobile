// @vitest-environment jsdom
import { createDateParts, nativeDateAdapter } from "@meu/date-adapter";
import { Button } from "@meu/mobile";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MeuForm } from "./MeuForm";
import { MeuFormDateRangePicker } from "./MeuFormDateRangePicker";
import { useMeuForm } from "./useMeuForm";

function date(day: number) {
  return nativeDateAdapter.fromParts(createDateParts({ day, month: 8, year: 2026 }))!;
}

function dayButton(day: number) {
  return screen.getByRole("button", {
    name: new RegExp(`^2026-08-${String(day).padStart(2, "0")}`)
  });
}

type Values = { deliveryWindow: readonly [Date, Date] | null };

afterEach(cleanup);

function DateRangePickerForm({ onSubmit }: { onSubmit: (values: Values) => void }) {
  const form = useMeuForm<Values>({ defaultValues: { deliveryWindow: null } });

  return (
    <MeuForm form={form} onSubmit={onSubmit}>
      <MeuFormDateRangePicker<Values>
        name="deliveryWindow"
        label="送达区间"
        description="确定后才写入表单"
        defaultMonth={date(1)}
        min={date(1)}
        max={date(31)}
        required
        rules={{ validate: (value) => (value && value.length === 2) || "请选择送达区间" }}
        triggerProps={{ placeholder: "请选择日期范围" }}
      />
      <output data-testid="dirty">{form.formState.isDirty ? "dirty" : "pristine"}</output>
      <Button type="submit">提交订单</Button>
    </MeuForm>
  );
}

describe("MeuFormDateRangePicker", () => {
  it("keeps cancelled drafts pristine and commits a confirmed range", async () => {
    const onSubmit = vi.fn();
    render(<DateRangePickerForm onSubmit={onSubmit} />);

    const trigger = screen.getByRole("button", { name: "送达区间" });
    expect(trigger.textContent).toContain("请选择日期范围");
    fireEvent.click(trigger);
    fireEvent.click(dayButton(12));
    fireEvent.click(dayButton(15));
    fireEvent.click(screen.getByRole("button", { name: "取消" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(trigger.textContent).toContain("请选择日期范围");
    expect(screen.getByTestId("dirty").textContent).toBe("pristine");

    fireEvent.click(trigger);
    fireEvent.click(dayButton(12));
    fireEvent.click(dayButton(15));
    fireEvent.click(screen.getByRole("button", { name: "确定" }));
    await waitFor(() => expect(trigger.textContent).toContain("2026-08-12 – 2026-08-15"));
    expect(screen.getByTestId("dirty").textContent).toBe("dirty");

    fireEvent.click(screen.getByRole("button", { name: "提交订单" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const submitted = onSubmit.mock.calls[0]![0] as Values;
    expect(submitted.deliveryWindow!.map((value) => nativeDateAdapter.getParts(value).day)).toEqual(
      [12, 15]
    );
  });

  it("associates validation feedback and focuses the native trigger", async () => {
    render(<DateRangePickerForm onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "提交订单" }));

    const alert = await screen.findByRole("alert");
    const trigger = screen.getByRole("button", { name: "送达区间" });
    expect(alert.textContent).toBe("请选择送达区间");
    expect(trigger.getAttribute("data-invalid")).toBe("true");
    expect(trigger.getAttribute("aria-describedby")).toContain("error");
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });
});
