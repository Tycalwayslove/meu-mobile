// @vitest-environment jsdom
import { Button } from "@meu/mobile";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { MeuForm } from "./MeuForm";
import { MeuFormPasscodeInput } from "./MeuFormPasscodeInput";
import { useMeuForm } from "./useMeuForm";

const schema = z.object({ code: z.string().length(4, "请输入 4 位验证码") });
type Values = z.infer<typeof schema>;
type DisabledValues = { code?: string };

afterEach(cleanup);

function CodeForm({
  onComplete,
  onSubmit
}: {
  onComplete: (value: string) => void;
  onSubmit: (values: Values) => void;
}) {
  const form = useMeuForm<Values>({ schema, defaultValues: { code: "" } });
  return (
    <MeuForm form={form} onSubmit={onSubmit}>
      <MeuFormPasscodeInput<Values>
        name="code"
        label="短信验证码"
        description="输入四位数字"
        length={4}
        keyboard={{ closeOnComplete: true, title: "验证码键盘" }}
        onComplete={onComplete}
        required
      />
      <output data-testid="dirty">{form.formState.isDirty ? "dirty" : "pristine"}</output>
      <Button type="submit">验证</Button>
    </MeuForm>
  );
}

describe("MeuFormPasscodeInput", () => {
  it("binds the built-in number keyboard, completion and submission", async () => {
    const onComplete = vi.fn();
    const onSubmit = vi.fn();
    render(<CodeForm onComplete={onComplete} onSubmit={onSubmit} />);
    const input = screen.getByLabelText<HTMLInputElement>(/短信验证码/);

    fireEvent.focus(input);
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    fireEvent.click(screen.getByRole("button", { name: "4" }));
    await waitFor(() => expect(onComplete).toHaveBeenCalledWith("1234"));
    expect(screen.getByTestId("dirty").textContent).toBe("dirty");
    expect(input.value).toBe("1234");
    const formElement = input.closest("form");
    expect(formElement).not.toBeNull();
    expect(new FormData(formElement as HTMLFormElement).get("code")).toBe("1234");

    fireEvent.click(screen.getByRole("button", { name: "验证" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ code: "1234" }, expect.anything()));
  });

  it("surfaces form errors and focuses the real native input", async () => {
    render(<CodeForm onComplete={vi.fn()} onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "验证" }));

    const alert = await screen.findByRole("alert");
    const input = screen.getByLabelText<HTMLInputElement>(/短信验证码/);
    const label = screen.getByText("短信验证码");
    expect(label.tagName).toBe("LABEL");
    expect((label as HTMLLabelElement).htmlFor).toBe(input.id);
    expect(alert.textContent).toBe("请输入 4 位验证码");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toContain("error");
    await waitFor(() => expect(document.activeElement).toBe(input));
  });

  it("excludes an explicitly disabled existing value from RHF submission", async () => {
    const onSubmit = vi.fn();

    function DisabledCodeForm() {
      const form = useMeuForm<DisabledValues>({ defaultValues: { code: "1234" } });
      return (
        <MeuForm form={form} onSubmit={onSubmit}>
          <MeuFormPasscodeInput<DisabledValues> name="code" label="验证码" disabled />
          <Button type="submit">提交</Button>
        </MeuForm>
      );
    }

    render(<DisabledCodeForm />);
    const input = screen.getByLabelText<HTMLInputElement>("验证码");
    expect(input.disabled).toBe(true);
    expect(new FormData(input.form as HTMLFormElement).has("code")).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "提交" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({}, expect.anything()));
  });
});
