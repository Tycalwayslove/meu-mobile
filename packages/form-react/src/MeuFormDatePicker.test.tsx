// @vitest-environment jsdom
import { createDateParts, nativeDateAdapter } from "@meu/date-adapter";
import { Button } from "@meu/mobile";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MeuForm } from "./MeuForm";
import { MeuFormDatePicker } from "./MeuFormDatePicker";
import { useMeuForm } from "./useMeuForm";

function date(parts: Parameters<typeof createDateParts>[0]) {
  return nativeDateAdapter.fromParts(createDateParts(parts))!;
}

type Values = { deliveryDate: Date | null };

afterEach(cleanup);

function DatePickerForm({
  initialValue = null,
  onSubmit
}: {
  initialValue?: Date | null;
  onSubmit: (values: Values) => void;
}) {
  const form = useMeuForm<Values>({ defaultValues: { deliveryDate: initialValue } });

  return (
    <MeuForm form={form} onSubmit={onSubmit}>
      <MeuFormDatePicker<Values>
        name="deliveryDate"
        label="送达日期"
        description="选择预计送达日期"
        min={date({ day: 1, month: 8, year: 2026 })}
        max={date({ day: 31, month: 8, year: 2026 })}
        required
        rules={{ validate: (value) => value instanceof Date || "请选择送达日期" }}
        triggerProps={{ placeholder: "请选择日期" }}
      />
      <output data-testid="dirty">{form.formState.isDirty ? "dirty" : "pristine"}</output>
      <Button type="submit">提交订单</Button>
    </MeuForm>
  );
}

describe("MeuFormDatePicker", () => {
  it("keeps cancelled drafts pristine and commits a confirmed Date", async () => {
    const onSubmit = vi.fn();
    render(
      <DatePickerForm initialValue={date({ day: 28, month: 8, year: 2026 })} onSubmit={onSubmit} />
    );

    const trigger = screen.getByRole("button", { name: "送达日期" });
    expect(trigger.textContent).toContain("2026-08-28");
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("option", { name: "29日" }));
    fireEvent.click(screen.getByRole("button", { name: "取消" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(trigger.textContent).toContain("2026-08-28");
    expect(screen.getByTestId("dirty").textContent).toBe("pristine");

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("option", { name: "29日" }));
    fireEvent.click(screen.getByRole("button", { name: "确定" }));
    await waitFor(() => expect(trigger.textContent).toContain("2026-08-29"));
    expect(screen.getByTestId("dirty").textContent).toBe("dirty");

    fireEvent.click(screen.getByRole("button", { name: "提交订单" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const submitted = onSubmit.mock.calls[0]![0] as Values;
    expect(nativeDateAdapter.getParts(submitted.deliveryDate!)).toMatchObject({
      day: 29,
      month: 8,
      year: 2026
    });
  });

  it("associates validation feedback and focuses the native trigger", async () => {
    render(<DatePickerForm onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "提交订单" }));

    const alert = await screen.findByRole("alert");
    const trigger = screen.getByRole("button", { name: "送达日期" });
    expect(alert.textContent).toBe("请选择送达日期");
    expect(trigger.getAttribute("data-invalid")).toBe("true");
    expect(trigger.getAttribute("aria-describedby")).toContain("error");
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });
});
