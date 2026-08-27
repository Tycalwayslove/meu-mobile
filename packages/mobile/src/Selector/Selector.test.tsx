// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Field } from "../Field";
import { Selector } from "./Selector";

const options = [
  { value: "delivery", label: "配送" },
  { value: "pickup", label: "自提" },
  { value: "locker", label: "快递柜", disabled: true }
];

describe("Selector", () => {
  it("selects and clears a single native radio option", () => {
    const onChange = vi.fn();
    render(
      <Selector
        aria-label="履约方式"
        options={options}
        defaultValue={["delivery"]}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByRole("radio", { name: "自提" }));
    expect(onChange).toHaveBeenLastCalledWith(["pickup"], [options[1]]);
    fireEvent.click(screen.getByRole("radio", { name: "自提" }));
    expect(onChange).toHaveBeenLastCalledWith([], []);
  });

  it("maintains option order for multiple checkbox values", () => {
    const onChange = vi.fn();
    render(
      <Selector
        aria-label="服务范围"
        options={options}
        defaultValue={["pickup"]}
        multiple
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "配送" }));
    expect(onChange).toHaveBeenLastCalledWith(["delivery", "pickup"], [options[0], options[1]]);
    expect(screen.getByRole("checkbox", { name: "快递柜" })).toHaveProperty("disabled", true);
  });

  it("inherits Field labelling and error state", () => {
    render(
      <Field label="服务类型" error="请选择服务类型">
        <Selector options={options} />
      </Field>
    );

    const group = screen.getByRole("radiogroup", { name: "服务类型" });
    expect(group.getAttribute("aria-invalid")).toBe("true");
    expect(group.getAttribute("aria-describedby")).toContain("error");
  });
});
