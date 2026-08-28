// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Field } from "../Field";
import { PasscodeInput } from "./PasscodeInput";
import type { PasscodeInputRef } from "./types";

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
    const onChange = vi.fn();
    render(<PasscodeInput aria-label="验证码" length={4} onChange={onChange} />);
    const input = screen.getByLabelText<HTMLInputElement>("验证码");

    fireEvent.change(input, { target: { value: "1a23４5" } });
    expect(input.value).toBe("1235");
    expect(onChange).toHaveBeenCalledWith("1235", { source: "native" });
    expect(document.querySelectorAll('[data-filled="true"]')).toHaveLength(4);
  });

  it("keeps controlled value authoritative", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <PasscodeInput aria-label="受控验证码" value="12" onChange={onChange} />
    );
    const input = screen.getByLabelText<HTMLInputElement>("受控验证码");
    fireEvent.change(input, { target: { value: "123" } });
    expect(onChange).toHaveBeenCalledWith("123", { source: "native" });
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

  it("composes the non-modal NumberKeyboard without duplicating value ownership", async () => {
    const onChange = vi.fn();
    const onConfirm = vi.fn();
    render(
      <PasscodeInput
        aria-label="支付密码"
        length={3}
        keyboard={{ confirmLabel: "完成", onConfirm, title: "支付密码键盘" }}
        onChange={onChange}
      />
    );
    const input = screen.getByLabelText<HTMLInputElement>("支付密码");
    expect(input.readOnly).toBe(true);
    fireEvent.focus(input);
    expect(screen.getByRole("group", { name: "支付密码键盘" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.keyDown(input, { key: "2" });
    fireEvent.click(screen.getByRole("button", { name: "删除上一位" }));
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    expect(input.value).toBe("13");
    expect(onChange).toHaveBeenNthCalledWith(1, "1", { source: "keyboard" });
    expect(onChange).toHaveBeenNthCalledWith(2, "12", { source: "keyboard" });
    expect(onChange).toHaveBeenNthCalledWith(3, "1", { source: "delete" });

    fireEvent.click(screen.getByRole("button", { name: "完成" }));
    expect(onConfirm).toHaveBeenCalledWith("13");
    await waitFor(() => expect(screen.queryByRole("group", { name: "支付密码键盘" })).toBeNull());
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
});
