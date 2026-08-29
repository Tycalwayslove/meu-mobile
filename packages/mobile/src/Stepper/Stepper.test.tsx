// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Field } from "../Field";
import { Stepper } from "./Stepper";

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

  it("inherits Field labelling and error semantics", () => {
    render(
      <Field label="购买数量" error="库存不足">
        <Stepper />
      </Field>
    );

    const input = screen.getByRole("spinbutton", { name: "购买数量" });
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toContain("error");
  });

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
});
