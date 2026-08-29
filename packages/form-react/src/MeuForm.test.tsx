// @vitest-environment jsdom
import { Button } from "@meu/mobile";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef, useState } from "react";
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
type ResetValues = { disabledValue: string; name: string };

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((complete) => {
    resolve = complete;
  });
  return { promise, resolve };
}

afterEach(cleanup);

function Example({ onSubmit }: { onSubmit: (values: FormValues) => Promise<void> | void }) {
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

function NativeResetExample({ onReset }: { onReset?: React.FormEventHandler<HTMLFormElement> }) {
  const form = useMeuForm<ResetValues>({
    defaultValues: { disabledValue: "固定值", name: "" }
  });
  return (
    <MeuForm form={form} onReset={onReset} onSubmit={() => undefined}>
      <MeuFormTextInput<ResetValues> name="name" label="名称" />
      <MeuFormTextInput<ResetValues> name="disabledValue" label="禁用值" disabled />
      <output aria-label="重置状态">
        {form.formState.isDirty ? "dirty" : "pristine"}/
        {form.formState.touchedFields.name ? "touched" : "untouched"}/
        {form.formState.errors.name ? "error" : "valid"}
      </output>
      <Button type="button" onClick={() => form.setError("name", { message: "名称不可用" })}>
        设置错误
      </Button>
      <Button type="reset">原生重置</Button>
    </MeuForm>
  );
}

type CoreValues = { conditional?: string; first: string; second: string };

function ConditionalExample({ onSubmit }: { onSubmit: (values: CoreValues) => void }) {
  const [showConditional, setShowConditional] = useState(true);
  const form = useMeuForm<CoreValues>({
    defaultValues: { conditional: "remove me", first: "first", second: "second" }
  });
  return (
    <MeuForm form={form} onSubmit={onSubmit}>
      <input aria-label="first" {...form.register("first")} />
      <input aria-label="second" readOnly {...form.register("second")} />
      {showConditional ? (
        <input aria-label="conditional" {...form.register("conditional")} />
      ) : null}
      <button type="button" onClick={() => setShowConditional(false)}>
        remove field
      </button>
      <button type="submit">submit conditional</button>
    </MeuForm>
  );
}

function DomOrderErrorExample() {
  const form = useMeuForm<Pick<CoreValues, "first" | "second">>({
    defaultValues: { first: "", second: "" }
  });
  form.register("second", { required: "second required" });
  form.register("first", { required: "first required" });
  return (
    <MeuForm form={form} onSubmit={() => undefined}>
      <label>
        first
        <input {...form.register("first", { required: "first required" })} />
      </label>
      <label>
        second
        <input {...form.register("second", { required: "second required" })} />
      </label>
      <button type="submit">validate DOM order</button>
    </MeuForm>
  );
}

function ControlledValuesExample() {
  const [values, setValues] = useState({ name: "Initial" });
  const form = useMeuForm<{ name: string }>({ values });
  return (
    <MeuForm form={form} onSubmit={() => undefined}>
      <label>
        controlled name
        <input {...form.register("name")} />
      </label>
      <output aria-label="controlled state">
        {form.formState.isDirty ? "dirty" : "pristine"}/
        {form.formState.touchedFields.name ? "touched" : "untouched"}
      </output>
      <button type="button" onClick={() => setValues({ name: "External" })}>
        replace controlled values
      </button>
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

  it("synchronizes native reset with RHF value, dirty, touched and error state", async () => {
    const onReset = vi.fn();
    render(<NativeResetExample onReset={onReset} />);
    const name = screen.getByRole<HTMLInputElement>("textbox", { name: "名称" });
    const disabledValue = screen.getByRole<HTMLInputElement>("textbox", { name: "禁用值" });

    fireEvent.change(name, { target: { value: "喵呜" } });
    fireEvent.blur(name);
    fireEvent.click(screen.getByRole("button", { name: "设置错误" }));
    await waitFor(() =>
      expect(screen.getByLabelText("重置状态").textContent).toBe("dirty/touched/error")
    );
    expect(disabledValue.disabled).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "原生重置" }));

    expect(onReset).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(name.value).toBe("");
      expect(screen.getByLabelText("重置状态").textContent).toBe("pristine/untouched/valid");
    });
    expect(disabledValue.value).toBe("固定值");
    expect(disabledValue.disabled).toBe(true);
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("preserves RHF state when the consumer prevents native reset", async () => {
    const onReset = vi.fn<React.FormEventHandler<HTMLFormElement>>((event) => {
      event.preventDefault();
    });
    render(<NativeResetExample onReset={onReset} />);
    const name = screen.getByRole<HTMLInputElement>("textbox", { name: "名称" });

    fireEvent.change(name, { target: { value: "保留值" } });
    fireEvent.blur(name);
    fireEvent.click(screen.getByRole("button", { name: "设置错误" }));
    await waitFor(() =>
      expect(screen.getByLabelText("重置状态").textContent).toBe("dirty/touched/error")
    );

    fireEvent.click(screen.getByRole("button", { name: "原生重置" }));

    expect(name.value).toBe("保留值");
    expect(screen.getByLabelText("重置状态").textContent).toBe("dirty/touched/error");
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("unregisters dynamically removed fields by default", async () => {
    const onSubmit = vi.fn();
    render(<ConditionalExample onSubmit={onSubmit} />);
    expect(screen.getByRole("textbox", { name: "conditional" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "remove field" }));
    fireEvent.click(screen.getByRole("button", { name: "submit conditional" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ first: "first", second: "second" }, expect.anything())
    );
  });

  it("honors controlled values as a new pristine state", async () => {
    render(<ControlledValuesExample />);
    const input = screen.getByRole<HTMLInputElement>("textbox", { name: "controlled name" });
    fireEvent.change(input, { target: { value: "Local" } });
    fireEvent.blur(input);
    await waitFor(() =>
      expect(screen.getByLabelText("controlled state").textContent).toBe("dirty/touched")
    );

    fireEvent.click(screen.getByRole("button", { name: "replace controlled values" }));
    await waitFor(() => expect(input.value).toBe("External"));
    expect(screen.getByLabelText("controlled state").textContent).toBe("pristine/untouched");
  });

  it("focuses the first invalid enabled field in DOM order", async () => {
    render(<DomOrderErrorExample />);
    fireEvent.click(screen.getByRole("button", { name: "validate DOM order" }));

    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "first" }))
    );
  });

  it("ignores duplicate native submits until the active submission settles", async () => {
    const gate = deferred<void>();
    const onSubmit = vi.fn(() => gate.promise);
    render(<Example onSubmit={onSubmit} />);
    const input = screen.getByRole("textbox", { name: "店铺名称" });
    fireEvent.change(input, { target: { value: "喵呜体验店" } });
    const submit = screen.getByRole("button", { name: "保存更改" });

    fireEvent.click(submit);
    fireEvent.click(submit);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));

    await act(async () => {
      gate.resolve();
      await gate.promise;
    });
    fireEvent.click(submit);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
  });

  it("allows concurrent submit attempts only when explicitly configured", async () => {
    const gate = deferred<void>();
    const onSubmit = vi.fn(() => gate.promise);

    function ConcurrentExample() {
      const form = useMeuForm<{ name: string }>({ defaultValues: { name: "Meu" } });
      return (
        <MeuForm form={form} onSubmit={onSubmit} submitConcurrency="allow">
          <button type="submit">parallel submit</button>
        </MeuForm>
      );
    }

    render(<ConcurrentExample />);
    const submit = screen.getByRole("button", { name: "parallel submit" });
    fireEvent.click(submit);
    fireEvent.click(submit);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
    gate.resolve();
  });

  it("reports rejected submit promises through onSubmitError", async () => {
    const error = new Error("save failed");
    const onSubmitError = vi.fn();

    function RejectionExample() {
      const form = useMeuForm<{ name: string }>({ defaultValues: { name: "Meu" } });
      return (
        <MeuForm form={form} onSubmit={() => Promise.reject(error)} onSubmitError={onSubmitError}>
          <button type="submit">reject submit</button>
        </MeuForm>
      );
    }

    render(<RejectionExample />);
    fireEvent.click(screen.getByRole("button", { name: "reject submit" }));
    await waitFor(() => expect(onSubmitError).toHaveBeenCalledWith(error));
  });

  it("runs a React 19 function action after validation with native FormData and submitter", async () => {
    const calls: string[] = [];
    const action = vi.fn((data: FormData) => {
      calls.push("action");
      expect(data.get("name")).toBe("Meu");
      expect(data.get("intent")).toBe("save");
    });

    function ActionExample() {
      const form = useMeuForm<{ name: string }>({ defaultValues: { name: "Meu" } });
      return (
        <MeuForm
          action={action}
          form={form}
          onSubmit={() => {
            calls.push("submit");
          }}
        >
          <input aria-label="action name" {...form.register("name", { required: true })} />
          <button type="submit" name="intent" value="save">
            save action
          </button>
        </MeuForm>
      );
    }

    render(<ActionExample />);
    fireEvent.click(screen.getByRole("button", { name: "save action" }));
    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
    expect(calls).toEqual(["submit", "action"]);
  });

  it("continues a validated string action through native requestSubmit with its submitter", async () => {
    const onSubmit = vi.fn();

    function StringActionExample() {
      const form = useMeuForm<{ name: string }>({ defaultValues: { name: "Meu" } });
      return (
        <MeuForm action="/save" form={form} onSubmit={onSubmit}>
          <input aria-label="string action name" {...form.register("name")} />
          <button type="submit" name="intent" value="publish">
            publish action
          </button>
        </MeuForm>
      );
    }

    render(<StringActionExample />);
    const formElement = screen.getByRole("textbox", { name: "string action name" }).closest("form");
    if (!formElement) throw new Error("Expected native form");
    const requestSubmit = vi
      .spyOn(formElement, "requestSubmit")
      .mockImplementation(() => undefined);
    const submitter = screen.getByRole<HTMLButtonElement>("button", { name: "publish action" });

    fireEvent.click(submitter);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(requestSubmit).toHaveBeenCalledWith(submitter);
  });
});
