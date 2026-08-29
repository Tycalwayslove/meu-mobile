// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { Field } from "../Field";
import { TextInput } from "./TextInput";

describe("TextInput", () => {
  it("inherits label and error semantics from Field", () => {
    render(
      <Field label="手机号" error="手机号格式不正确">
        <TextInput aria-invalid="grammar" />
      </Field>
    );
    const input = screen.getByRole("textbox", { name: "手机号" });
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toContain("error");
  });

  it("lets an explicit empty aria-describedby opt out of contextual descriptions", () => {
    render(
      <Field description="不会关联这段说明">
        <div>
          <TextInput aria-describedby="" aria-label="无描述手机号" />
        </div>
      </Field>
    );
    const input = screen.getByRole("textbox", { name: "无描述手机号" });

    expect(input.getAttribute("aria-describedby")).toBe("");
  });

  it("exposes a clear action", () => {
    const onClear = vi.fn();
    render(<TextInput clearable defaultValue="喵呜" onClear={onClear} />);
    fireEvent.click(screen.getByRole("button", { name: "清除输入" }));
    expect(onClear).toHaveBeenCalledOnce();
    expect(screen.getByRole("textbox")).toHaveProperty("value", "");
    expect(document.activeElement).toBe(screen.getByRole("textbox"));
    expect(screen.getByRole<HTMLInputElement>("textbox").selectionStart).toBe(0);
    expect(screen.queryByRole("button", { name: "清除输入" })).toBeNull();
  });

  it("tracks native input and autofill-like updates without taking value ownership", () => {
    const onInput = vi.fn();
    const onChange = vi.fn();
    render(
      <TextInput
        aria-label="自动填充姓名"
        autoComplete="name"
        clearable
        onChange={onChange}
        onInput={onInput}
      />
    );
    const input = screen.getByRole<HTMLInputElement>("textbox", { name: "自动填充姓名" });
    expect(screen.queryByRole("button", { name: "清除输入" })).toBeNull();

    fireEvent.input(input, { target: { value: "Meu Mall" } });

    expect(input.value).toBe("Meu Mall");
    expect(onInput).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "清除输入" })).toBeTruthy();
  });

  it("clears controlled values through the native change contract", () => {
    const callOrder: string[] = [];
    const onInput = vi.fn();
    const onChange = vi.fn();
    const onClear = vi.fn();

    function ControlledInput() {
      const [value, setValue] = useState("喵呜");
      return (
        <TextInput
          aria-label="店铺名称"
          clearable
          value={value}
          onInput={() => {
            callOrder.push("input");
            onInput();
          }}
          onChange={(event) => {
            callOrder.push("change");
            onChange(event.currentTarget.value);
            setValue(event.currentTarget.value);
          }}
          onClear={() => {
            callOrder.push("clear");
            onClear();
          }}
        />
      );
    }

    render(<ControlledInput />);
    fireEvent.click(screen.getByRole("button", { name: "清除输入" }));

    expect(onInput).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith("");
    expect(onClear).toHaveBeenCalledOnce();
    expect(callOrder).toEqual(["input", "change", "clear"]);
    expect(screen.getByRole("textbox", { name: "店铺名称" })).toHaveProperty("value", "");
  });

  it("keeps a rejected controlled clear focused and visible", () => {
    const onChange = vi.fn<(value: string) => void>();
    const onClear = vi.fn();
    render(
      <TextInput
        aria-label="固定店铺名称"
        clearable
        value="Meu"
        onChange={(event) => onChange(event.currentTarget.value)}
        onClear={onClear}
      />
    );
    const input = screen.getByRole<HTMLInputElement>("textbox", { name: "固定店铺名称" });
    const clear = screen.getByRole("button", { name: "清除输入" });
    input.focus();
    input.setSelectionRange(1, 2);
    fireEvent.mouseDown(clear);
    expect(document.activeElement).toBe(input);
    fireEvent.click(clear);

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith("");
    expect(onClear).toHaveBeenCalledOnce();
    expect(input.value).toBe("Meu");
    expect(document.activeElement).toBe(input);
    expect(screen.getByRole("button", { name: "清除输入" })).toBeTruthy();
  });

  it("clears password values without exposing them as text", () => {
    render(
      <TextInput
        aria-label="账户密码"
        autoComplete="current-password"
        clearLabel="清除密码"
        clearable
        defaultValue="secret"
        type="password"
      />
    );
    const input = screen.getByLabelText<HTMLInputElement>("账户密码");
    expect(input.type).toBe("password");

    fireEvent.click(screen.getByRole("button", { name: "清除密码" }));

    expect(input.value).toBe("");
    expect(input.type).toBe("password");
    expect(document.activeElement).toBe(input);
  });

  it("uses the input owner window when clearing a cross-document control", () => {
    const frame = document.createElement("iframe");
    document.body.append(frame);
    const frameDocument = frame.contentDocument!;
    const frameWindow = frame.contentWindow!;
    const FrameEvent = (frameWindow as Window & typeof globalThis).Event;
    const container = frameDocument.createElement("div");
    frameDocument.body.append(container);
    const onInput = vi.fn((event: React.FormEvent<HTMLInputElement>) => {
      expect(event.nativeEvent).toBeInstanceOf(FrameEvent);
    });
    const view = render(
      <TextInput aria-label="跨文档名称" clearable defaultValue="Meu" onInput={onInput} />,
      { container }
    );

    const frameQueries = within(container);
    fireEvent.click(frameQueries.getByRole("button", { name: "清除输入" }));

    const control = frameQueries.getByRole<HTMLInputElement>("textbox", { name: "跨文档名称" });
    expect(onInput).toHaveBeenCalledOnce();
    expect(control.value).toBe("");
    expect(frameDocument.activeElement).toBe(control);

    view.unmount();
    frame.remove();
  });

  it("passes composition events and edits through without formatting IME input", () => {
    const onCompositionStart = vi.fn();
    const onCompositionEnd = vi.fn();
    const onChange = vi.fn();
    render(
      <TextInput
        aria-label="中文姓名"
        onChange={onChange}
        onCompositionEnd={onCompositionEnd}
        onCompositionStart={onCompositionStart}
      />
    );
    const input = screen.getByRole<HTMLInputElement>("textbox", { name: "中文姓名" });

    fireEvent.compositionStart(input, { data: "m" });
    fireEvent.input(input, { target: { value: "喵" } });
    fireEvent.compositionEnd(input, { data: "喵" });

    expect(onCompositionStart).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledOnce();
    expect(onCompositionEnd).toHaveBeenCalledOnce();
    expect(input.value).toBe("喵");
  });

  it("restores native uncontrolled defaults and clear visibility on form reset", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <form>
        <TextInput
          aria-label="可重置名称"
          clearable
          defaultValue="初始名称"
          name="name"
          onChange={onChange}
        />
      </form>
    );
    const form = container.querySelector("form")!;
    const input = screen.getByRole<HTMLInputElement>("textbox", { name: "可重置名称" });

    fireEvent.input(input, { target: { value: "" } });
    expect(screen.queryByRole("button", { name: "清除输入" })).toBeNull();
    input.focus();
    act(() => form.reset());

    expect(input.value).toBe("初始名称");
    await waitFor(() => expect(screen.getByRole("button", { name: "清除输入" })).toBeTruthy());
    expect(document.activeElement).toBe(input);
    expect(new FormData(form).get("name")).toBe("初始名称");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("keeps the latest controlled value after native reset", async () => {
    const { container, rerender } = render(
      <form>
        <TextInput aria-label="受控名称" name="name" value="第一版" />
      </form>
    );
    rerender(
      <form>
        <TextInput aria-label="受控名称" name="name" value="第二版" />
      </form>
    );
    const form = container.querySelector("form")!;
    const input = screen.getByRole<HTMLInputElement>("textbox", { name: "受控名称" });

    act(() => form.reset());

    expect(input.value).toBe("第二版");
    await waitFor(() => expect(new FormData(form).get("name")).toBe("第二版"));
  });

  it("observes an external owner form that mounts after the input", async () => {
    const { rerender } = render(
      <>
        <TextInput
          aria-label="晚挂载表单姓名"
          clearable
          defaultValue="初始姓名"
          form="late-profile-form"
          name="name"
        />
        <div data-testid="owner-slot" />
      </>
    );
    const input = screen.getByRole<HTMLInputElement>("textbox", { name: "晚挂载表单姓名" });
    fireEvent.input(input, { target: { value: "" } });
    expect(screen.queryByRole("button", { name: "清除输入" })).toBeNull();

    rerender(
      <>
        <TextInput
          aria-label="晚挂载表单姓名"
          clearable
          defaultValue="初始姓名"
          form="late-profile-form"
          name="name"
        />
        <form id="late-profile-form" />
      </>
    );
    const form = document.getElementById("late-profile-form") as HTMLFormElement;
    expect(screen.getByRole("textbox", { name: "晚挂载表单姓名" })).toBe(input);
    act(() => form.reset());

    expect(input.value).toBe("初始姓名");
    await waitFor(() => expect(screen.getByRole("button", { name: "清除输入" })).toBeTruthy());
    expect(new FormData(form).get("name")).toBe("初始姓名");
  });

  it("follows a replacement external owner form with the same id", async () => {
    const { rerender } = render(
      <>
        <TextInput
          aria-label="替换表单姓名"
          clearable
          defaultValue="初始姓名"
          form="replaceable-profile-form"
          name="name"
        />
        <form id="replaceable-profile-form" key="first" />
      </>
    );
    const input = screen.getByRole<HTMLInputElement>("textbox", { name: "替换表单姓名" });
    const firstForm = document.getElementById("replaceable-profile-form") as HTMLFormElement;
    fireEvent.input(input, { target: { value: "" } });

    rerender(
      <>
        <TextInput
          aria-label="替换表单姓名"
          clearable
          defaultValue="初始姓名"
          form="replaceable-profile-form"
          name="name"
        />
        <form id="replaceable-profile-form" key="replacement" />
      </>
    );
    const replacementForm = document.getElementById("replaceable-profile-form") as HTMLFormElement;
    expect(replacementForm).not.toBe(firstForm);
    expect(input.form).toBe(replacementForm);
    act(() => replacementForm.reset());

    expect(input.value).toBe("初始姓名");
    await waitFor(() => expect(screen.getByRole("button", { name: "清除输入" })).toBeTruthy());
    expect(new FormData(replacementForm).get("name")).toBe("初始姓名");
  });

  it("honors cancelled reset on an external form owner", async () => {
    const onReset = vi.fn((event: React.FormEvent<HTMLFormElement>) => event.preventDefault());
    render(
      <>
        <form id="profile-form" onReset={onReset} />
        <TextInput
          aria-label="外部表单姓名"
          clearable
          defaultValue="初始"
          form="profile-form"
          name="name"
        />
      </>
    );
    const form = document.getElementById("profile-form") as HTMLFormElement;
    const input = screen.getByRole<HTMLInputElement>("textbox", { name: "外部表单姓名" });
    fireEvent.input(input, { target: { value: "保留修改" } });

    act(() => form.reset());
    await act(() => new Promise<void>((resolve) => window.setTimeout(resolve, 0)));

    expect(onReset).toHaveBeenCalledOnce();
    expect(input.value).toBe("保留修改");
    expect(new FormData(form).get("name")).toBe("保留修改");
  });

  it("uses native disabled and read-only FormData semantics", () => {
    const { container } = render(
      <form>
        <TextInput aria-label="禁用姓名" defaultValue="disabled" disabled name="disabledName" />
        <TextInput aria-label="只读姓名" defaultValue="readonly" name="readOnlyName" readOnly />
      </form>
    );
    const data = new FormData(container.querySelector("form")!);

    expect(data.has("disabledName")).toBe(false);
    expect(data.get("readOnlyName")).toBe("readonly");
  });

  it("announces loading without blocking edits or native form submission", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => event.preventDefault());
    const { rerender } = render(
      <form onSubmit={onSubmit}>
        <TextInput
          aria-label="异步校验名称"
          clearable
          defaultValue="Meu"
          loading={false}
          loadingLabel="正在校验名称"
          name="name"
        />
      </form>
    );
    const input = screen.getByRole<HTMLInputElement>("textbox", { name: "异步校验名称" });
    const clear = screen.getByRole("button", { name: "清除输入" });
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
    clear.focus();

    rerender(
      <form onSubmit={onSubmit}>
        <TextInput
          aria-label="异步校验名称"
          clearable
          defaultValue="Meu"
          loading
          loadingLabel="正在校验名称"
          name="name"
        />
      </form>
    );

    await waitFor(() => expect(document.activeElement).toBe(input));
    expect(input.getAttribute("aria-busy")).toBe("true");
    expect(input.getAttribute("data-state")).toBe("loading");
    expect(screen.getByRole("status", { name: "正在校验名称" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "清除输入" })).toBeNull();
    await user.type(input, " Mall");
    await user.keyboard("{Enter}");
    expect(input.value).toBe("Meu Mall");
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("preserves error semantics under loading and inherits provider reduced motion", () => {
    render(
      <ConfigProvider motion="reduced">
        <TextInput
          aria-label="校验失败名称"
          defaultValue="Meu"
          loading
          loadingLabel="重新校验中"
          status="error"
        />
      </ConfigProvider>
    );
    const input = screen.getByRole("textbox", { name: "校验失败名称" });
    const provider = document.querySelector('[data-meu-component="config-provider"]');

    expect(provider && provider.getAttribute("data-meu-motion")).toBe("reduced");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("data-state")).toBe("loading");
    expect(input.className.includes("status_error")).toBe(true);
    expect(screen.getByRole("status", { name: "重新校验中" })).toBeTruthy();
  });

  it("applies explicit direction to the visual root and native input", () => {
    render(<TextInput aria-label="RTL 名称" clearable defaultValue="متجر" dir="rtl" />);
    const input = screen.getByRole("textbox", { name: "RTL 名称" });

    expect(input.getAttribute("dir")).toBe("rtl");
    expect(input.parentElement && input.parentElement.getAttribute("dir")).toBe("rtl");
  });

  it("localizes the clear action and removes it from read-only fields", () => {
    const { rerender } = render(
      <ConfigProvider locale="en-US">
        <TextInput aria-label="Name" clearable defaultValue="Meu" />
      </ConfigProvider>
    );
    expect(screen.getByRole("button", { name: "Clear input" })).toBeTruthy();

    rerender(
      <ConfigProvider locale="en-US">
        <TextInput aria-label="Name" clearable defaultValue="Meu" readOnly />
      </ConfigProvider>
    );
    expect(screen.queryByRole("button", { name: "Clear input" })).toBeNull();
    expect(screen.getByRole("textbox", { name: "Name" }).getAttribute("data-state")).toBe(
      "readonly"
    );
  });

  it.each([
    ["false", "false", "default"],
    [false, "false", "default"],
    ["grammar", "grammar", "error"],
    ["spelling", "spelling", "error"]
  ] as const)(
    "preserves aria-invalid=%s without collapsing its semantics",
    (ariaInvalid, expectedAttribute, expectedState) => {
      render(<TextInput aria-label="语义输入框" aria-invalid={ariaInvalid} />);
      const input = screen.getByRole("textbox", { name: "语义输入框" });

      expect(input.getAttribute("aria-invalid")).toBe(expectedAttribute);
      expect(input.getAttribute("data-state")).toBe(expectedState);
    }
  );
});
