// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import type { KeyboardEvent } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Field } from "../Field";
import { PasscodeInput } from "./PasscodeInput";
import type { PasscodeInputProps, PasscodeInputRef } from "./types";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("PasscodeInput", () => {
  it("server-renders a real labelled input without browser globals", () => {
    const html = renderToString(
      <PasscodeInput aria-label="验证码" defaultValue="12a34" length={4} />
    );
    expect(html).toContain('type="password"');
    expect(html).toContain('inputMode="numeric"');
    expect(html).toContain('value="1234"');
    expect(html).toContain('autoComplete="one-time-code"');
  });

  it("owns only uncontrolled state and reports normalized native changes", () => {
    const onChange = vi.fn<NonNullable<PasscodeInputProps["onChange"]>>();
    render(<PasscodeInput aria-label="验证码" length={4} onChange={onChange} />);
    const input = screen.getByLabelText<HTMLInputElement>("验证码");

    fireEvent.change(input, { target: { value: "1a23４5" } });
    expect(input.value).toBe("1235");
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange.mock.calls[0]![0]).toBe("1235");
    expect(onChange.mock.calls[0]![1].source).toBe("native");
    expect(onChange.mock.calls[0]![1].event).toBeTruthy();
    expect(document.querySelectorAll('[data-filled="true"]')).toHaveLength(4);
  });

  it("keeps controlled value authoritative", () => {
    const onChange = vi.fn<NonNullable<PasscodeInputProps["onChange"]>>();
    const { rerender } = render(
      <PasscodeInput aria-label="受控验证码" value="12" onChange={onChange} />
    );
    const input = screen.getByLabelText<HTMLInputElement>("受控验证码");
    fireEvent.change(input, { target: { value: "123" } });
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange.mock.calls[0]![0]).toBe("123");
    expect(onChange.mock.calls[0]![1].source).toBe("native");
    expect(onChange.mock.calls[0]![1].event).toBeTruthy();
    expect(input.value).toBe("12");

    rerender(<PasscodeInput aria-label="受控验证码" value="123" onChange={onChange} />);
    expect(input.value).toBe("123");
  });

  it("mirrors masked, plain, separated, focused and RTL visual states", () => {
    const { rerender } = render(
      <PasscodeInput aria-label="密码" defaultValue="12" length={4} separated />
    );
    const input = screen.getByLabelText<HTMLInputElement>("密码");
    expect(document.querySelectorAll("[data-meu-passcode-cell]")).toHaveLength(4);
    expect(document.querySelectorAll('[data-filled="true"]')).toHaveLength(2);
    expect(document.querySelectorAll('[data-filled="true"] span')).toHaveLength(2);

    fireEvent.focus(input);
    expect(document.querySelector('[data-active="true"]')).toBeTruthy();
    expect(document.querySelector('[data-active="true"] span')).toBeTruthy();

    rerender(
      <PasscodeInput
        aria-label="密码"
        value="אב"
        inputMode="text"
        length={4}
        direction="rtl"
        mask={false}
      />
    );
    const root = document.querySelector('[data-meu-component="passcode-input"]');
    const mirror = document.querySelector('[aria-hidden="true"]');
    expect(root ? root.getAttribute("dir") : null).toBe("rtl");
    expect(mirror ? mirror.textContent : null).toContain("אב");
  });

  it("announces completion once per completed value", async () => {
    const onComplete = vi.fn();
    const { rerender } = render(
      <PasscodeInput aria-label="验证码" value="1" length={2} onComplete={onComplete} />
    );
    rerender(<PasscodeInput aria-label="验证码" value="12" length={2} onComplete={onComplete} />);
    await waitFor(() => expect(onComplete).toHaveBeenCalledWith("12"));
    rerender(<PasscodeInput aria-label="验证码" value="12" length={2} onComplete={onComplete} />);
    expect(onComplete).toHaveBeenCalledTimes(1);
    rerender(<PasscodeInput aria-label="验证码" value="" length={2} onComplete={onComplete} />);
    rerender(<PasscodeInput aria-label="验证码" value="34" length={2} onComplete={onComplete} />);
    await waitFor(() => expect(onComplete).toHaveBeenCalledWith("34"));
  });

  it("does not announce a complete initial value until a later completion transition", async () => {
    const onComplete = vi.fn();
    const { rerender } = render(
      <PasscodeInput aria-label="验证码" value="12" length={2} onComplete={onComplete} />
    );
    await Promise.resolve();
    expect(onComplete).not.toHaveBeenCalled();

    rerender(<PasscodeInput aria-label="验证码" value="1" length={2} onComplete={onComplete} />);
    rerender(<PasscodeInput aria-label="验证码" value="34" length={2} onComplete={onComplete} />);
    await waitFor(() => expect(onComplete).toHaveBeenCalledWith("34"));
  });

  it("composes the non-modal NumberKeyboard without duplicating value ownership", async () => {
    const onChange = vi.fn<NonNullable<PasscodeInputProps["onChange"]>>();
    const onConfirm = vi.fn();
    render(
      <PasscodeInput
        aria-label="支付密码"
        length={3}
        keyboard={{ confirmLabel: "完成", onConfirm, title: "支付密码键盘" }}
        onChange={onChange}
      />
    );
    const input = screen.getByLabelText<HTMLInputElement>(/支付密码/);
    expect(input.readOnly).toBe(false);
    expect(input.inputMode).toBe("none");
    expect(input.getAttribute("aria-controls")).toBeNull();
    fireEvent.focus(input);
    const keyboard = screen.getByRole("group", { name: "支付密码键盘" });
    expect(input.getAttribute("aria-controls")).toBe(keyboard.id);

    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.keyDown(input, { key: "2" });
    fireEvent.click(screen.getByRole("button", { name: "删除上一位" }));
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    expect(input.value).toBe("13");
    expect(onChange).toHaveBeenNthCalledWith(1, "1", { source: "keyboard" });
    expect(onChange.mock.calls[1]![0]).toBe("12");
    expect(onChange.mock.calls[1]![1].source).toBe("hardware");
    expect(onChange.mock.calls[1]![1].event).toBeTruthy();
    expect(onChange).toHaveBeenNthCalledWith(
      3,
      "1",
      expect.objectContaining({ repeated: false, source: "delete" })
    );

    fireEvent.click(screen.getByRole("button", { name: "完成" }));
    expect(onConfirm).toHaveBeenCalledWith("13");
    await waitFor(() => expect(screen.queryByRole("group", { name: "支付密码键盘" })).toBeNull());
    expect(input.getAttribute("aria-controls")).toBeNull();
  });

  it("can close a custom keyboard when the passcode is complete", async () => {
    const onComplete = vi.fn();
    render(
      <PasscodeInput
        aria-label="短验证码"
        length={2}
        keyboard={{ closeOnComplete: true }}
        onComplete={onComplete}
      />
    );
    const input = screen.getByLabelText<HTMLInputElement>("短验证码");
    fireEvent.focus(input);
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "2" }));

    await waitFor(() => expect(onComplete).toHaveBeenCalledWith("12"));
    await waitFor(() => expect(screen.queryByRole("group", { name: "密码数字键盘" })).toBeNull());
  });

  it("inherits Field labels, errors, descriptions and imperative focus", () => {
    const ref = createRef<PasscodeInputRef>();
    render(
      <Field label="短信验证码" description="六位数字" error="验证码错误">
        <PasscodeInput ref={ref} status="error" />
      </Field>
    );
    const input = screen.getByLabelText<HTMLInputElement>("短信验证码");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toContain("description");
    expect(input.getAttribute("aria-describedby")).toContain("error");
    if (ref.current) ref.current.focus();
    expect(document.activeElement).toBe(input);
    expect(ref.current ? ref.current.input : null).toBe(input);
    if (ref.current) ref.current.blur();
    expect(document.activeElement).not.toBe(input);
  });

  it("merges Field and caller descriptions without duplicates and inherits required", () => {
    render(
      <>
        <span id="checkout-help">只用于本次支付</span>
        <Field label="支付密码" description="六位数字" required labelAssociation="native">
          <PasscodeInput aria-describedby="checkout-help checkout-help" />
        </Field>
      </>
    );
    const input = screen.getByLabelText<HTMLInputElement>(/支付密码/);
    const describedByValue = input.getAttribute("aria-describedby");
    const describedBy = describedByValue ? describedByValue.split(/\s+/) : [];
    expect(input.required).toBe(true);
    expect(describedBy.filter((id) => id === "checkout-help")).toHaveLength(1);
    expect(describedBy.some((id) => id.includes("description"))).toBe(true);
  });

  it("lets consumer keydown cancellation run before custom-keyboard input", () => {
    const onChange = vi.fn();
    const onKeyDown = vi.fn((event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "7") event.preventDefault();
    });
    render(
      <PasscodeInput aria-label="验证码" keyboard={{}} onChange={onChange} onKeyDown={onKeyDown} />
    );
    const input = screen.getByLabelText<HTMLInputElement>("验证码");
    fireEvent.keyDown(input, { key: "7" });
    expect(onKeyDown).toHaveBeenCalledOnce();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("can keep native editing and autofill available alongside NumberKeyboard", () => {
    const onChange = vi.fn();
    render(
      <PasscodeInput
        aria-label="验证码"
        keyboard={{ suppressNativeKeyboard: false }}
        onChange={onChange}
      />
    );
    const input = screen.getByLabelText<HTMLInputElement>("验证码");
    expect(input.readOnly).toBe(false);
    fireEvent.change(input, { target: { value: "123" } });
    expect(onChange).toHaveBeenCalledWith("123", expect.objectContaining({ source: "native" }));
  });

  it("keeps custom-keyboard fields constraint-validatable while suppressing pointer keyboards", () => {
    const calls: string[] = [];
    render(
      <form aria-label="支付表单">
        <PasscodeInput
          aria-label="支付密码"
          keyboard={{}}
          name="code"
          required
          onPointerDown={(event) => {
            calls.push(`consumer:${event.currentTarget.readOnly}`);
          }}
        />
      </form>
    );
    const input = screen.getByLabelText<HTMLInputElement>("支付密码");
    const form = screen.getByRole<HTMLFormElement>("form", { name: "支付表单" });

    expect(input.inputMode).toBe("none");
    expect(input.readOnly).toBe(false);
    expect(input.willValidate).toBe(true);
    expect(input.validity.valueMissing).toBe(true);
    expect(form.checkValidity()).toBe(false);

    fireEvent.pointerDown(input);
    expect(calls).toEqual(["consumer:false"]);
    expect(document.activeElement).toBe(input);
    expect(input.readOnly).toBe(false);
    expect(input.willValidate).toBe(true);
  });

  it("lets callers cancel the custom-keyboard pointer focus guard", () => {
    render(
      <PasscodeInput
        aria-label="验证码"
        keyboard={{}}
        onPointerDown={(event) => event.preventDefault()}
      />
    );
    const input = screen.getByLabelText<HTMLInputElement>("验证码");

    fireEvent.pointerDown(input);
    expect(document.activeElement).not.toBe(input);
    expect(input.readOnly).toBe(false);
  });

  it("resets uncontrolled state to the latest default without emitting change or completion", async () => {
    const onChange = vi.fn();
    const onComplete = vi.fn();
    const { rerender } = render(
      <form aria-label="验证码表单">
        <PasscodeInput
          aria-label="验证码"
          defaultValue="1"
          length={2}
          name="code"
          onChange={onChange}
          onComplete={onComplete}
        />
        <button type="reset">重置</button>
      </form>
    );
    rerender(
      <form aria-label="验证码表单">
        <PasscodeInput
          aria-label="验证码"
          defaultValue="4"
          length={2}
          name="code"
          onChange={onChange}
          onComplete={onComplete}
        />
        <button type="reset">重置</button>
      </form>
    );
    const input = screen.getByLabelText<HTMLInputElement>("验证码");
    fireEvent.change(input, { target: { value: "23" } });
    await waitFor(() => expect(onComplete).toHaveBeenCalledWith("23"));
    onChange.mockClear();
    onComplete.mockClear();

    fireEvent.click(screen.getByRole("button", { name: "重置" }));
    await waitFor(() => expect(input.value).toBe("4"));
    expect(onChange).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
    expect(new FormData(input.form as HTMLFormElement).get("code")).toBe("4");
  });

  it("keeps Unicode code points intact in text mode and deletes the last whole character", () => {
    const onChange = vi.fn();
    render(
      <PasscodeInput
        aria-label="短码"
        defaultValue="😀好"
        inputMode="text"
        keyboard={{}}
        length={2}
        mask={false}
        onChange={onChange}
      />
    );
    const input = screen.getByLabelText<HTMLInputElement>("短码");
    expect(input.maxLength).toBe(-1);
    expect(document.querySelectorAll('[data-filled="true"]')).toHaveLength(2);
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(onChange).toHaveBeenCalledWith(
      "😀",
      expect.objectContaining({ repeated: false, source: "delete" })
    );
  });

  it("closes a visible custom keyboard when becoming disabled", async () => {
    const { rerender } = render(<PasscodeInput aria-label="验证码" keyboard={{}} />);
    const input = screen.getByLabelText<HTMLInputElement>("验证码");
    fireEvent.focus(input);
    expect(screen.getByRole("group", { name: "密码数字键盘" })).toBeTruthy();

    rerender(<PasscodeInput aria-label="验证码" keyboard={{}} disabled />);
    await waitFor(() => expect(screen.queryByRole("group", { name: "密码数字键盘" })).toBeNull());
    expect(document.activeElement).not.toBe(input);
  });
});
