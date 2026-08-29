// @vitest-environment jsdom
import { Button } from "@meu/mobile";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MeuForm } from "./MeuForm";
import { MeuFormPicker } from "./MeuFormPicker";
import { useMeuForm } from "./useMeuForm";

const columns = [
  [
    { label: "标准配送", value: "standard" },
    { label: "次日达", value: "next-day", disabled: true },
    { label: "当日达", value: "same-day" },
    { label: "到店自提", value: "pickup" },
    { label: "快递柜", value: "locker" }
  ]
] as const;

type Values = { delivery: Array<string | null> };

afterEach(cleanup);

function PickerForm({
  events,
  onSubmit
}: {
  events?: string[];
  onSubmit: (values: Values) => void;
}) {
  const form = useMeuForm<Values>({ defaultValues: { delivery: [] } });
  const touched = () => (form.getFieldState("delivery").isTouched ? "touched" : "untouched");
  const record = (event: string) => {
    if (events) events.push(event);
  };

  return (
    <MeuForm form={form} onSubmit={onSubmit}>
      <MeuFormPicker<Values, string>
        name="delivery"
        label="配送方式"
        description="选择一种可用方式"
        columns={columns}
        onCancel={(details) => record(`cancel:${details.reason}:${touched()}`)}
        onConfirm={(value) => record(`confirm:${String(value[0])}:${touched()}`)}
        onOpenChange={(open, details) =>
          record(`open:${String(open)}:${details.reason}:${touched()}`)
        }
        required
        rules={{
          validate: (value) =>
            (Array.isArray(value) && typeof value[0] === "string") || "请选择配送方式"
        }}
        triggerProps={{ placeholder: "请选择配送方式" }}
      />
      <output data-testid="dirty">{form.formState.isDirty ? "dirty" : "pristine"}</output>
      <output data-testid="touched">
        {form.formState.touchedFields.delivery ? "touched" : "untouched"}
      </output>
      <Button type="submit">提交订单</Button>
    </MeuForm>
  );
}

function ControlledPickerForm({ events, open }: { events: string[]; open: boolean }) {
  const form = useMeuForm<Values>({ defaultValues: { delivery: [] } });
  const touched = () => (form.getFieldState("delivery").isTouched ? "touched" : "untouched");

  return (
    <MeuForm form={form} onSubmit={() => undefined}>
      <MeuFormPicker<Values, string>
        name="delivery"
        label="受控配送方式"
        columns={columns}
        open={open}
        onCancel={(details) => events.push(`cancel:${details.reason}:${touched()}`)}
        onOpenChange={(nextOpen, details) =>
          events.push(`open:${String(nextOpen)}:${details.reason}:${touched()}`)
        }
        triggerProps={{ onBlur: () => events.push(`blur:${touched()}`) }}
      />
      <output data-testid="controlled-picker-touched">
        {form.formState.touchedFields.delivery ? "touched" : "untouched"}
      </output>
      <output data-testid="controlled-picker-dirty">
        {form.formState.isDirty ? "dirty" : "pristine"}
      </output>
    </MeuForm>
  );
}

describe("MeuFormPicker", () => {
  it("keeps cancelled drafts out of form state and commits confirmed values", async () => {
    const onSubmit = vi.fn();
    const events: string[] = [];
    render(<PickerForm events={events} onSubmit={onSubmit} />);

    const trigger = screen.getByRole("button", { name: "配送方式" });
    expect(trigger.textContent).toContain("请选择配送方式");
    fireEvent.click(trigger);
    expect(screen.getByTestId("touched").textContent).toBe("untouched");
    fireEvent.click(screen.getByRole("option", { name: "当日达" }));
    fireEvent.click(screen.getByRole("button", { name: "取消" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(trigger.textContent).toContain("请选择配送方式");
    expect(screen.getByTestId("dirty").textContent).toBe("pristine");
    expect(screen.getByTestId("touched").textContent).toBe("touched");

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("option", { name: "当日达" }));
    fireEvent.click(screen.getByRole("button", { name: "确定" }));
    await waitFor(() => expect(trigger.textContent).toContain("当日达"));
    expect(screen.getByTestId("dirty").textContent).toBe("dirty");
    expect(screen.getByTestId("touched").textContent).toBe("touched");
    const formElement = trigger.closest("form");
    expect(formElement).not.toBeNull();
    expect(new FormData(formElement as HTMLFormElement).getAll("delivery")).toEqual(["same-day"]);

    fireEvent.click(screen.getByRole("button", { name: "提交订单" }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ delivery: ["same-day"] }, expect.anything())
    );
    expect(events).toEqual([
      "open:true:trigger:untouched",
      "cancel:cancel:touched",
      "open:false:cancel:touched",
      "open:true:trigger:touched",
      "confirm:same-day:touched",
      "open:false:confirm:touched"
    ]);
  });

  it("surfaces validation errors on the trigger and focuses it", async () => {
    render(<PickerForm onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "提交订单" }));

    const alert = await screen.findByRole("alert");
    const trigger = screen.getByRole("button", { name: "配送方式" });
    expect(alert.textContent).toBe("请选择配送方式");
    expect(trigger.getAttribute("data-invalid")).toBe("true");
    expect(trigger.getAttribute("aria-describedby")).toContain("error");
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("keeps controlled open rejection untouched and marks a rejected close once", async () => {
    const events: string[] = [];
    const { rerender } = render(<ControlledPickerForm events={events} open={false} />);
    const trigger = screen.getByRole("button", { name: "受控配送方式" });

    fireEvent.click(trigger);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByTestId("controlled-picker-touched").textContent).toBe("untouched");

    trigger.focus();
    rerender(<ControlledPickerForm events={events} open />);
    await waitFor(() => expect(screen.getByRole("dialog")).toBeTruthy());
    expect(screen.getByTestId("controlled-picker-touched").textContent).toBe("untouched");

    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "取消" }))
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(events).toEqual([
      "open:true:trigger:untouched",
      "blur:untouched",
      "cancel:escape:touched",
      "open:false:escape:touched"
    ]);
    await waitFor(() =>
      expect(screen.getByTestId("controlled-picker-touched").textContent).toBe("touched")
    );
    expect(screen.getByTestId("controlled-picker-dirty").textContent).toBe("pristine");
  });
});
