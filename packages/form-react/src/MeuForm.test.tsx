// @vitest-environment jsdom
import { Button } from "@meu/mobile";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { MeuForm } from "./MeuForm";
import { MeuFormTextInput } from "./MeuFormTextInput";
import { useMeuForm } from "./useMeuForm";

const schema = z.object({ name: z.string().min(1, "请输入店铺名称") });
type FormValues = z.infer<typeof schema>;

afterEach(cleanup);

function Example({ onSubmit }: { onSubmit: (values: FormValues) => void }) {
  const form = useMeuForm<FormValues>({ schema, defaultValues: { name: "" } });
  return (
    <MeuForm form={form} onSubmit={onSubmit}>
      <MeuFormTextInput<FormValues> name="name" label="店铺名称" />
      <Button type="submit">保存更改</Button>
    </MeuForm>
  );
}

describe("MeuForm", () => {
  it("binds schema validation to an accessible field error", async () => {
    const onSubmit = vi.fn();
    render(<Example onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: "保存更改" }));
    expect((await screen.findByRole("alert")).textContent).toBe("请输入店铺名称");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits typed values", async () => {
    const onSubmit = vi.fn();
    render(<Example onSubmit={onSubmit} />);
    fireEvent.change(screen.getByRole("textbox", { name: "店铺名称" }), {
      target: { value: "喵呜体验店" }
    });
    fireEvent.click(screen.getByRole("button", { name: "保存更改" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ name: "喵呜体验店" }, expect.anything()));
  });
});
