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

function AmountForm({ onConfirm, onSubmit }: {
  onConfirm: (value: string) => void;
  onSubmit: (values: Values) => void;
}) {
  const form = useMeuForm<Values>({ schema, defaultValues: { amount: "" } });
  return (
    <MeuForm form={form} onSubmit={onSubmit}>
      <MeuFormNumberKeyboard<Values>
        name="amount"
        label="交易金额"
        description="使用虚拟键盘输入"
        mode="decimal"
        maxLength={4}
        confirmLabel="完成输入"
        onConfirm={onConfirm}
      />
      <output data-testid="dirty">{form.formState.isDirty ? "dirty" : "pristine"}</output>
      <Button type="submit">提交金额</Button>
    </MeuForm>
  );
}

describe("MeuFormNumberKeyboard", () => {
  it("binds input, decimal, delete, max length and confirm to form state", async () => {
    const onConfirm = vi.fn();
    const onSubmit = vi.fn();
    render(<AmountForm onConfirm={onConfirm} onSubmit={onSubmit} />);
    const trigger = screen.getByRole("button", { name: "交易金额" });

    expect(trigger.textContent).toContain("请输入");
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
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
    await waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("false"));

    fireEvent.click(screen.getByRole("button", { name: "提交金额" }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ amount: "1.2" }, expect.anything())
    );
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
});
