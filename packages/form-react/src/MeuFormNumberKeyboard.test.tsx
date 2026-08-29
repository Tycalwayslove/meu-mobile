// @vitest-environment jsdom
import { Button } from "@meu/mobile";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { MeuForm } from "./MeuForm";
import { MeuFormNumberKeyboard } from "./MeuFormNumberKeyboard";
import { useMeuForm } from "./useMeuForm";

const schema = z.object({ amount: z.string().min(1, "请输入金额") });
type Values = z.infer<typeof schema>;

afterEach(cleanup);

function AmountForm({
  events,
  onConfirm,
  onSubmit
}: {
  events?: string[];
  onConfirm: (value: string) => void;
  onSubmit: (values: Values) => void;
}) {
  const form = useMeuForm<Values>({ schema, defaultValues: { amount: "" } });
  const touched = () => (form.getFieldState("amount").isTouched ? "touched" : "untouched");
  const record = (event: string) => {
    if (events) events.push(event);
  };
  return (
    <MeuForm form={form} onSubmit={onSubmit}>
      <MeuFormNumberKeyboard<Values>
        name="amount"
        label="交易金额"
        description="使用虚拟键盘输入"
        mode="decimal"
        maxLength={4}
        confirmLabel="完成输入"
        onConfirm={(value) => {
          record(`confirm:${value}:${touched()}`);
          onConfirm(value);
        }}
        onOpenChange={(open, details) =>
          record(`open:${String(open)}:${details.reason}:${touched()}`)
        }
      />
      <output data-testid="dirty">{form.formState.isDirty ? "dirty" : "pristine"}</output>
      <output data-testid="touched">
        {form.formState.touchedFields.amount ? "touched" : "untouched"}
      </output>
      <Button type="submit">提交金额</Button>
    </MeuForm>
  );
}

function ControlledKeyboardForm({ events, open }: { events: string[]; open: boolean }) {
  const form = useMeuForm<Values>({ defaultValues: { amount: "" } });
  const touched = () => (form.getFieldState("amount").isTouched ? "touched" : "untouched");

  return (
    <MeuForm form={form} onSubmit={() => undefined}>
      <MeuFormNumberKeyboard<Values>
        name="amount"
        label="受控交易金额"
        open={open}
        onOpenChange={(nextOpen, details) =>
          events.push(`open:${String(nextOpen)}:${details.reason}:${touched()}`)
        }
      />
      <output data-testid="controlled-keyboard-touched">
        {form.formState.touchedFields.amount ? "touched" : "untouched"}
      </output>
      <output data-testid="controlled-keyboard-dirty">
        {form.formState.isDirty ? "dirty" : "pristine"}
      </output>
    </MeuForm>
  );
}

describe("MeuFormNumberKeyboard", () => {
  it("binds input, decimal, delete, max length and confirm to form state", async () => {
    const onConfirm = vi.fn();
    const onSubmit = vi.fn();
    const events: string[] = [];
    render(<AmountForm events={events} onConfirm={onConfirm} onSubmit={onSubmit} />);
    const trigger = screen.getByRole("button", { name: "交易金额" });

    expect(trigger.textContent).toContain("请输入");
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByTestId("touched").textContent).toBe("untouched");
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "小数点" }));
    fireEvent.click(screen.getByRole("button", { name: "小数点" }));
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    fireEvent.click(screen.getByRole("button", { name: "4" }));
    await waitFor(() => expect(trigger.textContent).toContain("1.23"));
    expect(screen.getByTestId("dirty").textContent).toBe("dirty");

    fireEvent.click(screen.getByRole("button", { name: "删除上一位" }));
    await waitFor(() => expect(trigger.textContent).toContain("1.2"));
    fireEvent.click(screen.getByRole("button", { name: "完成输入" }));
    expect(onConfirm).toHaveBeenCalledWith("1.2");
    expect(screen.getByTestId("touched").textContent).toBe("touched");
    await waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("false"));
    const formElement = trigger.closest("form");
    expect(formElement).not.toBeNull();
    expect(new FormData(formElement as HTMLFormElement).get("amount")).toBe("1.2");

    fireEvent.click(screen.getByRole("button", { name: "提交金额" }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ amount: "1.2" }, expect.anything())
    );
    expect(events).toEqual([
      "open:true:trigger:untouched",
      "confirm:1.2:touched",
      "open:false:confirm:touched"
    ]);
  });

  it("surfaces validation errors and focuses the trigger", async () => {
    render(<AmountForm onConfirm={vi.fn()} onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "提交金额" }));

    const alert = await screen.findByRole("alert");
    const trigger = screen.getByRole("button", { name: "交易金额" });
    expect(alert.textContent).toBe("请输入金额");
    expect(trigger.getAttribute("data-invalid")).toBe("true");
    expect(trigger.getAttribute("aria-describedby")).toContain("error");
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("stays untouched within the keyboard and touches after focus leaves the composite", async () => {
    render(<AmountForm onConfirm={vi.fn()} onSubmit={vi.fn()} />);
    const trigger = screen.getByRole("button", { name: "交易金额" });
    const submit = screen.getByRole("button", { name: "提交金额" });

    fireEvent.click(trigger);
    const digit = screen.getByRole("button", { name: "1" });
    fireEvent.blur(trigger, { relatedTarget: digit });
    fireEvent.focus(digit);
    expect(screen.getByTestId("touched").textContent).toBe("untouched");

    fireEvent.blur(digit, { relatedTarget: submit });
    fireEvent.focus(submit);
    await waitFor(() => expect(screen.getByTestId("touched").textContent).toBe("touched"));
    expect(screen.getByTestId("dirty").textContent).toBe("pristine");
  });

  it("keeps controlled open rejection untouched and marks a rejected Escape close once", async () => {
    const events: string[] = [];
    const { rerender } = render(<ControlledKeyboardForm events={events} open={false} />);
    const trigger = screen.getByRole("button", { name: "受控交易金额" });

    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.getByTestId("controlled-keyboard-touched").textContent).toBe("untouched");

    rerender(<ControlledKeyboardForm events={events} open />);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByTestId("controlled-keyboard-touched").textContent).toBe("untouched");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    await waitFor(() =>
      expect(screen.getByTestId("controlled-keyboard-touched").textContent).toBe("touched")
    );
    expect(screen.getByTestId("controlled-keyboard-dirty").textContent).toBe("pristine");
    expect(events).toEqual(["open:true:trigger:untouched", "open:false:escape:touched"]);
  });
});
