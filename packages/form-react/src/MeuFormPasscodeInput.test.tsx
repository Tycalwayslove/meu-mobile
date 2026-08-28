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

    fireEvent.click(screen.getByRole("button", { name: "验证" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ code: "1234" }, expect.anything()));
  });

  it("surfaces form errors and focuses the real native input", async () => {
    render(<CodeForm onComplete={vi.fn()} onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "验证" }));

    const alert = await screen.findByRole("alert");
    const input = screen.getByLabelText<HTMLInputElement>(/短信验证码/);
    expect(alert.textContent).toBe("请输入 4 位验证码");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toContain("error");
    await waitFor(() => expect(document.activeElement).toBe(input));
  });
});
