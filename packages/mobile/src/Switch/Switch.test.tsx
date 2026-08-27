// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Field } from "../Field";
import { Switch } from "./Switch";

describe("Switch", () => {
  it("supports uncontrolled boolean changes with switch semantics", () => {
    const onChange = vi.fn();
    render(<Switch aria-label="消息通知" onChange={onChange} />);
    const control = screen.getByRole("switch", { name: "消息通知" });

    fireEvent.click(control);
    expect(control.getAttribute("aria-checked")).toBe("true");
    expect(onChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it("inherits a Field label and error description", () => {
    render(
      <Field label="自动续费" error="暂时无法修改">
        <Switch />
      </Field>
    );

    const control = screen.getByRole("switch", { name: "自动续费" });
    expect(control.getAttribute("aria-invalid")).toBe("true");
    expect(control.getAttribute("aria-describedby")).toContain("error");
  });

  it("blocks interaction while loading", () => {
    const onChange = vi.fn();
    render(<Switch aria-label="同步设置" loading onChange={onChange} />);
    const control = screen.getByRole("switch", { name: "同步设置" });

    fireEvent.click(control);
    expect(onChange).not.toHaveBeenCalled();
    expect(control).toHaveProperty("disabled", true);
    expect(control.getAttribute("aria-busy")).toBe("true");
  });
});
