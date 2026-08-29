// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Field } from "../Field";
import { Stepper } from "./Stepper";

afterEach(() => {
  vi.useRealTimers();
});

describe("Stepper", () => {
  it("increments, decrements and respects numeric boundaries", () => {
    const onChange = vi.fn();
    render(<Stepper aria-label="数量" defaultValue={1} min={0} max={2} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "增加" }));
    expect(screen.getByRole("spinbutton", { name: "数量" })).toHaveProperty("value", "2");
    expect(onChange).toHaveBeenLastCalledWith(2);
    expect(screen.getByRole("button", { name: "增加" })).toHaveProperty("disabled", true);

    fireEvent.click(screen.getByRole("button", { name: "减少" }));
    expect(onChange).toHaveBeenLastCalledWith(1);

    fireEvent.keyDown(screen.getByRole("spinbutton", { name: "数量" }), { key: "ArrowDown" });
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it("commits decimal input to the configured step and allows empty values", () => {
    const onChange = vi.fn();
    render(
      <Stepper
        aria-label="重量"
        defaultValue={1}
        step={0.25}
        precision={2}
        allowEmpty
        onChange={onChange}
      />
    );
    const input = screen.getByRole("spinbutton", { name: "重量" });

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "1.37" } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenLastCalledWith(1.25);
    expect(input).toHaveProperty("value", "1.25");

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it("honors inputMode and commits decimal-comma paste and IME text", () => {
    const onChange = vi.fn();
    const onPaste = vi.fn();
    render(
      <Stepper
        aria-label="重量"
        defaultValue={1}
        min={-10}
        max={10}
        step={0.25}
        inputMode="text"
        onChange={onChange}
        onPaste={onPaste}
      />
    );
    const input = screen.getByRole("spinbutton", { name: "重量" });
    expect(input.getAttribute("inputmode")).toBe("text");

    fireEvent.focus(input);
    fireEvent.paste(input, { clipboardData: { getData: () => "-1,25" } });
    fireEvent.change(input, { target: { value: "-1,25" } });
    fireEvent.blur(input);
    expect(onPaste).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenLastCalledWith(-1.25);

    fireEvent.focus(input);
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: "2,5" } });
    fireEvent.keyDown(input, { isComposing: true, key: "ArrowUp" });
    expect(onChange).toHaveBeenCalledTimes(1);
    fireEvent.compositionEnd(input);
    fireEvent.blur(input);
    expect(onChange).toHaveBeenLastCalledWith(2.5);
  });

  it("rejects pasted exponent, hexadecimal and grouped-number syntax", () => {
    const onChange = vi.fn();
    render(<Stepper aria-label="数量" defaultValue={2} onChange={onChange} />);
    const input = screen.getByRole("spinbutton", { name: "数量" });

    for (const draft of ["1e2", "0x10", "1 000", "1,2.3"]) {
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: draft } });
      fireEvent.blur(input);
      expect(input).toHaveProperty("value", "2");
    }
    expect(onChange).not.toHaveBeenCalled();
  });

  it("inherits Field labelling and error semantics", () => {
    render(
      <Field label="购买数量" error="库存不足">
        <Stepper aria-invalid="grammar" />
      </Field>
    );

    const input = screen.getByRole("spinbutton", { name: "购买数量" });
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toContain("error");
  });

  it("merges nested Field and caller accessibility relationships", () => {
    render(
      <>
        <span id="quantity-name">订单数量</span>
        <span id="quantity-hint">按箱购买</span>
        <Field label="购买数量" description="每箱六件">
          <div>
            <Stepper aria-labelledby="quantity-name" aria-describedby="quantity-hint" />
          </div>
        </Field>
      </>
    );

    const input = screen.getByRole("spinbutton", { name: "订单数量 购买数量" });
    expect(input.getAttribute("aria-labelledby")).toContain("quantity-name");
    expect(input.getAttribute("aria-labelledby")).toContain("label");
    expect(input.getAttribute("aria-describedby")).toContain("quantity-hint");
    expect(input.getAttribute("aria-describedby")).toContain("description");
  });

  it.each([
    [false, "false", "default"],
    ["false", "false", "default"],
    ["grammar", "grammar", "error"],
    ["spelling", "spelling", "error"]
  ] as const)(
    "preserves aria-invalid=%s on the spinbutton",
    (ariaInvalid, expectedAttribute, expectedState) => {
      render(<Stepper aria-invalid={ariaInvalid} aria-label="语义步进器" />);
      const input = screen.getByRole("spinbutton", { name: "语义步进器" });
      expect(input.getAttribute("aria-invalid")).toBe(expectedAttribute);
      const root = input.parentElement;
      expect(root && root.getAttribute("data-state")).toBe(expectedState);
    }
  );

  it("normalizes defaults, controlled values and reversed bounds", () => {
    const { rerender } = render(
      <Stepper aria-label="数量" min={10} max={0} step={3} defaultValue={8} />
    );
    const input = screen.getByRole("spinbutton", { name: "数量" });
    expect(input).toHaveProperty("value", "9");
    expect(input.getAttribute("aria-valuemin")).toBe("0");
    expect(input.getAttribute("aria-valuemax")).toBe("9");

    rerender(<Stepper aria-label="数量" min={0} max={10} step={2} value={99} />);
    expect(input).toHaveProperty("value", "10");
  });

  it("uses the last reachable step as its effective maximum", () => {
    const onChange = vi.fn();
    render(
      <Stepper aria-label="数量" min={0} max={10} step={6} defaultValue={0} onChange={onChange} />
    );
    const input = screen.getByRole("spinbutton", { name: "数量" });

    fireEvent.keyDown(input, { key: "End" });
    expect(input).toHaveProperty("value", "6");
    expect(input.getAttribute("aria-valuemax")).toBe("6");
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenLastCalledWith(6);
    expect(screen.getByRole("button", { name: "增加" })).toHaveProperty("disabled", true);
  });

  it("promotes coarse precision so fractional steps and minima keep progressing", () => {
    const onChange = vi.fn();
    render(
      <Stepper
        aria-label="剂量"
        min={0.005}
        max={0.05}
        step={0.005}
        precision={2}
        defaultValue={0.005}
        onChange={onChange}
      />
    );
    const increment = screen.getByRole("button", { name: "增加" });
    fireEvent.click(increment);
    fireEvent.click(increment);

    expect(screen.getByRole("spinbutton", { name: "剂量" })).toHaveProperty("value", "0.015");
    expect(onChange).toHaveBeenNthCalledWith(1, 0.01);
    expect(onChange).toHaveBeenNthCalledWith(2, 0.015);
  });

  it("falls back to inferred precision when an explicit precision is not finite", () => {
    const { rerender } = render(
      <Stepper aria-label="数量" defaultValue={0} step={0.25} precision={Number.NaN} />
    );
    fireEvent.click(screen.getByRole("button", { name: "增加" }));
    expect(screen.getByRole("spinbutton", { name: "数量" })).toHaveProperty("value", "0.25");

    rerender(
      <Stepper
        key="infinite-precision"
        aria-label="数量"
        defaultValue={0}
        step={0.125}
        precision={Number.POSITIVE_INFINITY}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "增加" }));
    expect(screen.getByRole("spinbutton", { name: "数量" })).toHaveProperty("value", "0.125");
  });

  it("publishes only the final step when a button follows an edited draft", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Stepper aria-label="数量" defaultValue={1} onChange={onChange} />);
    const input = screen.getByRole("spinbutton", { name: "数量" });

    await user.click(input);
    await user.clear(input);
    await user.type(input, "5");
    expect(input.getAttribute("aria-valuenow")).toBe("5");

    await user.click(screen.getByRole("button", { name: "增加" }));
    expect(input).toHaveProperty("value", "6");
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenLastCalledWith(6);
  });

  it("does not expose a stale ARIA value for incomplete drafts", () => {
    render(<Stepper aria-label="数量" defaultValue={1} />);
    const input = screen.getByRole("spinbutton", { name: "数量" });

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "-" } });
    expect(input.getAttribute("aria-valuenow")).toBeNull();
  });

  it("accepts a decimal comma and rolls invalid drafts back on blur", () => {
    const onChange = vi.fn();
    render(<Stepper aria-label="重量" defaultValue={1} step={0.1} onChange={onChange} />);
    const input = screen.getByRole("spinbutton", { name: "重量" });

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "1,4" } });
    fireEvent.blur(input);
    expect(input).toHaveProperty("value", "1.4");
    expect(onChange).toHaveBeenLastCalledWith(1.4);

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "not-a-number" } });
    fireEvent.blur(input);
    expect(input).toHaveProperty("value", "1.4");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("allows consumers to cancel built-in key handling and ignores IME key events", () => {
    const onChange = vi.fn();
    const onKeyDown = vi.fn((event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "ArrowUp") event.preventDefault();
    });
    render(
      <Stepper aria-label="数量" defaultValue={1} onChange={onChange} onKeyDown={onKeyDown} />
    );
    const input = screen.getByRole("spinbutton", { name: "数量" });

    fireEvent.keyDown(input, { key: "ArrowUp" });
    fireEvent.keyDown(input, { key: "ArrowDown", keyCode: 229 });
    expect(onChange).not.toHaveBeenCalled();
    expect(input).toHaveProperty("value", "1");
  });

  it("keeps read-only controlled and uncontrolled values immutable for built-in keys", () => {
    const onChange = vi.fn();
    const onKeyDown = vi.fn();
    render(
      <form aria-label="订单">
        <Stepper
          aria-label="非受控件数"
          name="uncontrolled"
          defaultValue={1}
          min={0}
          max={2}
          readOnly
          onChange={onChange}
          onKeyDown={onKeyDown}
        />
        <Stepper
          aria-label="受控件数"
          name="controlled"
          value={1}
          min={0}
          max={2}
          readOnly
          onChange={onChange}
          onKeyDown={onKeyDown}
        />
      </form>
    );
    const form = screen.getByRole("form", { name: "订单" });
    if (!(form instanceof HTMLFormElement)) throw new Error("Expected a form element");
    const uncontrolled = screen.getByRole("spinbutton", { name: "非受控件数" });
    const controlled = screen.getByRole("spinbutton", { name: "受控件数" });

    for (const input of [uncontrolled, controlled]) {
      for (const key of ["ArrowUp", "ArrowDown", "Home", "End"]) {
        fireEvent.keyDown(input, { key });
      }
      expect(input).toHaveProperty("value", "1");
    }

    expect(onKeyDown).toHaveBeenCalledTimes(8);
    expect(onChange).not.toHaveBeenCalled();
    expect(new FormData(form).get("uncontrolled")).toBe("1");
    expect(new FormData(form).get("controlled")).toBe("1");
  });

  it("excludes disabled values from FormData and blocks every step control", () => {
    const onChange = vi.fn();
    render(
      <form aria-label="订单">
        <Stepper
          aria-label="禁用件数"
          name="quantity"
          defaultValue={2}
          disabled
          repeatOnLongPress
          onChange={onChange}
        />
      </form>
    );
    const form = screen.getByRole("form", { name: "订单" });
    if (!(form instanceof HTMLFormElement)) throw new Error("Expected a form element");
    expect(new FormData(form).get("quantity")).toBeNull();
    expect(screen.getByRole("spinbutton", { name: "禁用件数" })).toHaveProperty("disabled", true);
    for (const button of screen.getAllByRole("button")) {
      expect(button).toHaveProperty("disabled", true);
      fireEvent.click(button);
    }
    expect(onChange).not.toHaveBeenCalled();
  });

  it("repeats a long press, suppresses its trailing click and stops on pointer release", async () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(<Stepper aria-label="数量" defaultValue={1} repeatOnLongPress onChange={onChange} />);
    const increment = screen.getByRole("button", { name: "增加" });

    fireEvent.pointerDown(increment, { button: 0, isPrimary: true, pointerId: 7 });
    await act(() => {
      vi.advanceTimersByTime(700);
      return Promise.resolve();
    });
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(screen.getByRole("spinbutton", { name: "数量" })).toHaveProperty("value", "4");

    fireEvent.pointerUp(increment, { pointerId: 7 });
    fireEvent.click(increment);
    await act(() => {
      vi.advanceTimersByTime(500);
      return Promise.resolve();
    });
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it("does not schedule repetition when an edited draft is already at the boundary", async () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(
      <Stepper aria-label="数量" defaultValue={1} max={2} repeatOnLongPress onChange={onChange} />
    );
    const input = screen.getByRole("spinbutton", { name: "数量" });
    const increment = screen.getByRole("button", { name: "增加" });

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "2" } });
    fireEvent.pointerDown(increment, { button: 0, isPrimary: true, pointerId: 12 });
    await act(() => {
      vi.advanceTimersByTime(500);
      return Promise.resolve();
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("stops long-press repetition on pointer cancellation and unmount", async () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    const { unmount } = render(
      <Stepper aria-label="数量" defaultValue={1} repeatOnLongPress onChange={onChange} />
    );
    const increment = screen.getByRole("button", { name: "增加" });

    fireEvent.pointerDown(increment, { button: 0, isPrimary: true, pointerId: 8 });
    await act(() => {
      vi.advanceTimersByTime(500);
      return Promise.resolve();
    });
    expect(onChange).toHaveBeenCalledOnce();
    fireEvent.pointerCancel(increment, { pointerId: 8 });
    fireEvent.click(increment);
    await act(() => {
      vi.advanceTimersByTime(500);
      return Promise.resolve();
    });
    expect(onChange).toHaveBeenCalledOnce();
    expect(screen.getByRole("spinbutton", { name: "数量" })).toHaveProperty("value", "2");

    fireEvent.pointerDown(increment, { button: 0, isPrimary: true, pointerId: 9 });
    unmount();
    await act(() => {
      vi.advanceTimersByTime(1000);
      return Promise.resolve();
    });
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("stops an active repeat when the component becomes read-only", async () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    const { rerender } = render(
      <Stepper aria-label="数量" defaultValue={1} repeatOnLongPress onChange={onChange} />
    );
    const increment = screen.getByRole("button", { name: "增加" });
    fireEvent.pointerDown(increment, { button: 0, isPrimary: true, pointerId: 11 });
    await act(() => {
      vi.advanceTimersByTime(500);
      return Promise.resolve();
    });
    expect(onChange).toHaveBeenCalledOnce();

    rerender(
      <Stepper aria-label="数量" defaultValue={1} repeatOnLongPress readOnly onChange={onChange} />
    );
    await act(() => {
      vi.advanceTimersByTime(500);
      return Promise.resolve();
    });

    expect(onChange).toHaveBeenCalledOnce();
    expect(screen.getByRole("spinbutton", { name: "数量" })).toHaveProperty("value", "2");
    expect(screen.getByRole("button", { name: "增加" })).toHaveProperty("disabled", true);
  });

  it("commits an edited draft when a step press cancels before repetition", () => {
    const onChange = vi.fn();
    render(<Stepper aria-label="数量" defaultValue={1} repeatOnLongPress onChange={onChange} />);
    const input = screen.getByRole("spinbutton", { name: "数量" });
    const increment = screen.getByRole("button", { name: "增加" });

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "5" } });
    fireEvent.pointerDown(increment, { button: 0, isPrimary: true, pointerId: 10 });
    fireEvent.blur(input);
    fireEvent.pointerCancel(increment, { pointerId: 10 });

    expect(input).toHaveProperty("value", "5");
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenLastCalledWith(5);
  });

  it("propagates required semantics and exposes button-control relationships", () => {
    render(
      <Field label="购买数量" required>
        <Stepper allowEmpty defaultValue={null} />
      </Field>
    );
    const input = screen.getByRole("spinbutton", { name: "购买数量" });
    expect(input).toHaveProperty("required", true);
    expect(input.getAttribute("aria-required")).toBe("true");
    for (const button of screen.getAllByRole("button")) {
      expect(button.getAttribute("aria-controls")).toBe(input.id);
    }
  });

  it("participates in FormData and restores its default on form reset", async () => {
    const onChange = vi.fn();
    render(
      <form aria-label="订单">
        <Stepper aria-label="件数" name="quantity" defaultValue={2} onChange={onChange} />
      </form>
    );
    const form = screen.getByRole("form", { name: "订单" });
    if (!(form instanceof HTMLFormElement)) throw new Error("Expected a form element");
    const input = screen.getByRole("spinbutton", { name: "件数" });
    fireEvent.click(screen.getByRole("button", { name: "增加" }));
    expect(new FormData(form).get("quantity")).toBe("3");

    form.reset();
    expect(input).toHaveProperty("value", "2");
    expect(new FormData(form).get("quantity")).toBe("2");
    await waitFor(() => expect(input).toHaveProperty("value", "2"));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("keeps the current value when native form reset is cancelled", async () => {
    render(
      <form aria-label="订单" onReset={(event) => event.preventDefault()}>
        <Stepper aria-label="件数" name="quantity" defaultValue={2} />
      </form>
    );
    const form = screen.getByRole("form", { name: "订单" });
    if (!(form instanceof HTMLFormElement)) throw new Error("Expected a form element");
    const input = screen.getByRole("spinbutton", { name: "件数" });
    fireEvent.click(screen.getByRole("button", { name: "增加" }));

    form.reset();
    await Promise.resolve();
    expect(input).toHaveProperty("value", "3");
    expect(new FormData(form).get("quantity")).toBe("3");
  });

  it("hydrates deterministic RTL markup without recoverable errors", async () => {
    const ui = (
      <Stepper aria-label="数量" defaultValue={2} min={0} max={8} dir="rtl" inputMode="numeric" />
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(ui);
    const recoverableErrors: unknown[] = [];
    let root: ReturnType<typeof hydrateRoot> | undefined;

    await act(async () => {
      root = hydrateRoot(container, ui, {
        onRecoverableError: (error) => recoverableErrors.push(error)
      });
      await Promise.resolve();
    });

    const input = container.querySelector('[role="spinbutton"]');
    if (!(input instanceof HTMLInputElement)) throw new Error("Expected a spinbutton");
    expect(input.value).toBe("2");
    expect(input.dir).toBe("rtl");
    expect(input.inputMode).toBe("numeric");
    expect(recoverableErrors).toEqual([]);

    act(() => {
      if (root !== undefined) root.unmount();
    });
  });
});
