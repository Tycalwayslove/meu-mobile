// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
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
});
