// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { NumberKeyboard } from "./NumberKeyboard";

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("NumberKeyboard", () => {
  it("server-renders without reading browser globals", () => {
    const markup = renderToString(<NumberKeyboard open aria-label="数字键盘" />);
    expect(markup).toContain('role="group"');
    expect(markup).toContain('aria-label="数字键盘"');
    expect(markup).toContain('data-meu-overlay-layer="number-keyboard"');
  });

  it("emits digit, decimal and custom-key intentions without owning a value", () => {
    const onInput = vi.fn();
    const { rerender } = render(
      <NumberKeyboard open mode="decimal" title="金额键盘" onInput={onInput} />
    );

    expect(screen.getByRole("group", { name: "金额键盘" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "小数点" }));
    expect(onInput).toHaveBeenNthCalledWith(1, "1", { source: "digit" });
    expect(onInput).toHaveBeenNthCalledWith(2, ".", { source: "decimal" });

    rerender(
      <NumberKeyboard
        open
        aria-label="证件号码键盘"
        extraKey={{ ariaLabel: "字母 X", label: "X", value: "X" }}
        onInput={onInput}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "字母 X" }));
    expect(onInput).toHaveBeenLastCalledWith("X", { source: "extra" });
  });

  it("reports close-button, Escape and confirm reasons in controlled mode", () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <NumberKeyboard
        open
        aria-label="确认键盘"
        confirmLabel="确定"
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "收起" }));
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: "确定" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenNthCalledWith(1, false, { reason: "close-button" });
    expect(onOpenChange).toHaveBeenNthCalledWith(2, false, { reason: "escape" });
    expect(onOpenChange).toHaveBeenNthCalledWith(3, false, { reason: "confirm" });
  });

  it("routes Escape only to the most recently opened keyboard", () => {
    const onFirstOpenChange = vi.fn();
    const onSecondOpenChange = vi.fn();
    const { rerender } = render(
      <>
        <NumberKeyboard open aria-label="第一层键盘" onOpenChange={onFirstOpenChange} />
        <NumberKeyboard
          open
          aria-label="第二层键盘"
          closeOnEscape={false}
          onOpenChange={onSecondOpenChange}
        />
      </>
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onFirstOpenChange).not.toHaveBeenCalled();
    expect(onSecondOpenChange).not.toHaveBeenCalled();

    rerender(
      <>
        <NumberKeyboard open aria-label="第一层键盘" onOpenChange={onFirstOpenChange} />
        <NumberKeyboard open aria-label="第二层键盘" onOpenChange={onSecondOpenChange} />
      </>
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onFirstOpenChange).not.toHaveBeenCalled();
    expect(onSecondOpenChange).toHaveBeenCalledWith(false, { reason: "escape" });

    onSecondOpenChange.mockClear();
    rerender(
      <>
        <NumberKeyboard open aria-label="第一层键盘" onOpenChange={onFirstOpenChange} />
        <NumberKeyboard open={false} aria-label="第二层键盘" />
      </>
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onFirstOpenChange).toHaveBeenCalledWith(false, { reason: "escape" });
    expect(onSecondOpenChange).not.toHaveBeenCalled();
  });

  it("keeps the current input focused for pointer users while buttons remain native", () => {
    const input = document.createElement("input");
    document.body.append(input);
    input.focus();
    render(<NumberKeyboard open aria-label="焦点键盘" />);
    const digit = screen.getByRole("button", { name: "2" });

    expect(fireEvent.mouseDown(digit)).toBe(false);
    fireEvent.click(digit);
    expect(document.activeElement).toBe(input);

    digit.focus();
    fireEvent.keyDown(digit, { key: "Enter" });
    expect(document.activeElement).toBe(digit);
    input.remove();
  });

  it("repeats backspace after a long press and suppresses the trailing click", () => {
    vi.useFakeTimers();
    const onDelete = vi.fn();
    const { unmount } = render(
      <NumberKeyboard open aria-label="连续删除键盘" onDelete={onDelete} />
    );
    const backspace = screen.getByRole("button", { name: "删除上一位" });

    fireEvent.pointerDown(backspace, { button: 0 });
    vi.advanceTimersByTime(840);
    expect(onDelete).toHaveBeenCalledTimes(3);
    expect(onDelete).toHaveBeenLastCalledWith({ repeated: true });

    fireEvent.pointerUp(backspace, { button: 0 });
    fireEvent.click(backspace);
    expect(onDelete).toHaveBeenCalledTimes(3);
    unmount();
  });

  it("keeps close available while disabling input and confirm keys", () => {
    const onInput = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <NumberKeyboard
        open
        aria-label="禁用键盘"
        confirmLabel="提交"
        disabled
        onInput={onInput}
        onOpenChange={onOpenChange}
      />
    );

    expect(screen.getByRole<HTMLButtonElement>("button", { name: "1" }).disabled).toBe(true);
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "删除上一位" }).disabled).toBe(
      true
    );
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "提交" }).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "收起" }));
    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: "close-button" });
    expect(onInput).not.toHaveBeenCalled();
  });

  it("uses localized labels, shuffles only digits, and hides force-mounted content", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const { rerender } = render(
      <ConfigProvider locale="en-US">
        <NumberKeyboard open randomOrder />
      </ConfigProvider>
    );
    const group = screen.getByRole("group", { name: "Number keyboard" });
    const renderedDigits = Array.from(group.querySelectorAll<HTMLButtonElement>("[data-key]"))
      .map((button) => button.dataset.key)
      .filter((value): value is string => Boolean(value && /^\d$/.test(value)));
    expect(renderedDigits).toHaveLength(10);
    expect(new Set(renderedDigits)).toEqual(
      new Set(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"])
    );
    expect(renderedDigits).not.toEqual(["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]);
    expect(screen.getByRole("button", { name: "Delete last digit" })).toBeTruthy();

    rerender(
      <ConfigProvider locale="en-US">
        <NumberKeyboard open={false} forceMount />
      </ConfigProvider>
    );
    const layer = document.querySelector('[data-meu-overlay-layer="number-keyboard"]');
    expect(layer ? layer.getAttribute("aria-hidden") : null).toBe("true");
    expect(screen.queryByRole("group", { name: "Number keyboard" })).toBeNull();
  });
});
