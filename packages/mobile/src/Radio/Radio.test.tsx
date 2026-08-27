// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Field } from "../Field";
import { Radio } from "./Radio";
import { RadioGroup } from "./RadioGroup";

describe("Radio", () => {
  it("supports standalone uncontrolled state", () => {
    const onChange = vi.fn();
    render(<Radio onChange={onChange}>默认地址</Radio>);
    const radio = screen.getByRole("radio", { name: "默认地址" });

    fireEvent.click(radio);
    expect(radio).toHaveProperty("checked", true);
    expect(onChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it("blocks programmatic change events while disabled", () => {
    const onChange = vi.fn();
    render(
      <Radio disabled onChange={onChange}>
        不可选择
      </Radio>
    );

    fireEvent.click(screen.getByRole("radio", { name: "不可选择" }));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("RadioGroup", () => {
  it("selects one value, shares a native name and inherits Field semantics", () => {
    const onChange = vi.fn();
    render(
      <Field label="配送方式" error="请选择配送方式">
        <RadioGroup<string> defaultValue="standard" onChange={onChange} required>
          <Radio value="standard">标准配送</Radio>
          <Radio value="express">急速配送</Radio>
        </RadioGroup>
      </Field>
    );

    const group = screen.getByRole("radiogroup", { name: "配送方式" });
    const standard = screen.getByRole("radio", { name: "标准配送" });
    const express = screen.getByRole("radio", { name: "急速配送" });
    expect(group.getAttribute("aria-invalid")).toBe("true");
    expect(standard.getAttribute("name")).toBe(express.getAttribute("name"));
    expect(standard).toHaveProperty("checked", true);

    fireEvent.click(express);
    expect(onChange).toHaveBeenCalledWith("express", expect.anything());
    expect(express).toHaveProperty("checked", true);
    expect(standard).toHaveProperty("checked", false);
  });
});
