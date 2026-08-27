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

type ServerValues = { contact: string; storeName: string };

function ServerErrorsExample() {
  const form = useMeuForm<ServerValues>({ defaultValues: { contact: "", storeName: "" } });
  return (
    <MeuForm form={form} onSubmit={() => undefined}>
      <MeuFormTextInput<ServerValues> name="storeName" label="店铺名称" />
      <MeuFormTextInput<ServerValues> name="contact" label="联系人" />
      <Button
        type="button"
        onClick={() =>
          applyMeuFormErrors(form, {
            storeName: "店铺名称已存在",
            contact: "联系人不可用"
          })
        }
      >
        模拟服务端错误
      </Button>
    </MeuForm>
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

  it("maps server errors and focuses the first invalid field", async () => {
    render(<ServerErrorsExample />);
    fireEvent.click(screen.getByRole("button", { name: "模拟服务端错误" }));

    const errors = await screen.findAllByRole("alert");
    expect(errors.map((error) => error.textContent)).toEqual(["店铺名称已存在", "联系人不可用"]);
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "店铺名称" }))
    );
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
