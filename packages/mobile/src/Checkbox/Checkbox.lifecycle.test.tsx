// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Checkbox } from "./Checkbox";

describe("Checkbox commercial lifecycle", () => {
  it("keeps mixed visual state separate from checked validation and FormData", () => {
    const { container } = render(
      <form>
        <Checkbox indeterminate name="selection" required value="all">
          选择全部
        </Checkbox>
      </form>
    );
    const form = container.querySelector("form")!;
    const checkbox = screen.getByRole<HTMLInputElement>("checkbox", { name: "选择全部" });

    expect(checkbox.indeterminate).toBe(true);
    expect(checkbox.checked).toBe(false);
    expect(checkbox.validity.valueMissing).toBe(true);
    expect(form.checkValidity()).toBe(false);
    expect(new FormData(form).has("selection")).toBe(false);

    fireEvent.click(checkbox);
    expect(checkbox.indeterminate).toBe(true);
    expect(checkbox.checked).toBe(true);
    expect(checkbox.validity.valueMissing).toBe(false);
    expect(form.checkValidity()).toBe(true);
    expect(new FormData(form).get("selection")).toBe("all");
  });

  it("fires native invalid, then becomes valid and successful after selection", () => {
    const onInvalid = vi.fn((event: React.InvalidEvent<HTMLInputElement>) =>
      event.preventDefault()
    );
    const { container } = render(
      <form>
        <Checkbox name="terms" onInvalid={onInvalid} required value="accepted">
          同意条款
        </Checkbox>
      </form>
    );
    const form = container.querySelector("form")!;
    const checkbox = screen.getByRole<HTMLInputElement>("checkbox", { name: "同意条款" });

    expect(form.reportValidity()).toBe(false);
    expect(onInvalid).toHaveBeenCalledOnce();
    fireEvent.click(checkbox);
    expect(form.checkValidity()).toBe(true);
    expect(new FormData(form).get("terms")).toBe("accepted");
  });

  it("distinguishes readonly submission from disabled omission", () => {
    const { container } = render(
      <form>
        <Checkbox defaultChecked name="locked" readOnly value="yes">
          锁定值
        </Checkbox>
        <Checkbox defaultChecked disabled name="disabled" value="yes">
          禁用值
        </Checkbox>
      </form>
    );
    const form = container.querySelector("form")!;
    const locked = screen.getByRole<HTMLInputElement>("checkbox", { name: "锁定值" });
    const disabled = screen.getByRole<HTMLInputElement>("checkbox", { name: "禁用值" });
    const data = new FormData(form);

    expect(locked.tabIndex).toBe(0);
    expect(locked.checked).toBe(true);
    expect(disabled.disabled).toBe(true);
    expect(data.get("locked")).toBe("yes");
    expect(data.has("disabled")).toBe(false);
  });
});
