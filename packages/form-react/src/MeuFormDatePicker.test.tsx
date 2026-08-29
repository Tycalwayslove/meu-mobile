// @vitest-environment jsdom
import { createDateParts, nativeDateAdapter } from "@meu/date-adapter";
import { Button } from "@meu/mobile";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MeuForm } from "./MeuForm";
import { MeuFormDatePicker } from "./MeuFormDatePicker";
import type { MeuFormDatePickerProps } from "./MeuFormDatePicker";
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
      <output data-testid="date-touched">
        {form.formState.touchedFields.deliveryDate ? "touched" : "untouched"}
      </output>
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
    const formElement = trigger.closest("form")!;
    expect(trigger.textContent).toContain("2026-08-28");
    expect(new FormData(formElement).get("deliveryDate")).toBe("2026-08-28");
    fireEvent.click(trigger);
    expect(screen.getByTestId("date-touched").textContent).toBe("untouched");
    fireEvent.click(screen.getByRole("option", { name: "29日" }));
    fireEvent.click(screen.getByRole("button", { name: "取消" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(trigger.textContent).toContain("2026-08-28");
    expect(screen.getByTestId("dirty").textContent).toBe("pristine");
    expect(screen.getByTestId("date-touched").textContent).toBe("touched");

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("option", { name: "29日" }));
    fireEvent.click(screen.getByRole("button", { name: "确定" }));
    await waitFor(() => expect(trigger.textContent).toContain("2026-08-29"));
    expect(screen.getByTestId("dirty").textContent).toBe("dirty");
    expect(screen.getByTestId("date-touched").textContent).toBe("touched");
    expect(new FormData(formElement).get("deliveryDate")).toBe("2026-08-29");

    fireEvent.click(screen.getByRole("button", { name: "提交订单" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const submitted = onSubmit.mock.calls[0]![0] as Values;
    expect(nativeDateAdapter.getParts(submitted.deliveryDate!)).toMatchObject({
      day: 29,
      month: 8,
      year: 2026
    });
  });

  it("keeps a rejected controlled open untouched and marks a rejected close", async () => {
    const events: string[] = [];

    function ControlledForm({ open }: { open: boolean }) {
      const form = useMeuForm<Values>({ defaultValues: { deliveryDate: null } });
      const touched = () =>
        form.getFieldState("deliveryDate").isTouched ? "touched" : "untouched";
      return (
        <MeuForm form={form} onSubmit={vi.fn()}>
          <MeuFormDatePicker<Values>
            name="deliveryDate"
            label="受控日期"
            open={open}
            onCancel={(details) => events.push(`cancel:${details.reason}:${touched()}`)}
            onOpenChange={(nextOpen, details) =>
              events.push(`open:${String(nextOpen)}:${details.reason}:${touched()}`)
            }
          />
          <output data-testid="controlled-date-touched">
            {form.formState.touchedFields.deliveryDate ? "touched" : "untouched"}
          </output>
        </MeuForm>
      );
    }

    const { rerender } = render(<ControlledForm open={false} />);
    const trigger = screen.getByRole("button", { name: "受控日期" });
    fireEvent.click(trigger);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByTestId("controlled-date-touched").textContent).toBe("untouched");

    rerender(<ControlledForm open />);
    await waitFor(() => expect(screen.getByRole("dialog")).toBeTruthy());
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "取消" }))
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.getByRole("dialog")).toBeTruthy();
    await waitFor(() =>
      expect(screen.getByTestId("controlled-date-touched").textContent).toBe("touched")
    );
    expect(events).toEqual([
      "open:true:trigger:untouched",
      "cancel:escape:touched",
      "open:false:escape:touched"
    ]);
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

  it("supports a custom native serializer, omits reset values, and honors disabled controls", () => {
    function SerializationForm({ disabled = false }: { disabled?: boolean }) {
      const form = useMeuForm<Values>({
        defaultValues: { deliveryDate: date({ day: 28, month: 8, year: 2026 }) }
      });
      return (
        <MeuForm form={form} onSubmit={vi.fn()}>
          <MeuFormDatePicker<Values>
            name="deliveryDate"
            label="日期"
            triggerProps={{ disabled }}
            serializeValue={(value, { adapter }) => `day-${adapter.format(value, "YYYY-MM-DD")}`}
          />
          <Button type="button" onClick={() => form.reset({ deliveryDate: null })}>
            重置
          </Button>
        </MeuForm>
      );
    }

    const { unmount } = render(<SerializationForm />);
    const formElement = screen.getByRole("button", { name: "日期" }).closest("form")!;
    expect(new FormData(formElement).get("deliveryDate")).toBe("day-2026-08-28");
    fireEvent.click(screen.getByRole("button", { name: "重置" }));
    expect(new FormData(formElement).has("deliveryDate")).toBe(false);
    unmount();

    render(<SerializationForm disabled />);
    const disabledForm = screen.getByRole("button", { name: "日期" }).closest("form")!;
    expect(new FormData(disabledForm).has("deliveryDate")).toBe(false);
  });

  it("omits serializer failures and accidental async results", async () => {
    const rejection = new Error("async serializers are unsupported");
    const serializerMock = vi
      .fn()
      .mockImplementationOnce(() => {
        throw new Error("cannot serialize");
      })
      .mockImplementation(() => Promise.reject(rejection));
    const serializer = serializerMock as unknown as NonNullable<
      MeuFormDatePickerProps<Values>["serializeValue"]
    >;

    function FailureForm() {
      const form = useMeuForm<Values>({
        defaultValues: { deliveryDate: date({ day: 28, month: 8, year: 2026 }) }
      });
      return (
        <MeuForm form={form} onSubmit={vi.fn()}>
          <MeuFormDatePicker<Values> name="deliveryDate" label="日期" serializeValue={serializer} />
          <Button
            type="button"
            onClick={() => form.setValue("deliveryDate", date({ day: 29, month: 8, year: 2026 }))}
          >
            更新
          </Button>
        </MeuForm>
      );
    }

    render(<FailureForm />);
    const formElement = screen.getByRole("button", { name: "日期" }).closest("form")!;
    expect(new FormData(formElement).has("deliveryDate")).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "更新" }));
    await waitFor(() => expect(serializerMock.mock.calls.length).toBeGreaterThan(1));
    expect(new FormData(formElement).has("deliveryDate")).toBe(false);
  });
});
