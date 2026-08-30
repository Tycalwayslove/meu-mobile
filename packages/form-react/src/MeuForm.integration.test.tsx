// @vitest-environment jsdom
import { Button } from "@meu/mobile";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MeuForm } from "./MeuForm";
import { MeuFormTextInput } from "./MeuFormTextInput";
import { applyMeuFormErrors } from "./server-errors";
import { useMeuForm } from "./useMeuForm";
import { useFieldArray, useWatch } from "react-hook-form";

afterEach(cleanup);

type NestedValues = {
  aliases: Array<{ value: string }>;
  profile: { name: string };
};

function NestedAndArrayExample({ onSubmit }: { onSubmit: (values: NestedValues) => void }) {
  const form = useMeuForm<NestedValues>({
    defaultValues: { aliases: [{ value: "主账号" }], profile: { name: "" } }
  });
  const aliases = useFieldArray({ control: form.control, name: "aliases" });

  return (
    <MeuForm form={form} onSubmit={onSubmit}>
      <MeuFormTextInput<NestedValues>
        name="profile.name"
        label="店铺名称"
        rules={{ required: "请输入店铺名称" }}
      />
      {aliases.fields.map((field, index) => (
        <MeuFormTextInput<NestedValues>
          key={field.id}
          name={`aliases.${index}.value`}
          label={`别名 ${index + 1}`}
        />
      ))}
      <Button type="button" onClick={() => aliases.append({ value: "" })}>
        添加别名
      </Button>
      <Button type="submit">提交嵌套表单</Button>
    </MeuForm>
  );
}

type AsyncValues = { code: string };
type ValidationRequest = { resolve: (result: true | string) => void; value: string };

function AsyncValidationExample({ onSubmit }: { onSubmit: (values: AsyncValues) => void }) {
  const form = useMeuForm<AsyncValues>({ defaultValues: { code: "" } });
  return (
    <MeuForm form={form} onSubmit={onSubmit}>
      <MeuFormTextInput<AsyncValues>
        name="code"
        label="邀请码"
        rules={{
          validate: async (value) => {
            await Promise.resolve();
            return value === "MEU2026" || "邀请码无效";
          }
        }}
      />
      <Button type="submit">验证邀请码</Button>
    </MeuForm>
  );
}

function ValidationRaceExample({ requests }: { requests: ValidationRequest[] }) {
  const form = useMeuForm<AsyncValues>({ defaultValues: { code: "" }, mode: "onChange" });
  return (
    <MeuForm form={form} onSubmit={() => undefined}>
      <MeuFormTextInput<AsyncValues>
        name="code"
        label="竞态邀请码"
        rules={{
          validate: (value) =>
            new Promise<true | string>((resolve) => requests.push({ resolve, value }))
        }}
      />
      <output aria-label="校验状态">
        {form.formState.isValidating ? "validating" : "settled"}/
        {form.formState.errors.code ? form.formState.errors.code.message : "valid"}
      </output>
    </MeuForm>
  );
}

type ServerValues = { contact: string; storeName: string };

function ServerErrorsExample({ disableStore = false }: { disableStore?: boolean }) {
  const form = useMeuForm<ServerValues>({ defaultValues: { contact: "", storeName: "" } });
  return (
    <MeuForm form={form} onSubmit={() => undefined}>
      <MeuFormTextInput<ServerValues> name="storeName" label="店铺名称" disabled={disableStore} />
      <MeuFormTextInput<ServerValues> name="contact" label="联系人" />
      <Button
        type="button"
        onClick={() =>
          applyMeuFormErrors(form, {
            contact: "联系人不可用",
            storeName: "店铺名称已存在"
          })
        }
      >
        模拟服务端错误
      </Button>
      <Button type="button" onClick={() => applyMeuFormErrors(form, { contact: "联系人已占用" })}>
        替换服务端错误
      </Button>
      <Button
        type="button"
        onClick={() =>
          applyMeuFormErrors(form, { contact: "联系人仍不可用" }, { clearPrevious: false })
        }
      >
        合并服务端错误
      </Button>
    </MeuForm>
  );
}

function MultipleServerFormsExample() {
  const first = useMeuForm<ServerValues>({ defaultValues: { contact: "", storeName: "" } });
  const second = useMeuForm<ServerValues>({ defaultValues: { contact: "", storeName: "" } });
  return (
    <>
      <MeuForm form={first} onSubmit={() => undefined} aria-label="第一个表单">
        <MeuFormTextInput<ServerValues> name="contact" label="第一个联系人" />
        <MeuFormTextInput<ServerValues> name="storeName" label="第一个店铺名称" />
      </MeuForm>
      <MeuForm form={second} onSubmit={() => undefined} aria-label="第二个表单">
        <MeuFormTextInput<ServerValues> name="storeName" label="第二个店铺名称" />
        <MeuFormTextInput<ServerValues> name="contact" label="第二个联系人" />
        <Button
          type="button"
          onClick={() =>
            applyMeuFormErrors(second, {
              contact: "联系人不可用",
              storeName: "店铺名称已存在"
            })
          }
        >
          校验第二个表单
        </Button>
      </MeuForm>
    </>
  );
}

type LifecycleValues = { name: string };

function LifecycleExample() {
  const form = useMeuForm<LifecycleValues>({
    defaultValues: { name: "" },
    mode: "onBlur"
  });
  const watchedName = useWatch({ control: form.control, name: "name" });

  return (
    <MeuForm form={form} onSubmit={() => undefined}>
      <MeuFormTextInput<LifecycleValues>
        name="name"
        label="名称"
        rules={{ required: "请输入名称" }}
      />
      <output aria-label="当前名称">{watchedName}</output>
      <output aria-label="表单状态">
        {form.formState.isDirty ? "dirty" : "pristine"}/
        {form.formState.touchedFields.name ? "touched" : "untouched"}
      </output>
      <Button type="button" onClick={() => void form.trigger("name")}>
        触发校验
      </Button>
      <Button type="button" onClick={() => form.reset()}>
        重置
      </Button>
    </MeuForm>
  );
}

describe("MeuForm advanced integration", () => {
  it("submits nested values and dynamic array fields", async () => {
    const onSubmit = vi.fn();
    render(<NestedAndArrayExample onSubmit={onSubmit} />);

    fireEvent.change(screen.getByRole("textbox", { name: "店铺名称" }), {
      target: { value: "喵呜旗舰店" }
    });
    fireEvent.click(screen.getByRole("button", { name: "添加别名" }));
    fireEvent.change(screen.getByRole("textbox", { name: "别名 2" }), {
      target: { value: "华东店" }
    });
    fireEvent.click(screen.getByRole("button", { name: "提交嵌套表单" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        {
          aliases: [{ value: "主账号" }, { value: "华东店" }],
          profile: { name: "喵呜旗舰店" }
        },
        expect.anything()
      )
    );
  });

  it("awaits asynchronous field validation", async () => {
    const onSubmit = vi.fn();
    render(<AsyncValidationExample onSubmit={onSubmit} />);
    const input = screen.getByRole("textbox", { name: "邀请码" });

    fireEvent.change(input, { target: { value: "INVALID" } });
    fireEvent.click(screen.getByRole("button", { name: "验证邀请码" }));
    expect((await screen.findByRole("alert")).textContent).toBe("邀请码无效");
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: "MEU2026" } });
    fireEvent.click(screen.getByRole("button", { name: "验证邀请码" }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ code: "MEU2026" }, expect.anything())
    );
  });

  it("keeps the newest result when asynchronous field validation resolves out of order", async () => {
    const requests: ValidationRequest[] = [];
    render(<ValidationRaceExample requests={requests} />);
    const input = screen.getByRole("textbox", { name: "竞态邀请码" });

    fireEvent.change(input, { target: { value: "OLD" } });
    await waitFor(() => expect(requests).toHaveLength(1));
    fireEvent.change(input, { target: { value: "NEW" } });
    await waitFor(() => expect(requests).toHaveLength(2));

    requests[1]!.resolve(true);
    await waitFor(() =>
      expect(screen.getByLabelText("校验状态").textContent).toBe("settled/valid")
    );
    requests[0]!.resolve("stale error");
    await waitFor(() =>
      expect(screen.getByLabelText("校验状态").textContent).toBe("settled/valid")
    );
  });

  it("maps server errors and focuses the first invalid field", async () => {
    render(<ServerErrorsExample />);
    const input = screen.getByRole("textbox", { name: "店铺名称" });
    const scrollIntoView = vi.fn();
    vi.spyOn(input, "getBoundingClientRect").mockReturnValue({
      bottom: 40,
      top: -12
    } as DOMRect);
    Object.defineProperty(input, "scrollIntoView", { configurable: true, value: scrollIntoView });

    fireEvent.click(screen.getByRole("button", { name: "模拟服务端错误" }));

    const errors = await screen.findAllByRole("alert");
    expect(errors.map((error) => error.textContent)).toEqual(["店铺名称已存在", "联系人不可用"]);
    await waitFor(() => expect(document.activeElement).toBe(input));
    await waitFor(() =>
      expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest", inline: "nearest" })
    );
  });

  it("replaces prior server errors and skips disabled fields when choosing focus", async () => {
    render(<ServerErrorsExample disableStore />);
    fireEvent.click(screen.getByRole("button", { name: "模拟服务端错误" }));
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "联系人" }))
    );

    fireEvent.click(screen.getByRole("button", { name: "替换服务端错误" }));
    await waitFor(() => expect(screen.getAllByRole("alert")).toHaveLength(1));
    expect(screen.getByRole("alert").textContent).toBe("联系人已占用");
  });

  it("can merge a partial server response when explicitly requested", async () => {
    render(<ServerErrorsExample />);
    fireEvent.click(screen.getByRole("button", { name: "模拟服务端错误" }));
    await screen.findAllByRole("alert");
    fireEvent.click(screen.getByRole("button", { name: "合并服务端错误" }));

    await waitFor(() => expect(screen.getAllByRole("alert")).toHaveLength(2));
    expect(screen.getAllByRole("alert").map((node) => node.textContent)).toEqual([
      "店铺名称已存在",
      "联系人仍不可用"
    ]);
  });

  it("orders server-error focus inside the owning form when field names are repeated", async () => {
    render(<MultipleServerFormsExample />);
    fireEvent.click(screen.getByRole("button", { name: "校验第二个表单" }));

    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "第二个店铺名称" }))
    );
    expect(document.activeElement).not.toBe(screen.getByRole("textbox", { name: "第一个联系人" }));
  });

  it("exposes watch, dirty, touched, trigger and reset lifecycle", async () => {
    render(<LifecycleExample />);
    const input = screen.getByRole("textbox", { name: "名称" });

    fireEvent.change(input, { target: { value: "喵呜" } });
    fireEvent.blur(input);
    expect(screen.getByLabelText("当前名称").textContent).toBe("喵呜");
    await waitFor(() =>
      expect(screen.getByLabelText("表单状态").textContent).toBe("dirty/touched")
    );

    fireEvent.click(screen.getByRole("button", { name: "重置" }));
    await waitFor(() => expect(screen.getByLabelText("当前名称").textContent).toBe(""));
    expect(screen.getByLabelText("表单状态").textContent).toBe("pristine/untouched");

    fireEvent.click(screen.getByRole("button", { name: "触发校验" }));
    expect((await screen.findByRole("alert")).textContent).toBe("请输入名称");
  });
});
