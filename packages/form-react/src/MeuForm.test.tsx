// @vitest-environment jsdom
import { Button } from "@meu/mobile";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { MeuForm } from "./MeuForm";
import { MeuFormTextInput } from "./MeuFormTextInput";
import { useMeuForm } from "./useMeuForm";

const schema = z.object({ name: z.string().min(1, "请输入店铺名称") });
type FormValues = z.infer<typeof schema>;
const transformedSchema = z.object({ quantity: z.string().transform((value) => Number(value)) });
type TransformInput = z.input<typeof transformedSchema>;
type TransformOutput = z.output<typeof transformedSchema>;

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

function TransformedExample({ onSubmit }: { onSubmit: (values: TransformOutput) => void }) {
  const form = useMeuForm<TransformInput, unknown, TransformOutput>({
    defaultValues: { quantity: "" },
    schema: transformedSchema
  });

  return (
    <MeuForm form={form} onSubmit={onSubmit}>
      <MeuFormTextInput<TransformInput> name="quantity" label="商品数量" inputMode="numeric" />
      <Button type="submit">保存数量</Button>
    </MeuForm>
  );
}

describe("MeuForm", () => {
  it("forwards a ref to the native form element", () => {
    const ref = createRef<HTMLFormElement>();

    function RefExample() {
      const form = useMeuForm<FormValues>({ defaultValues: { name: "" } });
      return <MeuForm ref={ref} form={form} onSubmit={() => undefined} />;
    }

    render(<RefExample />);
    expect(ref.current ? ref.current.tagName : undefined).toBe("FORM");
  });

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
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ name: "喵呜体验店" }, expect.anything())
    );
  });

  it("preserves Zod input and transformed submit value types", async () => {
    const onSubmit = vi.fn<(values: TransformOutput) => void>();
    render(<TransformedExample onSubmit={onSubmit} />);

    fireEvent.change(screen.getByRole("textbox", { name: "商品数量" }), {
      target: { value: "12" }
    });
    fireEvent.click(screen.getByRole("button", { name: "保存数量" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ quantity: 12 }, expect.anything()));
  });
});
