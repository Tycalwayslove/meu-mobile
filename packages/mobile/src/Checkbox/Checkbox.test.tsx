// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Field } from "../Field";
import { Checkbox } from "./Checkbox";
import { CheckboxGroup } from "./CheckboxGroup";

describe("Checkbox", () => {
  it("supports uncontrolled boolean changes", () => {
    const onChange = vi.fn();
    render(<Checkbox onChange={onChange}>接收通知</Checkbox>);
    const checkbox = screen.getByRole("checkbox", { name: "接收通知" });

    fireEvent.click(checkbox);
    expect(checkbox).toHaveProperty("checked", true);
    expect(onChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it("exposes the native indeterminate state", () => {
    render(<Checkbox indeterminate>选择全部</Checkbox>);
    const checkbox = screen.getByRole("checkbox", { name: "选择全部" });

    expect(checkbox).toHaveProperty("indeterminate", true);
    expect(checkbox.getAttribute("aria-checked")).toBe("mixed");
  });

  it("keeps an indeterminate checkbox inert when disabled", () => {
    const onChange = vi.fn();
    render(
      <Checkbox disabled indeterminate onChange={onChange}>
        部分选择
      </Checkbox>
    );
    const checkbox = screen.getByRole("checkbox", { name: "部分选择" });

    expect(checkbox).toHaveProperty("indeterminate", true);
    fireEvent.click(checkbox);
    expect(checkbox).toHaveProperty("disabled", true);
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("CheckboxGroup", () => {
  it("manages array values and inherits Field semantics", () => {
    const onChange = vi.fn();
    render(
      <Field label="服务范围" error="至少选择一项">
        <CheckboxGroup<string> defaultValue={["delivery"]} onChange={onChange}>
          <Checkbox value="delivery">配送</Checkbox>
          <Checkbox value="pickup">自提</Checkbox>
        </CheckboxGroup>
      </Field>
    );

    expect(screen.getByRole("group", { name: "服务范围" }).getAttribute("data-state")).toBe(
      "error"
    );
    expect(screen.getByRole("checkbox", { name: "配送" })).toHaveProperty("checked", true);
    fireEvent.click(screen.getByRole("checkbox", { name: "自提" }));
    expect(onChange).toHaveBeenLastCalledWith(["delivery", "pickup"]);
  });
});
