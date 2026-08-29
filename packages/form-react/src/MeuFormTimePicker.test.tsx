// @vitest-environment jsdom
import { Button } from "@meu/mobile";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MeuForm } from "./MeuForm";
import { MeuFormTimePicker } from "./MeuFormTimePicker";
import { useMeuForm } from "./useMeuForm";

type Values = { deliveryTime: { hour: number; minute: number; second: number } | null };

afterEach(cleanup);

function TimePickerForm({
  events,
  initialValue = null,
  onSubmit
}: {
  events?: string[];
  initialValue?: Values["deliveryTime"];
  onSubmit: (values: Values) => void;
}) {
  const form = useMeuForm<Values>({ defaultValues: { deliveryTime: initialValue } });
  const touched = () => (form.getFieldState("deliveryTime").isTouched ? "touched" : "untouched");
  const record = (event: string) => {
    if (events) events.push(event);
  };

  return (
    <MeuForm form={form} onSubmit={onSubmit}>
      <MeuFormTimePicker<Values>
        name="deliveryTime"
        label="送达时间"
        description="选择预计送达时间"
        min={{ hour: 9, minute: 0, second: 0 }}
        max={{ hour: 18, minute: 0, second: 0 }}
        minuteStep={15}
        onCancel={(details) => record(`cancel:${details.reason}:${touched()}`)}
        onConfirm={(value) => record(`confirm:${value.hour}:${value.minute}:${touched()}`)}
        onOpenChange={(open, details) =>
          record(`open:${String(open)}:${details.reason}:${touched()}`)
        }
        required
        rules={{ validate: (value) => (value && value.hour >= 0) || "请选择送达时间" }}
        triggerProps={{ placeholder: "请选择时间" }}
      />
      <output data-testid="dirty">{form.formState.isDirty ? "dirty" : "pristine"}</output>
      <output data-testid="touched">
        {form.formState.touchedFields.deliveryTime ? "touched" : "untouched"}
      </output>
      <Button type="submit">提交订单</Button>
    </MeuForm>
  );
}

function ControlledTimePickerForm({ events, open }: { events: string[]; open: boolean }) {
  const form = useMeuForm<Values>({ defaultValues: { deliveryTime: null } });
  const touched = () => (form.getFieldState("deliveryTime").isTouched ? "touched" : "untouched");

  return (
    <MeuForm form={form} onSubmit={() => undefined}>
      <MeuFormTimePicker<Values>
        name="deliveryTime"
        label="受控送达时间"
        open={open}
        onCancel={(details) => events.push(`cancel:${details.reason}:${touched()}`)}
        onOpenChange={(nextOpen, details) =>
          events.push(`open:${String(nextOpen)}:${details.reason}:${touched()}`)
        }
      />
      <output data-testid="controlled-time-touched">
        {form.formState.touchedFields.deliveryTime ? "touched" : "untouched"}
      </output>
      <output data-testid="controlled-time-dirty">
        {form.formState.isDirty ? "dirty" : "pristine"}
      </output>
    </MeuForm>
  );
}

describe("MeuFormTimePicker", () => {
  it("keeps cancelled drafts pristine and commits a confirmed TimeValue", async () => {
    const onSubmit = vi.fn();
    const events: string[] = [];
    render(
      <TimePickerForm
        events={events}
        initialValue={{ hour: 10, minute: 30, second: 0 }}
        onSubmit={onSubmit}
      />
    );

    const trigger = screen.getByRole("button", { name: "送达时间" });
    expect(trigger.textContent).toContain("10:30");
    fireEvent.click(trigger);
    expect(screen.getByTestId("touched").textContent).toBe("untouched");
    fireEvent.click(screen.getByRole("option", { name: "45分" }));
    fireEvent.click(screen.getByRole("button", { name: "取消" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(trigger.textContent).toContain("10:30");
    expect(screen.getByTestId("dirty").textContent).toBe("pristine");
    expect(screen.getByTestId("touched").textContent).toBe("touched");

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("option", { name: "45分" }));
    fireEvent.click(screen.getByRole("button", { name: "确定" }));
    await waitFor(() => expect(trigger.textContent).toContain("10:45"));
    expect(screen.getByTestId("dirty").textContent).toBe("dirty");
    expect(screen.getByTestId("touched").textContent).toBe("touched");
    const formElement = trigger.closest("form");
    expect(formElement).not.toBeNull();
    expect(new FormData(formElement as HTMLFormElement).get("deliveryTime")).toBe("10:45");

    fireEvent.click(screen.getByRole("button", { name: "提交订单" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0]![0]).toMatchObject({
      deliveryTime: { hour: 10, minute: 45, second: 0 }
    });
    expect(events).toEqual([
      "open:true:trigger:untouched",
      "cancel:cancel:touched",
      "open:false:cancel:touched",
      "open:true:trigger:touched",
      "confirm:10:45:touched",
      "open:false:confirm:touched"
    ]);
  });

  it("associates validation feedback and focuses the native trigger", async () => {
    render(<TimePickerForm onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "提交订单" }));

    const alert = await screen.findByRole("alert");
    const trigger = screen.getByRole("button", { name: "送达时间" });
    expect(alert.textContent).toBe("请选择送达时间");
    expect(trigger.getAttribute("data-invalid")).toBe("true");
    expect(trigger.getAttribute("aria-describedby")).toContain("error");
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("keeps controlled open rejection untouched and reports a rejected close after touch", async () => {
    const events: string[] = [];
    const { rerender } = render(<ControlledTimePickerForm events={events} open={false} />);
    const trigger = screen.getByRole("button", { name: "受控送达时间" });

    fireEvent.click(trigger);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByTestId("controlled-time-touched").textContent).toBe("untouched");

    rerender(<ControlledTimePickerForm events={events} open />);
    await waitFor(() => expect(screen.getByRole("dialog")).toBeTruthy());
    expect(screen.getByTestId("controlled-time-touched").textContent).toBe("untouched");

    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "取消" }))
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.getByRole("dialog")).toBeTruthy();
    await waitFor(() =>
      expect(screen.getByTestId("controlled-time-touched").textContent).toBe("touched")
    );
    expect(screen.getByTestId("controlled-time-dirty").textContent).toBe("pristine");
    expect(events).toEqual([
      "open:true:trigger:untouched",
      "cancel:escape:touched",
      "open:false:escape:touched"
    ]);
  });
});
